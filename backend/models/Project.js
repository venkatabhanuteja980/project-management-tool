const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "Planning",
        "In Progress",
        "Completed",
        "On Hold"
      ],
      default: "Planning"
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

    startDate: {
      type: Date
    },

    endDate: {
      type: Date
    },

    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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
  "Project",
  projectSchema
);