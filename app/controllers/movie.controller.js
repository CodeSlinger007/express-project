const statusCodes = require("../constants/statusCodes");
const pool = require("../boot/database/db_connect");
const logger = require("../middleware/winston");

const addMovie = async (req, res) => {
  const { title, release_date, author } = req.body;
  const { type, poster, backdrop_poster, overview } = req.body;

  if (!title || !release_date || !author || !type) {
    res
      .status(statusCodes.missingParameters)
      .json({ message: "Missing parameters" });
  } else {
    pool.query(
      `INSERT INTO movies(title, release_date, author, type, poster, backdrop_poster, overview) 
      VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [title, release_date, author, type, poster, backdrop_poster, overview],
      (err, rows) => {
        if (err) {
          logger.error(err.stack);
          res
            .status(statusCodes.queryError)
            .json({ error: "Exception occured while adding new movie" });
        } else {
          logger.info(rows);
          res.status(statusCodes.success).json({ message: "Movie added" });
        }
      }
    );
  }
};

const getMovies = async (req, res) => {
  pool.query(
    "SELECT * FROM movies GROUP BY movie_id, type;",
    (err, rows) => {
        
    }
  );
};

const getMovieById = async (req, res) => {};

const updateMovieById = async (req, res) => {};

const addMovieWithImage = async (req, res) => {};
