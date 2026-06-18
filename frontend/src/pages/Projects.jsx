import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Skeleton } from "../components/Skeleton";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  RefreshCw,
  FolderOpen,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

export function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planning",
    priority: "Medium",
    startDate: "",
    endDate: "",
  });
  const [creating, setCreating] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/projects");
      setProjects(data.projects || []);
    } catch (error) {
      toast.error("Failed to load projects");
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
    if (!formData.name.trim()) return toast.error("Project name is required");
    if (!formData.description.trim()) return toast.error("Project description is required");

    try {
      setCreating(true);
      const { data } = await API.post("/projects", formData);
      if (data.success) {
        toast.success("Project created successfully");
        setFormData({
          name: "",
          description: "",
          status: "Planning",
          priority: "Medium",
          startDate: "",
          endDate: "",
        });
        setShowForm(false);
        fetchProjects();
      }
    } catch (error) {
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  // Filter Projects
  const filteredProjects = projects.filter((proj) => {
    const matchesSearch = proj.name.toLowerCase().includes(search.toLowerCase()) || 
                          proj.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = !selectedStatus || proj.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Header Widget */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Projects</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage team projects, track status updates, and delegate tasks.
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
                New Project
              </>
            )}
          </Button>
        </div>

        {/* Collapsible Create Project Form */}
        {showForm && (
          <Card className="animate-fade-in max-w-2xl">
            <h3 className="font-semibold text-slate-800 text-lg mb-4">Create New Project</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Mobile App Redesign"
                  value={formData.name}
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
                  placeholder="Describe project goals, outcomes, and stakeholders..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 p-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none text-sm transition-colors"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none text-sm transition-colors"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button type="submit" loading={creating}>
                  Create Project
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      name: "",
                      description: "",
                      status: "Planning",
                      priority: "Medium",
                      startDate: "",
                      endDate: "",
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium shrink-0">
              <Filter size={14} />
              <span>Filter:</span>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none text-xs transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchProjects}
              className="ml-auto md:ml-0 !py-1.5"
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {/* Project Card List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangle" className="h-44" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="flex flex-col justify-center items-center py-16 text-center">
            <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-3">
              <FolderOpen size={32} />
            </div>
            <h3 className="font-semibold text-slate-800 text-base">No Projects Found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              Try adjusting your filter parameters or search terms, or create a new project.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((proj) => (
              <Link key={proj._id} to={`/projects/${proj._id}`} className="block">
                <Card className="flex flex-col h-full hover:shadow-md border-t-[4px] border-t-indigo-600">
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge variant={proj.status}>{proj.status}</Badge>
                      <Badge variant={proj.priority}>{proj.priority}</Badge>
                    </div>

                    <h3 className="font-bold text-slate-800 text-lg leading-snug hover:text-indigo-600 transition-colors line-clamp-1">
                      {proj.name}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {proj.description}
                    </p>
                  </div>

                  {/* Project Timeline & Team counts */}
                  <div className="flex items-center justify-between mt-6 pt-3 border-t border-slate-50 text-xs text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <Calendar size={12} />
                      <span>
                        {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : "No end date"}
                      </span>
                    </span>
                    
                    <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                      {proj.teamMembers?.length || 0} Members
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Projects;