import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Badge } from "../components/Badge";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Skeleton } from "../components/Skeleton";
import TaskDetailsModal from "../components/TaskDetailsModal";
import {
  Calendar,
  Users,
  CheckSquare,
  Clock,
  ArrowLeft,
  UserPlus,
  Trash2,
  AlertCircle,
  FolderSync,
} from "lucide-react";
import toast from "react-hot-toast";

export function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Invite States
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviting, setInviting] = useState(false);

  // Modal State
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get("/tasks"),
        API.get("/auth/users"),
      ]);

      setProject(projectRes.data.project);
      setUsers(usersRes.data.users || []);
      
      // Filter tasks for this project
      const filtered = (tasksRes.data.tasks || []).filter(
        (t) => t.project?._id === id || t.project === id
      );
      setProjectTasks(filtered);
    } catch (error) {
      toast.error("Failed to load project details");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteUserId) return toast.error("Please select a user to invite");

    // Check if user is already a member
    const isAlreadyMember = project.teamMembers.some((m) => m._id === inviteUserId);
    if (isAlreadyMember) return toast.error("User is already a project team member");

    try {
      setInviting(true);
      const currentMemberIds = project.teamMembers.map((m) => m._id);
      const updatedMembers = [...currentMemberIds, inviteUserId];

      const { data } = await API.put(`/projects/${id}`, {
        teamMembers: updatedMembers,
      });

      if (data.success) {
        toast.success("User added to project team successfully");
        setInviteUserId("");
        fetchProjectData();
      }
    } catch (error) {
      toast.error("Failed to add team member");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member from the project?")) {
      try {
        const updatedMembers = project.teamMembers
          .map((m) => m._id)
          .filter((mid) => mid !== memberId);

        const { data } = await API.put(`/projects/${id}`, {
          teamMembers: updatedMembers,
        });

        if (data.success) {
          toast.success("Team member removed");
          fetchProjectData();
        }
      } catch (error) {
        toast.error("Failed to remove member");
      }
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm("Are you sure you want to delete this project? This will NOT delete associated tasks but they will lose project association.")) {
      try {
        await API.delete(`/projects/${id}`);
        toast.success("Project deleted successfully");
        navigate("/projects");
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton variant="rectangle" className="h-40" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton variant="rectangle" className="h-60 md:col-span-2" />
            <Skeleton variant="rectangle" className="h-60" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) return null;

  // Stats calculation
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === "Done").length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        
        {/* Back navigation & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <Link
            to="/projects"
            className="inline-flex items-center text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} className="mr-1.5" />
            Back to Projects
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteProject}
            className="border-rose-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500"
          >
            <Trash2 size={14} className="mr-2" />
            Delete Project
          </Button>
        </div>

        {/* Project Header Overview */}
        <Card className="!p-6 relative overflow-hidden border-l-[6px] border-l-indigo-600">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {project.name}
                </h1>
                <Badge variant={project.status}>{project.status}</Badge>
                <Badge variant={project.priority}>{project.priority}</Badge>
              </div>
              <p className="text-slate-500 mt-2 text-sm max-w-2xl leading-relaxed">
                {project.description}
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/60 shrink-0 text-center w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Project Progress</span>
              <span className="text-3xl font-extrabold text-indigo-600 block mt-1">{progressPercent}%</span>
              <div className="w-full md:w-36 bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-500">
            <div>
              <span className="block font-medium text-slate-400">Created By</span>
              <span className="font-semibold text-slate-700 mt-0.5 block">{project.createdBy?.name || "System"}</span>
            </div>
            <div>
              <span className="block font-medium text-slate-400">Start Date</span>
              <span className="font-semibold text-slate-700 mt-0.5 block flex items-center">
                <Calendar size={12} className="mr-1 text-slate-400" />
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not specified"}
              </span>
            </div>
            <div>
              <span className="block font-medium text-slate-400">End Date</span>
              <span className="font-semibold text-slate-700 mt-0.5 block flex items-center">
                <Calendar size={12} className="mr-1 text-slate-400" />
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not specified"}
              </span>
            </div>
            <div>
              <span className="block font-medium text-slate-400">Tasks Completed</span>
              <span className="font-semibold text-slate-700 mt-0.5 block">{completedTasks} / {totalTasks}</span>
            </div>
          </div>
        </Card>

        {/* Content columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Tasks List (Left Side - 2 Cols) */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex justify-between items-center pb-2">
              <CardTitle className="flex items-center space-x-2 text-slate-800">
                <CheckSquare size={18} className="text-slate-400" />
                <span>Project Tasks ({totalTasks})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
              {projectTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No tasks assigned to this project yet. Go to <Link to="/tasks" className="text-indigo-600 font-medium">Tasks Page</Link> to associate tasks.
                </div>
              ) : (
                projectTasks.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => {
                      setSelectedTaskId(t._id);
                      setIsModalOpen(true);
                    }}
                    className="py-3.5 flex justify-between items-center text-sm cursor-pointer hover:bg-slate-50/50 px-2 rounded-lg transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                        {t.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={t.priority}>{t.priority}</Badge>
                        <Badge variant={t.status}>{t.status}</Badge>
                        {t.dueDate && (
                          <span className="text-[11px] text-slate-400 flex items-center">
                            <Calendar size={10} className="mr-0.5" />
                            {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Avatar name={t.assignee?.name || "Unassigned"} size="xs" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Team management column (Right Side - 1 Col) */}
          <div className="space-y-6">
            
            {/* Invite members form */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-slate-800">
                  <UserPlus size={18} className="text-indigo-500" />
                  <span>Add Team Member</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInviteUser} className="space-y-3">
                  <select
                    value={inviteUserId}
                    onChange={(e) => setInviteUserId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none text-sm transition-colors"
                  >
                    <option value="">Select a user...</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                  <Button type="submit" loading={inviting} className="w-full justify-center text-xs !py-2">
                    Invite Member
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Members List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-slate-800">
                  <Users size={18} className="text-slate-400" />
                  <span>Project Team ({project.teamMembers?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {(!project.teamMembers || project.teamMembers.length === 0) ? (
                  <p className="text-xs text-slate-400 text-center py-4">No team members assigned.</p>
                ) : (
                  project.teamMembers.map((member) => (
                    <div key={member._id} className="py-2.5 flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <Avatar name={member.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-700">{member.name}</p>
                          <span className="text-[10px] text-slate-400 block">{member.email}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove member"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

          </div>

        </div>

        {/* Modal display */}
        <TaskDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          taskId={selectedTaskId}
          onTaskUpdated={fetchProjectData}
        />

      </div>
    </DashboardLayout>
  );
}

export default ProjectDetails;
