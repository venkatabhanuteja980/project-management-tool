const Project = require("../models/Project");

const createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("createdBy", "name email")
      .populate("teamMembers", "name email");

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("teamMembers", "name email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};