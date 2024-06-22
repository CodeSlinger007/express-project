const express = require("express");

const app = express();
const PORT = 8080;

// middleware
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const verifyToken = require("../middleware/authentication");
const notFound = require("../middleware/notFound");
const healthCheck = require("../middleware/healthCheck");
// logger
// validators

// routes
const todoRoutes = require("../routes/todo.routes");
const messageRoutes = require("../routes/message.routes");
const authRouter = require("../routes/auth.routes");

// mongoDB connection
try {
  mongoose.connect("mongodb://localhost:27017/epita");
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Error Connecting to MongoDB");
}

const registerCoreMiddleWare = () => {
  try {
    app.use(
      session({
        secret: "1234",
        // Forces the session to be saved back to the session store, even if the session was never modified during the request
        resave: false,
        // Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified
        saveUninitialized: true,
        cookie: {
          secure: false,
          httpOnly: true,
        },
      })
    );
    app.use(cors());
    app.use(helmet());
    app.use(express.json());

    app.use(healthCheck);
    app.use("/todo", verifyToken, todoRoutes);

    // register routes
    app.use("/message", verifyToken, messageRoutes);
    app.use("/auth", authRouter);

    // 404 error
    app.use(notFound);
  } catch (error) {
    console.log(error.message);
  }
};

// handling uncaught exceptions
const handleError = () => {
  // 'process' is a built in object in nodejs
  // if uncaught exception, then execute this
  process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception occured");
    process.exit(1);
  });
};

// start application
const startApp = () => {
  try {
    // register core application level middleware
    registerCoreMiddleWare();

    app.listen(PORT, () => {
      console.log("Server running on http://127.0.0.1:" + PORT);
    });

    // exit on uncaught exception
    handleError();
  } catch (error) {
    console.log("startup :: Error while booting application");
    throw error;
  }
};

module.exports = { startApp };
