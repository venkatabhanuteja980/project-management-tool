const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require("../controllers/projectController");

const {
  protect
} = require("../middleware/authMiddleware");
const {
  authorizeRoles
} = require("../middleware/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, authorizeRoles("Admin", "Manager"), createProject)
  .get(protect, getProjects);

router
  .route("/:id")
  .get(protect, getProjectById)
  .put(protect, authorizeRoles("Admin", "Manager"), updateProject)
  .delete(protect, authorizeRoles("Admin"), deleteProject);

module.exports = router;