const express = require("express");
const router = express.Router();

router.use(require("./cat"));

module.exports = router;
