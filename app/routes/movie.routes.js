const router = require("express").Router();

const movieController = require("../controllers/movie.controller");

router.post("/add/movie", movieController.addMovie);
router.get("/", movieController.getMovies);
router.get("/:id", movieController.getMovieById);
// router.put("/:id");
// router.post("/add/movie/image");

module.exports = router;
