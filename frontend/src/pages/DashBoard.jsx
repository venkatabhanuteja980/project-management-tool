import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Badge } from "../components/Badge";
import { Avatar } from "../components/Avatar";
import { DashboardSkeleton } from "../components/Skeleton";
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Activity as ActivityIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes, activitiesRes] = await Promise.all([
        API.get("/projects"),
        API.get("/tasks"),
        API.get("/activities?limit=10"),
      ]);

      setProjects(projectsRes.data.projects || []);
      setTasks(tasksRes.data.tasks || []);
      setActivities(activitiesRes.data.activities || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // Calculations
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Done").length;
  const pendingTasks = totalTasks - completedTasks;
  
  // Overdue calculations
  const now = new Date();
  const overdueTasks = tasks.filter(
    (t) => t.status !== "Done" && t.dueDate && new Date(t.dueDate) < now
  );

  // Upcoming deadlines in next 7 days
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);
  const upcomingTasks = tasks.filter(
    (t) =>
      t.status !== "Done" &&
      t.dueDate &&
      new Date(t.dueDate) >= now &&
      new Date(t.dueDate) <= sevenDaysFromNow
  ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Chart Data preparation
  const statusColors = {
    "To Do": "#64748b",
    "In Progress": "#6366f1",
    "Review": "#a855f7",
    "Done": "#10b981",
  };

  const statusCount = tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    { "To Do": 0, "In Progress": 0, "Review": 0, "Done": 0 }
  );

  const statusChartData = Object.keys(statusCount).map((status) => ({
    name: status,
    value: statusCount[status],
    color: statusColors[status] || "#64748b",
  })).filter(d => d.value > 0);

  const priorityColors = {
    Low: "#94a3b8",
    Medium: "#3b82f6",
    High: "#f59e0b",
    Critical: "#ef4444",
  };

  const priorityCount = tasks.reduce(
    (acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    },
    { Low: 0, Medium: 0, High: 0, Critical: 0 }
  );

  const priorityChartData = Object.keys(priorityCount).map((priority) => ({
    name: priority,
    value: priorityCount[priority],
    color: priorityColors[priority] || "#94a3b8",
  }));

  const projectProgressData = projects.map((proj) => {
    const projTasks = tasks.filter((t) => t.project?._id === proj._id || t.project === proj._id);
    const completed = projTasks.filter((t) => t.status === "Done").length;
    const progress = projTasks.length > 0 ? Math.round((completed / projTasks.length) * 100) : 0;
    return {
      name: proj.name,
      Progress: progress,
      Tasks: projTasks.length,
    };
  }).slice(0, 5); // Limit to top 5 projects

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        
        {/* Header Widget */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Here is a summary of your workspace activities and milestones.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border border-slate-100 px-3 py-1.5 rounded-lg shadow-sm">
            <Calendar size={14} className="text-slate-400" />
            <span>{now.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Analytics Productivity Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <FolderKanban size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projects</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalProjects}</h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <ListTodo size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalTasks}</h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{completedTasks}</h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{pendingTasks}</h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4 border-rose-100 bg-rose-50/10">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-0.5">{overdueTasks.length}</h3>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Project Progress Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Project Progress (%)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {projectProgressData.length === 0 ? (
                <div className="h-full flex justify-center items-center text-slate-400 text-sm">
                  Create a project to display progress charts.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectProgressData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="Progress" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Status & Priority Distribution side charts */}
          <Card>
            <CardHeader>
              <CardTitle>Task Statuses</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex justify-center items-center">
              {statusChartData.length === 0 ? (
                <span className="text-slate-400 text-sm">No tasks created yet</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Priority distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Allocation</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {totalTasks === 0 ? (
                <div className="h-full flex justify-center items-center text-slate-400 text-sm">
                  Create tasks to plot priorities.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {priorityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines & Overdue Tasks combined widget */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader className="flex justify-between items-center pb-2">
              <CardTitle className="text-slate-800">Deadlines & Missed Tasks</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-72 divide-y divide-slate-100">
              {overdueTasks.map((t) => (
                <div key={t._id} className="py-3 flex justify-between items-center text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700 truncate">{t.title}</p>
                    <span className="text-xs text-slate-400">Project: {t.project?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="Critical">Overdue</Badge>
                    <span className="text-xs font-medium text-rose-500">
                      {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {upcomingTasks.map((t) => (
                <div key={t._id} className="py-3 flex justify-between items-center text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700 truncate">{t.title}</p>
                    <span className="text-xs text-slate-400">Project: {t.project?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={t.priority}>{t.priority}</Badge>
                    <span className="text-xs font-medium text-slate-500">
                      {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {overdueTasks.length === 0 && upcomingTasks.length === 0 && (
                <div className="h-full flex justify-center items-center py-12 text-slate-400 text-sm">
                  No upcoming deadlines or overdue tasks.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <Card>
          <CardHeader className="flex items-center space-x-2 pb-2">
            <ActivityIcon size={18} className="text-indigo-500" />
            <CardTitle>Recent Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-50 max-h-[350px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No recent activity logged in the workspace.
              </div>
            ) : (
              activities.map((act) => (
                <div key={act._id} className="py-3.5 flex items-start space-x-3 text-sm">
                  <Avatar name={act.user?.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-slate-700">{act.user?.name}</span>
                      <span className="text-xs text-slate-400 shrink-0">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5 text-xs">{act.details}</p>
                    {act.task && (
                      <span className="inline-block bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 mt-1 rounded font-medium">
                        Task: {act.task?.title}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;