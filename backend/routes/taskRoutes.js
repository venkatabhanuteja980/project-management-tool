const express = require("express");

const {
  createTask,
  getTasks
} = require("../controllers/taskController");

const {
  protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, createTask)
  .get(protect, getTasks);

module.exports = router;