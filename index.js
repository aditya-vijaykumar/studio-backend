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
app.use('/api/admin', require('./routes/admin.js'));
app.use('/api/client', require('./routes/client.js'));


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

var theAdmin = null
const globalClients = []
io.on('connection', (socket) => {
  console.log(`A User named ${socket.username} is connected`)

  if (socket.role == "admin") {
    theAdmin = {
      userID: socket.id,
      username: socket.username,
      role: socket.role
    }
    socket.broadcast.emit("admin is now online", {
      adminOnline: true,
      admin: theAdmin
    });
    //Send to the new admin
    console.log(globalClients)
    socket.emit("clientListForAdmin", globalClients)
  } else {
    let newClientJoined = {
      userID: socket.id,
      username: socket.username,
      role: socket.role,
      hasNewMessages: false,
      messages: [],
    }
    if (globalClients.length < 1) {
      globalClients.push(newClientJoined)
      console.log('pushed the clients')
      socket.broadcast.emit("new-client", newClientJoined)

    } else {
      let boolFlag = false
      for (var i = 0; i < globalClients.length; i++) {
        if (globalClients[i].username == newClientJoined.username) {
          globalClients[i].userID = newClientJoined.userID
          boolFlag = true
          break
        }
      }
      if (!boolFlag) {
        globalClients.push(newClientJoined)
        console.log('pushed the clients')
        socket.broadcast.emit("new-client", newClientJoined)
      }
    }
    //To Alert the client about the admin
    if (theAdmin != null) {
      //Send to the new client
      socket.emit('adminAvailable', { adminOnline: true, admin: theAdmin })
    }
  }

  socket.on("private message", ({ content, to }) => {
    socket.to(to).emit("private message", {
      content,
      from: socket.id,
    });
  });

  socket.on('disconnect', () => {
    console.log(`A User named ${socket.username} is disconnected`)

    if (socket.role == "admin") {
      socket.broadcast.emit("adminUnavailable", {
        adminOnline: false
      });
      theAdmin = null
    } else {
      for (var i = 0; i < globalClients.length; i++) {
        if (globalClients[i].username == socket.username) {
          globalClients.splice(i, 1)
        }
      }
      socket.broadcast.emit("client-left", {
        userID: socket.id,
        username: socket.username,
      })
    }
  })

})

const PORT = process.env.PORT || 7070;

server.listen(PORT, console.log(`Server started on port ${PORT} `));
