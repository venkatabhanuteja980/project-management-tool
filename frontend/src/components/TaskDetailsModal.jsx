import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Modal } from "./Modal";
import { Badge } from "./Badge";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import {
  Calendar,
  User,
  Tag,
  AlertCircle,
  MessageSquare,
  History,
  Trash2,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export function TaskDetailsModal({ isOpen, onClose, taskId, onTaskUpdated }) {
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit States
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  
  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskDetails();
    }
  }, [isOpen, taskId]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const [taskRes, usersRes, commentsRes, activitiesRes] = await Promise.all([
        API.get(`/tasks/${taskId}`),
        API.get("/auth/users"),
        API.get(`/comments/${taskId}`),
        API.get(`/activities?taskId=${taskId}`),
      ]);

      setTask(taskRes.data.task);
      setDescription(taskRes.data.task.description || "");
      setUsers(usersRes.data.users || []);
      setComments(commentsRes.data.comments || []);
      setActivities(activitiesRes.data.activities || []);
    } catch (error) {
      toast.error("Failed to load task details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateField = async (fieldName, value) => {
    try {
      const { data } = await API.put(`/tasks/${taskId}`, { [fieldName]: value });
      if (data.success) {
        setTask(data.task);
        toast.success(`Updated ${fieldName}`);
        
        // Reload activities to see the change
        const activitiesRes = await API.get(`/activities?taskId=${taskId}`);
        setActivities(activitiesRes.data.activities || []);
        
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (error) {
      toast.error(`Failed to update ${fieldName}`);
    }
  };

  const handleSaveDescription = async () => {
    await handleUpdateField("description", description);
    setIsEditingDesc(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const { data } = await API.post("/comments", {
        task: taskId,
        content: commentText,
      });

      if (data.success) {
        setCommentText("");
        toast.success("Comment added");
        
        // Reload comments & activities
        const [commentsRes, activitiesRes] = await Promise.all([
          API.get(`/comments/${taskId}`),
          API.get(`/activities?taskId=${taskId}`),
        ]);
        setComments(commentsRes.data.comments || []);
        setActivities(activitiesRes.data.activities || []);
        
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await API.delete(`/tasks/${taskId}`);
        toast.success("Task deleted successfully");
        if (onTaskUpdated) onTaskUpdated();
        onClose();
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={loading ? "Loading Task..." : task?.title} size="lg">
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info (Left Side - 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description Section */}
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center">
                <span>Description</span>
              </h4>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-3 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                    rows={4}
                    placeholder="Add a detailed description for this task..."
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleSaveDescription}>
                      Save Changes
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setDescription(task.description || "");
                      setIsEditingDesc(false);
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-lg p-3.5 text-sm text-slate-600 cursor-pointer min-h-[80px] transition-colors leading-relaxed whitespace-pre-wrap"
                >
                  {task.description || "No description provided. Click here to add one..."}
                </div>
              )}
            </div>

            {/* Comments Thread Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
                <MessageSquare size={16} className="text-slate-400" />
                <span>Discussion Thread ({comments.length})</span>
              </h4>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex items-start space-x-3">
                <Avatar name={task.createdBy?.name || "User"} size="sm" />
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                  />
                  {commentText.trim() && (
                    <Button type="submit" size="sm" loading={submittingComment}>
                      Post Comment
                    </Button>
                  )}
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1 pt-2">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No comments posted yet.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex space-x-3 text-xs bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/40">
                      <Avatar name={comment.user?.name || "User"} size="sm" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700">{comment.user?.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 text-[13px] leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Task Activities logs */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
                <History size={16} className="text-slate-400" />
                <span>Task History</span>
              </h4>
              <div className="space-y-2.5 max-h-40 overflow-y-auto text-xs text-slate-500">
                {activities.length === 0 ? (
                  <p className="text-center py-2 text-slate-400">No activity logged.</p>
                ) : (
                  activities.map((act) => (
                    <div key={act._id} className="flex justify-between items-center py-1 border-b border-slate-50/50">
                      <span>
                        <strong className="text-slate-600 font-semibold">{act.user?.name}</strong> {act.details}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Details Sidebar (Right Side - 1 Col) */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-5">
            
            {/* Status Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={task.status}
                onChange={(e) => handleUpdateField("status", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none text-sm font-medium transition-colors"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Priority Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={task.priority}
                onChange={(e) => handleUpdateField("priority", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none text-sm font-medium transition-colors"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Assignee Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Assignee
              </label>
              <select
                value={task.assignee?._id || ""}
                onChange={(e) => handleUpdateField("assignee", e.target.value || null)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none text-sm font-medium transition-colors"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                onChange={(e) => handleUpdateField("dueDate", e.target.value || null)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none text-sm font-medium transition-colors"
              />
            </div>

            {/* General Info Metadata */}
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Associated Project</span>
                <span className="font-semibold text-slate-600 truncate max-w-[120px]">
                  {task.project?.name || "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Created By</span>
                <span className="font-semibold text-slate-600">{task.createdBy?.name || "System"}</span>
              </div>
              <div className="flex justify-between">
                <span>Created At</span>
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Delete Option */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteTask}
                className="w-full border-rose-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500"
              >
                <Trash2 size={14} className="mr-2" />
                Delete Task
              </Button>
            </div>

          </div>

        </div>
      )}
    </Modal>
  );
}

export default TaskDetailsModal;
