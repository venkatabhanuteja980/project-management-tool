const Comment = require("../models/Comment");

const createComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      task: req.body.task,
      content: req.body.content,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      task: req.params.taskId
    })
      .populate("user", "name email")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createComment,
  getComments
};