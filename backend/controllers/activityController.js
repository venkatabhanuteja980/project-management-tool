const Activity = require("../models/Activity");

const getActivities = async (req, res) => {
  try {
    const { projectId, taskId, limit = 20 } = req.query;
    const filter = {};

    if (projectId) filter.project = projectId;
    if (taskId) filter.task = taskId;

    const activities = await Activity.find(filter)
      .populate("user", "name email")
      .populate("project", "name")
      .populate("task", "title")
      .sort("-createdAt")
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createLog = async (userId, type, details, projectId = null, taskId = null) => {
  try {
    await Activity.create({
      user: userId,
      type,
      details,
      project: projectId,
      task: taskId,
    });
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
};

module.exports = {
  getActivities,
  createLog,
};
