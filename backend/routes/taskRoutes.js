const express = require("express");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

const {
  protect
} = require("../middleware/authMiddleware");
const {
  authorizeRoles
} = require("../middleware/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, authorizeRoles("Admin", "Manager"), createTask)
  .get(protect, getTasks);

router
  .route("/:id")
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, authorizeRoles("Admin", "Manager"), deleteTask);

module.exports = router;