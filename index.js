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

// simple route
// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to bezkoder application." });
// });

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

app.use('/', require('./routes/index.js'));
// app.use('/', require('./routes/auth.routes.js'));
app.use('/', require('./routes/user.routes.js'));


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

var admins = 0;
io.on('connection', (socket) => {
  console.log('A User is connected')

  const clientList = [];
  for (let [id, socket] of io.of("/").sockets) {
    if (socket.role == "client")
      clientList.push({
        userID: id,
        username: socket.username,
        role: socket.role
      });

    if (socket.role == "admin") {
      admins++
    }
  }
  if (socket.role == "admin") {
    socket.emit("clientListForAdmin", clientList)
  } else {
    socket.emit("new client", {
      userID: socket.id,
      username: socket.username,
      role: socket.role
    })
  }

  if (admins > 0) {
    socket.emit('adminAvailable', { adminOnline: true })
    socket.broadcast.emit("admin is now online", {
      adminOnline: true,
    });
  }

  socket.on("private message", ({ content, to }) => {
    socket.to(to).emit("private message", {
      content,
      from: socket.id,
    });
  });


})

const PORT = process.env.PORT || 7070;

server.listen(PORT, console.log(`Server started on port ${PORT} `));
