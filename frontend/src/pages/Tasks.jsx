import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    priority: "Medium",
    status: "To Do",
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get("/tasks");
      setTasks(data.tasks);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await API.get("/projects");
      setProjects(data.projects);
    } catch (error) {
      console.log(error);
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

    try {
      await API.post("/tasks", formData);

      setFormData({
        title: "",
        description: "",
        project: "",
        priority: "Medium",
        status: "To Do",
      });

      fetchTasks();
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

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow mb-8"
        >
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-3 mb-4 rounded"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-3 mb-4 rounded"
          />

          <select
            name="project"
            value={formData.project}
            onChange={handleChange}
            className="w-full border p-3 mb-4 rounded"
          >
            <option value="">
              Select Project
            </option>

            {projects.map((project) => (
              <option
                key={project._id}
                value={project._id}
              >
                {project.name}
              </option>
            ))}
          </select>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full border p-3 mb-4 rounded"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <button
            className="bg-green-600 text-white px-6 py-3 rounded"
          >
            Create Task
          </button>
        </form>

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

              <p>
                Project: {task.project?.name}
              </p>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Tasks;