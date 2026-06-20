import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/DashBoard";
import Projects from "../pages/Projects";
import ProjectDetails from "../pages/ProjectDetails";
import Tasks from "../pages/Tasks";
import Kanban from "../pages/Kanban";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
  path="/dashboard"
  element={<Dashboard />}
/>
<Route
  path="/kanban"
  element={<Kanban />}
/>
<Route path="/projects" element={<Projects />} />
<Route path="/projects/:id" element={<ProjectDetails />} />
<Route path="/tasks" element={<Tasks />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
