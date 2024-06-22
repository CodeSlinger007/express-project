const router = require("express").Router();

// movieController

router.post("/add/movie");
router.get("/");
router.get("/:id");
router.put("/:id");
router.post("/add/movie/image");

module.exports = router;
