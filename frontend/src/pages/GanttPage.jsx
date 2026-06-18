import React, { useEffect, useState } from "react";
import { Gantt } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import API from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Skeleton } from "../components/Skeleton";
import { Calendar, Filter, RefreshCw, FolderSync } from "lucide-react";
import toast from "react-hot-toast";

export function GanttPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(true);

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
      const projectsData = projectsRes.data.projects || [];
      setProjects(projectsData);
      
      if (projectsData.length > 0) {
        setSelectedProjectId(projectsData[0]._id); // Select first project by default
      }
    } catch (error) {
      toast.error("Failed to load Gantt data");
    } finally {
      setLoading(false);
    }
  };

  // Filter and format tasks
  const filteredTasks = tasks.filter((t) => {
    const projId = t.project?._id || t.project;
    return !selectedProjectId || projId === selectedProjectId;
  });

  const getProgressVal = (status) => {
    switch (status) {
      case "Done":
        return 100;
      case "Review":
        return 75;
      case "In Progress":
        return 40;
      default:
        return 0;
    }
  };

  // Convert Mongoose Task models into gantt-task-react format
  const ganttTasks = filteredTasks.map((t) => {
    const start = t.createdAt ? new Date(t.createdAt) : new Date();
    
    // Ensure end date is always after start date to avoid crash
    let end = t.dueDate ? new Date(t.dueDate) : new Date();
    if (end.getTime() <= start.getTime()) {
      end = new Date(start.getTime() + 24 * 60 * 60 * 1000 * 3); // Default to 3 days duration
    }

    return {
      start,
      end,
      name: t.title,
      id: t._id,
      type: "task",
      progress: getProgressVal(t.status),
      isDisabled: false,
      styles: {
        progressColor: t.status === "Done" ? "#10b981" : "#6366f1",
        progressSelectedColor: "#4f46e5",
        backgroundColor: "#e2e8f0",
      },
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Filter header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="text-indigo-500" size={20} />
            <h2 className="font-semibold text-slate-800 text-sm">Select Project Timeline</h2>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 bg-white focus:outline-none text-sm transition-colors w-full md:w-56"
            >
              <option value="">All Projects Combined</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="!py-2"
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {/* Gantt Chart Container */}
        <Card className="overflow-x-auto min-h-[450px]">
          {loading ? (
            <div className="py-24 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600" />
            </div>
          ) : ganttTasks.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-24 text-center">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-3">
                <FolderSync size={32} />
              </div>
              <h3 className="font-semibold text-slate-800 text-base">No Timeline Data</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                There are no tasks with timeline details under the selected project.
              </p>
            </div>
          ) : (
            <div className="p-2 min-w-[800px]">
              <Gantt
                tasks={ganttTasks}
                viewMode="Day"
                columnWidth={60}
                listCellWidth="200px"
                rowHeight={45}
                barCornerRadius={6}
              />
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default GanttPage;