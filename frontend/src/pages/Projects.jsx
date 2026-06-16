import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function Projects() {
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planning",
    priority: "Medium",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

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
      await API.post("/projects", formData);

      setFormData({
        name: "",
        description: "",
        status: "Planning",
        priority: "Medium",
      });

      fetchProjects();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">

        <h1 className="text-3xl font-bold mb-6">
          Projects
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow mb-8"
        >
          <input
            type="text"
            name="name"
            placeholder="Project Name"
            value={formData.name}
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
            className="bg-blue-600 text-white px-6 py-3 rounded"
          >
            Create Project
          </button>
        </form>

        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white p-4 rounded shadow"
            >
              <h2 className="text-xl font-bold">
                {project.name}
              </h2>

              <p>{project.description}</p>

              <p>Status: {project.status}</p>

              <p>Priority: {project.priority}</p>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Projects;