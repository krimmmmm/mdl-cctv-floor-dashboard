// Added new Status: Not Start
// Dropdown options:
// - Not Start
// - Active
// - Completed
// - Risk

type TaskStatus = "notstart" | "active" | "done" | "risk";

const getStatusStyle = (status: TaskStatus) => {
  if (status === "done") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "active") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "risk") return "bg-red-100 text-red-700 border-red-200";
  if (status === "notstart") return "bg-slate-100 text-slate-500 border-slate-200";

  return "bg-slate-100 text-slate-600 border-slate-200";
};

// CARD COUNT
const notStart = tasks.filter((task) => task.status === "notstart").length;

// DROPDOWN
<select
  value={task.status}
  onChange={(e) =>
    updateTask(task.id, {
      status: e.target.value as TaskStatus,
    })
  }
>
  <option value="notstart">Not Start</option>
  <option value="active">Active</option>
  <option value="done">Completed</option>
  <option value="risk">Risk</option>
</select>
