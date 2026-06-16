import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function Tasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get("/tasks");
      setTasks(data.tasks);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">
          Tasks
        </h1>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white p-4 rounded shadow"
            >
              <h2 className="font-bold text-xl">
                {task.title}
              </h2>

              <p>{task.description}</p>

              <p>
                Status: {task.status}
              </p>

              <p>
                Priority: {task.priority}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Tasks;