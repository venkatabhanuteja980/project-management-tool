const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort("-createdAt")
      .limit(30);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createNotificationHelper = async (userId, message) => {
  try {
    if (!userId) return;
    await Notification.create({
      user: userId,
      message,
    });
  } catch (error) {
    console.error("Notification trigger failure:", error.message);
  }
};

module.exports = {
  getNotifications,
  markAllRead,
  createNotificationHelper,
};
