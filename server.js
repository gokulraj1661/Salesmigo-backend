const mongoose = require("mongoose");
const dotenv = require("dotenv");
const PORT = process.env.PORT || 8000;
const { createServer } = require("http");
const { Server } = require("socket.io");

process.on("uncaughtException", (err) => {
  console.log(`UNCAUGHT EXCEPTION! 💥 Shutting down...`);
  console.log(err.name, err.message);
  process.exit(1);
});

//initializing environment variables
dotenv.config({ path: "./.env" });

const app = require("./app.js");
const httpServer = createServer(app);

//connecting to our database
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(console.log("DB Connection Successful"));

//initializing socket instance
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// app.use(require("./SocketArchitecture/Websockets")(io));
//initializing our socket connection
io.on("connection", (socket) => {
  console.log("User with socketId %s connected", socket.id);
  // io.disconnectSockets();
  socket.on("disconnect", () => {
    console.log("User with socketId %s disconnected", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`app running on port ${PORT}...`);
});

//for any errors outside express
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log(`UNHANDLED REJECTION! 💥 Shutting down...`);
  httpServer.close(() => {
    process.exit(1);
  });
});

//for heroku shutdowns
process.on("SIGTERM", () => {
  console.log(`SIGTERM FROM HEROKU RECEIVED!  Shutting down gracefully...`);
  httpServer.close(() => {
    console.log(`💥 Process terminated`);
  });
});
