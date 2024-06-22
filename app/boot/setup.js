const express = require("express");

const app = express();
const PORT = 8080;

// middleware
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const morgan = require("morgan");
const verifyToken = require("../middleware/authentication");
const notFound = require("../middleware/notFound");
const healthCheck = require("../middleware/healthCheck");
const logger = require("../middleware/winston");
// validators

// routes
const todoRoutes = require("../routes/todo.routes");
const messageRoutes = require("../routes/message.routes");
const authRouter = require("../routes/auth.routes");
const movieRoutes = require("../routes/movie.routes");

// mongoDB connection
try {
  mongoose.connect("mongodb://localhost:27017/epita");
  logger.info("Connected to MongoDB");
} catch (error) {
  logger.error("Error Connecting to MongoDB");
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
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    notFound()
    app.use(morgan("combined", { stream: logger.stream }));
    app.use(cors());
    app.use(helmet());
    app.use(express.json());

    app.use(healthCheck);
    app.use("/todo", verifyToken, todoRoutes);

    // register routes
    app.use("/message", verifyToken, messageRoutes);
    app.use("/auth", authRouter);
    app.use("/movies", verifyToken, movieRoutes);

    // 404 error
    app.use(notFound);
  } catch (error) {
    logger.error(error.message);
  }
};

// handling uncaught exceptions
const handleError = () => {
  // 'process' is a built in object in nodejs
  // if uncaught exception, then execute this
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception occured");
    process.exit(1);
  });
};

// start application
const startApp = () => {
  try {
    // register core application level middleware
    registerCoreMiddleWare();

    app.listen(PORT, () => {
      logger.info("Server running on http://127.0.0.1:" + PORT);
    });

    // exit on uncaught exception
    handleError();
  } catch (error) {
    logger.error("startup :: Error while booting application");
    throw error;
  }
};

module.exports = { startApp };
