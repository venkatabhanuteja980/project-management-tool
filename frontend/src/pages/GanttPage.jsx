import { Gantt } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import DashboardLayout from "../layouts/DashboardLayout";

function GanttPage() {
  const tasks = [
    {
      start: new Date(2026, 5, 16),
      end: new Date(2026, 5, 25),
      name: "Authentication Module",
      id: "1",
      type: "task",
      progress: 100,
      isDisabled: false,
    },
    {
      start: new Date(2026, 5, 25),
      end: new Date(2026, 6, 5),
      name: "Projects Module",
      id: "2",
      type: "task",
      progress: 80,
      isDisabled: false,
    },
    {
      start: new Date(2026, 6, 5),
      end: new Date(2026, 6, 15),
      name: "Kanban Board",
      id: "3",
      type: "task",
      progress: 60,
      isDisabled: false,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">
          Project Timeline
        </h1>

        <Gantt tasks={tasks} />
      </div>
    </DashboardLayout>
  );
}

export default GanttPage;