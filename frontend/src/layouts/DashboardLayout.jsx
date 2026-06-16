import { Link } from "react-router-dom";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">
          PM Tool
        </h1>

        <nav className="space-y-4">
          <Link
            to="/dashboard"
            className="block hover:text-blue-400"
          >
            Dashboard
          </Link>

          <Link
            to="/projects"
            className="block hover:text-blue-400"
          >
            Projects
          </Link>

          <Link
            to="/tasks"
            className="block hover:text-blue-400"
          >
            Tasks
          </Link>
         <Link
  to="/kanban"
  className="block hover:text-blue-400"
>
  Kanban
</Link>
<Link
  to="/timeline"
  className="block hover:text-blue-400"
>
  Timeline
</Link>
        </nav>
      </aside>

      <main className="flex-1 bg-gray-100">
        {children}
      </main>

    </div>
  );
}

export default DashboardLayout;