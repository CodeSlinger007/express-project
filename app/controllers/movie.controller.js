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
  pool.query("SELECT * FROM movies GROUP BY movie_id, type;", (err, rows) => {
    if (err) {
      logger.error(err.stack);
      res
        .status(statusCodes.queryError)
        .json({ error: "Exception occured while getting movies" });
    } else {
      // Group movies by type
      const groupedMovies = rows.rows.reduce((acc, movie) => {
        const { type } = movie;
        if (!acc[type]) {
          console.log(type);
          acc[type] = [];
        }
        acc[type].push(movie);
        return acc;
      }, {});
      res.status(statusCodes.success).json({ movies: groupedMovies });
    }
  });
};

const getMovieById = async (req, res) => {
  const { id } = req.params;

  let movie_id = parseInt(id);

  if (movie_id === NaN) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "id must be a number" });
  }
  pool.query(
    "SELECT * FROM movies WHERE movie_id = $1",
    [movie_id],
    (err, rows) => {
      if (err) {
        logger.error(err.stack);
        res.status(statusCodes.queryError).json({
          error: `Exception occured while getting movie with id=${movie_id}`,
        });
      } else {
        res.status(statusCodes.success).json({ movie: rows.rows });
      }
    }
  );
};

const updateMovieById = async (req, res) => {};

const addMovieWithImage = async (req, res) => {
  const { title, release_date, author } = req.body;
  const { type, movie_url } = req.body;

  if (!title || !release_date || !author || !type || !movie_url) {
    res
      .status(statusCodes.missingParameters)
      .json({ message: "Missing information" });
  } else {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO movies(title, release_date, author, type) 
        VALUES ($1, $2, $3, $4) RETURNING movie_id;`,
        [title, release_date, author, type]
      );

      logger.info("MOVIE RESULT: ", result.rows);

      const imageResult =
        await client.query(`INSERT INTO movie_images(movie_id, movie_url) 
        VALUES ($1, $2, ) RETURNING image_id;`);

      logger.info("MOVIE IMAGE RESULT: ", imageResult.rows);

      res
        .status(statusCodes.success)
        .json({ message: "Movie with image added" });

      await client.query("COMMIT");
    } catch (error) {
      logger.error(err.stack);
      await client.query("ROLLBACK");
      res.status(statusCodes.queryError).json({
        error: `Exception occured while adding movie with image`,
      });
    } finally {
      client.release();
    }
  }
};

module.exports = {
  addMovie,
  getMovies,
  getMovieById,
};
