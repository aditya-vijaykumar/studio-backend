const express = require("express")
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const dbConfig = require("./config/db.config");

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

app.use('/', require('./routes/index.js'));
app.use('/api', require('./routes/api.js'));


const db = require("./models");

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });


/* 
Socket IO Section and code
 */

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;

  const role = socket.handshake.auth.role;
  if (!role) {
    return next(new Error("invalid role"));
  }
  socket.role = role;
  next();
});

var admins = 0;
const adminsList = []
const globalClients = []
io.on('connection', (socket) => {
  console.log(`A User named ${socket.username} is connected`)

  const clientList = [];

  if (socket.role == "admin") {
    //Scenario: Client is connected, a new admin has just joined
    if (admins < 1) {
      let theAdmin = {
        userID: socket.id,
        username: socket.username,
        role: socket.role
      }
      //All except the newly joined admin
      socket.broadcast.emit("admin is now online", {
        adminOnline: true,
        admin: theAdmin
      });
    }
    admins++
    // only admin requires the client list
    for (let [id, socket] of io.of("/").sockets) {
      if (socket.role == "client")
        clientList.push({
          userID: id,
          username: socket.username,
          role: socket.role
        });
    }
    //Send to the new admin
    socket.to(socket.id).emit("clientListForAdmin", clientList)
  } else {
    socket.emit("new client", {
      userID: socket.id,
      username: socket.username,
      role: socket.role,
      messages: [],
    })

    if (admins > 0) {
      let theAdmin = null
      for (let [id, socket] of io.of("/").sockets) {
        if (socket.role == "admin") {
          theAdmin = {
            userID: id,
            username: socket.username,
            role: socket.role
          }
          break
        }
      }
      //Send to the new client
      socket.to(socket.id).emit('adminAvailable', { adminOnline: true, admin: theAdmin })
    }
  }

  socket.on("private message", ({ content, to }) => {
    socket.to(to).emit("private message", {
      content,
      from: socket.id,
    });
  });

  socket.on('disconnect', () => {
    console.log('A User is disconnected')

    if (socket.role == "admin") {
      admins--
      if (admins < 1) {
        socket.broadcast.emit("adminUnavailable", {
          adminOnline: false,
          adminID: socket.id
        });
      }
    } else {
      socket.emit("client left", {
        userID: socket.id,
        username: socket.username,
      })
    }
  })

})

const PORT = process.env.PORT || 7070;

server.listen(PORT, console.log(`Server started on port ${PORT} `));
