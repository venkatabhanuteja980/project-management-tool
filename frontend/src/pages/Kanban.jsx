import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import API from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Avatar } from "../components/Avatar";
import { Skeleton } from "../components/Skeleton";
import { Button } from "../components/Button";
import { Calendar, AlertCircle, Search, Filter, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import TaskDetailsModal from "../components/TaskDetailsModal";

const COLUMNS = [
  { id: "To Do", title: "To Do", color: "border-t-slate-400 bg-slate-100/50" },
  { id: "In Progress", title: "In Progress", color: "border-t-indigo-500 bg-indigo-50/10" },
  { id: "Review", title: "Review", color: "border-t-purple-500 bg-purple-50/10" },
  { id: "Done", title: "Done", color: "border-t-emerald-500 bg-emerald-50/10" },
];

export function Kanban() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

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
      toast.error("Failed to fetch Kanban data");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId;

    // Optimistic Update
    const originalTasks = [...tasks];
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t._id === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      const { data } = await API.put(`/tasks/${taskId}`, { status: newStatus });
      if (!data.success) {
        throw new Error("Failed to update status");
      }
      toast.success(`Task moved to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update task status in database");
      setTasks(originalTasks); // Fallback
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    
    // Project filter (can be object or ID depending on populate)
    const taskProjId = task.project?._id || task.project;
    const matchesProject = !selectedProject || taskProjId === selectedProject;
    
    const matchesPriority = !selectedPriority || task.priority === selectedPriority;

    return matchesSearch && matchesProject && matchesPriority;
  });

  const getTasksByStatus = (status) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Kanban Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium shrink-0">
              <Filter size={14} />
              <span>Filter:</span>
            </div>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-slate-700 bg-white focus:outline-none text-xs transition-colors"
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
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-slate-700 bg-white focus:outline-none text-xs transition-colors"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="ml-auto md:ml-0 !py-1.5"
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {/* Board Columns Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-100/50 rounded-xl p-4 min-h-[400px] border border-slate-200/50 space-y-4">
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton variant="rectangle" className="h-24" />
                <Skeleton variant="rectangle" className="h-24" />
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {COLUMNS.map((col) => {
                const columnTasks = getTasksByStatus(col.id);
                return (
                  <div
                    key={col.id}
                    className={`rounded-xl border-t-[3px] border border-slate-200/60 p-4 min-h-[500px] flex flex-col ${col.color}`}
                  >
                    {/* Column Header */}
                    <div className="flex justify-between items-center mb-4 select-none">
                      <span className="font-semibold text-slate-800 text-sm tracking-wide">
                        {col.title}
                      </span>
                      <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>

                    {/* Droppable Area */}
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 space-y-3 pb-6 transition-colors"
                        >
                          {columnTasks.map((task, index) => {
                            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";
                            return (
                              <Draggable
                                key={task._id}
                                draggableId={task._id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => handleTaskClick(task._id)}
                                    className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow select-none cursor-pointer"
                                  >
                                    <div className="space-y-3">
                                      {/* Project name indicator */}
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate max-w-[120px]">
                                          {task.project?.name || "No Project"}
                                        </span>
                                        <Badge variant={task.priority}>
                                          {task.priority}
                                        </Badge>
                                      </div>

                                      {/* Task Title */}
                                      <h4 className="font-semibold text-slate-700 text-sm leading-snug">
                                        {task.title}
                                      </h4>

                                      {/* Task Description */}
                                      {task.description && (
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                          {task.description}
                                        </p>
                                      )}

                                      {/* Card Footer: Due Date & Assignee */}
                                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        {task.dueDate ? (
                                          <div
                                            className={`flex items-center space-x-1 text-[11px] font-medium ${
                                              isOverdue ? "text-rose-500" : "text-slate-400"
                                            }`}
                                          >
                                            {isOverdue ? (
                                              <AlertCircle size={12} />
                                            ) : (
                                              <Calendar size={12} />
                                            )}
                                            <span>
                                              {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="w-1" />
                                        )}

                                        <Avatar
                                          name={task.assignee?.name || "Unassigned"}
                                          size="xs"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}

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

export default Kanban;