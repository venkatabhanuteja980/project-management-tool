import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function Kanban() {
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

  const getTasksByStatus = (status) => {
    return tasks.filter(
      (task) => task.status === status
    );
  };

  const Column = ({ title, tasks }) => (
    <div className="bg-gray-100 rounded p-4 min-h-[500px]">
      <h2 className="font-bold text-xl mb-4">
        {title}
      </h2>

      {tasks.map((task) => (
        <div
          key={task._id}
          className="bg-white p-3 rounded shadow mb-3"
        >
          <h3 className="font-semibold">
            {task.title}
          </h3>

          <p className="text-sm text-gray-600">
            {task.description}
          </p>

          <p className="mt-2 text-sm">
            Priority: {task.priority}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">
          Kanban Board
        </h1>

        <div className="grid grid-cols-4 gap-4">

          <Column
            title="To Do"
            tasks={getTasksByStatus("To Do")}
          />

          <Column
            title="In Progress"
            tasks={getTasksByStatus("In Progress")}
          />

          <Column
            title="Review"
            tasks={getTasksByStatus("Review")}
          />

          <Column
            title="Done"
            tasks={getTasksByStatus("Done")}
          />

        </div>
      </div>
    </DashboardLayout>
  );
}

export default Kanban;