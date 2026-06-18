import React, { useEffect, useState } from "react";
import API from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { Card, CardContent } from "../components/Card";
import { Badge } from "../components/Badge";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { TableSkeleton } from "../components/Skeleton";
import TaskDetailsModal from "../components/TaskDetailsModal";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Folder,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";

export function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    priority: "Medium",
    status: "To Do",
  });
  const [creating, setCreating] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modal State
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes] = await Promise.all([
        API.get("/tasks"),
        API.get("/projects"),
      ]);
      setTasks(tasksRes.data.tasks || []);
      setProjects(projectsRes.data.projects || []);
    } catch (error) {
      toast.error("Failed to load tasks data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return toast.error("Task title is required");
    }
    if (!formData.project) {
      return toast.error("Please select a project");
    }

    try {
      setCreating(true);
      const { data } = await API.post("/tasks", formData);
      if (data.success) {
        toast.success("Task created successfully");
        setFormData({
          title: "",
          description: "",
          project: "",
          priority: "Medium",
          status: "To Do",
        });
        setShowForm(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    
    const taskProjId = task.project?._id || task.project;
    const matchesProject = !selectedProject || taskProjId === selectedProject;
    
    const matchesPriority = !selectedPriority || task.priority === selectedPriority;
    const matchesStatus = !selectedStatus || task.status === selectedStatus;

    return matchesSearch && matchesProject && matchesPriority && matchesStatus;
  });

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Widget */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Tasks</h1>
            <p className="text-sm text-slate-500 mt-1">
              Add new tasks, assign collaborators, and track implementation details.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center"
          >
            {showForm ? (
              <>
                <ChevronUp size={16} className="mr-2" />
                Hide Form
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                New Task
              </>
            )}
          </Button>
        </div>

        {/* Collapsible Create Task Card */}
        {showForm && (
          <Card className="animate-fade-in max-w-2xl">
            <h3 className="font-semibold text-slate-800 text-lg mb-4">Create New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="What needs to be done?"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe task scope..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 p-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Project
                  </label>
                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none text-sm transition-colors"
                  >
                    <option value="">Select Project</option>
                    {projects.map((proj) => (
                      <option key={proj._id} value={proj._id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none text-sm transition-colors"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Initial Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none text-sm transition-colors"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button type="submit" loading={creating}>
                  Create Task
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      title: "",
                      description: "",
                      project: "",
                      priority: "Medium",
                      status: "To Do",
                    });
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Filter bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center space-x-1 text-slate-500 text-xs font-medium shrink-0">
              <Filter size={14} />
              <span>Filters:</span>
            </div>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none text-xs transition-colors"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none text-xs transition-colors"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none text-xs transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="ml-auto lg:ml-0 !py-1.5"
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {/* Task Cards List */}
        {loading ? (
          <TableSkeleton />
        ) : filteredTasks.length === 0 ? (
          <Card className="flex flex-col justify-center items-center py-16 text-center">
            <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-3">
              <Folder size={32} />
            </div>
            <h3 className="font-semibold text-slate-800 text-base">No Tasks Found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              Try adjusting your filters or search terms, or create a new task.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";
              return (
                <Card
                  key={task._id}
                  onClick={() => handleTaskClick(task._id)}
                  className="flex flex-col h-full hover:shadow-md cursor-pointer border-l-[4px] border-l-slate-200"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded truncate max-w-[150px]">
                        {task.project?.name || "No Project"}
                      </span>
                      <Badge variant={task.status}>{task.status}</Badge>
                    </div>

                    <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-1">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 text-xs">
                    <div className="flex items-center space-x-2">
                      <Badge variant={task.priority}>{task.priority}</Badge>
                      {task.dueDate && (
                        <span className={`inline-flex items-center space-x-1 ${isOverdue ? "text-rose-500 font-medium" : "text-slate-400"}`}>
                          <Calendar size={12} />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                    <Avatar name={task.assignee?.name || "Unassigned"} size="xs" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal display */}
        <TaskDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          taskId={selectedTaskId}
          onTaskUpdated={fetchData}
        />
      </div>
    </DashboardLayout>
  );
}

export default Tasks;