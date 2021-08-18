const express = require("express");
const router = express.Router();

router.get("/cat", (req, res, next) => {
  next({ data: "hello" });
});

module.exports = router;
