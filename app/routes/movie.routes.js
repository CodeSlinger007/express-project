const router = require("express").Router();
const multer = require("multer");

let storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const movieController = require("../controllers/movie.controller");

router.post("/add/movie", movieController.addMovie);
router.get("/", movieController.getMovies);
router.get("/:id", movieController.getMovieById);
router.put("/:id", movieController.updateMovieById);
router.post("/add/movie/image", movieController.addMovieWithImage);

// upload a single movie image
router.post("/upload/:id", upload.single("file"), movieController.uploadImage);

module.exports = router;
