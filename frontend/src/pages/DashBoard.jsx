import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projectsRes = await API.get("/projects");
      const tasksRes = await API.get("/tasks");

      setProjects(projectsRes.data.projects);
      setTasks(tasksRes.data.tasks);
    } catch (error) {
      console.log(error);
    }
  };

  const completedTasks = tasks.filter(
    (task) => task.status === "Done"
  ).length;

  const pendingTasks =
    tasks.length - completedTasks;

  const highPriorityTasks = tasks.filter(
    (task) =>
      task.priority === "High" ||
      task.priority === "Critical"
  ).length;

  return (
    <DashboardLayout>
      <div className="p-8">

        <h1 className="text-4xl font-bold mb-8">
          Analytics Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

          <div className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold">
              Projects
            </h2>

            <p className="text-4xl mt-3">
              {projects.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold">
              Tasks
            </h2>

            <p className="text-4xl mt-3">
              {tasks.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold">
              Completed
            </h2>

            <p className="text-4xl mt-3">
              {completedTasks}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold">
              Pending
            </h2>

            <p className="text-4xl mt-3">
              {pendingTasks}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold">
              High Priority
            </h2>

            <p className="text-4xl mt-3">
              {highPriorityTasks}
            </p>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;