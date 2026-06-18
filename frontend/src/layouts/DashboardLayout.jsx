import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "../components/Avatar";
import API from "../services/api";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Columns,
  CalendarRange,
  LogOut,
  User,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.log("Failed to load notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all");
      fetchNotifications();
    } catch (error) {
      console.log("Failed to mark notifications read:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: FolderKanban,
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: ListTodo,
    },
    {
      name: "Kanban",
      path: "/kanban",
      icon: Columns,
    },
    {
      name: "Timeline",
      path: "/timeline",
      icon: CalendarRange,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800 shrink-0 select-none z-30`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/20">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
              P
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-white tracking-wide text-lg truncate">
                PM Tool
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors hidden md:block"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/10"
                    : "hover:bg-slate-800 hover:text-white text-slate-400"
                }`}
              >
                <Icon size={18} className={`${isActive ? "text-white" : ""} shrink-0`} />
                {sidebarOpen && <span className="ml-3 truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/10 flex items-center space-x-3 overflow-hidden">
          <Avatar name={user.name} size="sm" />
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <div className="flex items-center space-x-1 text-slate-500 text-[10px] uppercase font-semibold tracking-wider">
                <ShieldCheck size={10} className="text-slate-400 shrink-0" />
                <span className="truncate">{user.role}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT BLOCK */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 relative z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-500 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-semibold text-slate-800 text-lg">
              {navItems.find((n) => n.path === location.pathname)?.name || "Project View"}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* NOTIFICATIONS CONTAINER */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg relative transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-50">
                    <span className="font-semibold text-sm text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-3 text-xs text-slate-600 ${
                            !notif.read ? "bg-indigo-50/30" : ""
                          }`}
                        >
                          <p>{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE MENU CONTAINER */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center space-x-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
              >
                <Avatar name={user.name} size="sm" />
                <span className="text-sm font-medium text-slate-700 hidden sm:block truncate max-w-[120px]">
                  {user.name}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-100 rounded-xl shadow-lg py-2.5 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-50">
                    <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <div className="mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-slate-50 transition-colors"
                    >
                      <LogOut size={16} className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* PAGE BODY VIEW */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;