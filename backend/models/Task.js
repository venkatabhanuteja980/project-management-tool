const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: [
        "To Do",
        "In Progress",
        "Review",
        "Done"
      ],
      default: "To Do"
    },

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical"
      ],
      default: "Medium"
    },

    dueDate: {
      type: Date
    },

    labels: [
      {
        type: String
      }
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Task",
  taskSchema
);