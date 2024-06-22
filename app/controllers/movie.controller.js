const statusCodes = require("../constants/statusCodes");
const pool = require("../boot/database/db_connect");
const logger = require("../middleware/winston");
const uploadFile = require("../upload/uploadFile");

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

const updateMovieById = async (req, res) => {
  const { id } = req.params;
  const { release_date } = req.body;

  let movie_id = parseInt(id);

  if (!release_date || isNaN(movie_id)) {
    return res
      .status(statusCodes.missingParameters)
      .json({ message: "Wrong or missing parameters" });
  } else {
    pool.query(
      `UPDATE movies SET release_date = $1 WHERE movie_id = $2;`,
      [release_date, movie_id],
      (err, rows) => {
        if (err) {
          logger.error(err.stack);
          return res.status(statusCodes.queryError).json({
            error: `Exception occured while updating movie with id=${movie_id}`,
          });
        }
        if (rows.rowCount === 0) {
          res.status(statusCodes.queryError).json({
            error: `Movie with id=${movie_id} not found`,
          });
        } else {
          res.status(statusCodes.success).json({ message: "Movie updated" });
        }
      }
    );
  }
};

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

const uploadImage = async (req, res) => {
  const { id } = req.params;

  let movie_id = parseInt(id);

  if (isNaN(movie_id)) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "id must be a number" });
  }
  let sql = "UPDATE movies SET poster = $1 WHERE movie_id = $2;";

  if (req.file) {
    let { mimetype } = req.file;

    // if (
    //   !mimetype !== "image/png" &&
    //   !mimetype !== "image/jpeg" &&
    //   !mimetype !== "image/jpg"
    // ) {
    //   res
    //     .status(statusCodes.badRequest)
    //     .json({ message: "Only images allowed" });
    // } else {
    uploadFile(`${req.user.id}/`, req, sql, (response) => {
      if (response.error) {
        res
          .status(statusCodes.badRequest)
          .json({ error: "Error while uploading image" });
      } else {
        res.status(statusCodes.success).json({ response });
      }
    });
  }
  //   } else {
  //     res
  //       .status(statusCodes.missingParameters)
  //       .json({ message: "File is missing" });
  //   }
};

module.exports = {
  addMovie,
  getMovies,
  getMovieById,
  addMovieWithImage,
  updateMovieById,
  uploadImage,
};
