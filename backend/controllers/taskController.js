const Task = require("../models/Task");
const { createLog } = require("./activityController");
const { createNotificationHelper } = require("./notificationController");

const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id
    });

    await createLog(req.user._id, "task_created", `created task "${task.title}"`, task.project, task._id);

    if (task.assignee) {
      await createNotificationHelper(task.assignee, `You have been assigned to task: "${task.title}"`);
    }

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("project", "name")
      .populate("assignee", "name email");

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name")
      .populate("assignee", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    let detailMsg = `updated task "${task.title}"`;
    if (req.body.status && req.body.status !== oldTask.status) {
      detailMsg = `changed status of "${task.title}" to "${task.status}"`;
      await createNotificationHelper(task.createdBy, `Task "${task.title}" status changed to "${task.status}"`);
      if (task.assignee && String(task.assignee) !== String(task.createdBy)) {
        await createNotificationHelper(task.assignee, `Task "${task.title}" status changed to "${task.status}"`);
      }
    } else if (req.body.assignee && String(req.body.assignee) !== String(oldTask.assignee)) {
      detailMsg = `assigned task "${task.title}"`;
      await createNotificationHelper(req.body.assignee, `You have been assigned to task: "${task.title}"`);
    }

    await createLog(req.user._id, "task_updated", detailMsg, task.project, task._id);

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};