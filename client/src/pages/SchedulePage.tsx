// แก้ไขไฟล์: client/src/pages/SchedulePage.tsx
// จุดประสงค์: ทุก Role เข้า /schedule ได้ แต่แก้ไขได้เฉพาะ Admin

// 1) เพิ่ม import นี้ด้านบน
import { useAuth } from "@/contexts/AuthContext";


// 2) เพิ่มใน SchedulePage component หลังบรรทัด const { workPlans = {}, updateWorkPlan = () => {} } = useFloorPlan();

const { user } = useAuth();

const savedUser =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("mdl_user") || "{}")
    : {};

const userRole = String(user?.role || savedUser?.role || "customer")
  .trim()
  .toLowerCase();

const canEditSchedule = userRole === "admin";


// 3) แก้ function ที่เปลี่ยนข้อมูล ให้ Admin เท่านั้น

const persistTasks = (nextTasks: ScheduleTask[]) => {
  if (!canEditSchedule) return;

  setTasks(nextTasks);

  const nextLatestTaskEndOffset = nextTasks.reduce(
    (max, task) => Math.max(max, task.startOffsetDays + task.durationDays - 1),
    0
  );
  const nextFinish = addDays(projectStart, nextLatestTaskEndOffset);

  updateWorkPlan(SCHEDULE_DB_KEY, {
    equipmentName: "Smart Schedule Tasks",
    date: projectStart,
    planStart: projectStart,
    finishDate: nextFinish,
    workDetail: JSON.stringify(nextTasks),
  });

  updateWorkPlan(PROJECT_PLAN_DB_KEY, {
    equipmentName: "Project Plan",
    date: projectStart,
    planStart: projectStart,
    finishDate: nextFinish,
  });
};

const handleProjectStartChange = (value: string) => {
  if (!canEditSchedule) return;

  setProjectStart(value);

  const nextFinish = addDays(value, latestTaskEndOffset);

  updateWorkPlan(PROJECT_PLAN_DB_KEY, {
    equipmentName: "Project Plan",
    date: value,
    planStart: value,
    finishDate: nextFinish,
  });

  updateWorkPlan(SCHEDULE_DB_KEY, {
    equipmentName: "Smart Schedule Tasks",
    date: value,
    planStart: value,
    finishDate: nextFinish,
    workDetail: JSON.stringify(tasks),
  });
};

const resetSchedule = () => {
  if (!canEditSchedule) return;

  // keep your existing resetSchedule code here
};


// 4) ปิดการแก้ไข input/select/drag เฉพาะคนที่ไม่ใช่ Admin

// Duration input
<input
  type="number"
  value={task.durationDays}
  min={1}
  disabled={!canEditSchedule}
  onChange={(e) =>
    canEditSchedule &&
    updateTask(task.id, {
      durationDays: Number(e.target.value),
    })
  }
/>

// Start Offset input
<input
  type="number"
  value={task.startOffsetDays}
  min={0}
  disabled={!canEditSchedule}
  onChange={(e) =>
    canEditSchedule &&
    updateTask(task.id, {
      startOffsetDays: Number(e.target.value),
    })
  }
/>

// Status dropdown
<select
  value={task.status}
  disabled={!canEditSchedule}
  onChange={(e) =>
    canEditSchedule &&
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

// Gantt drag
onMouseDown={(event) => {
  if (!canEditSchedule) return;
  event.stopPropagation();
  setDragging({
    id: task.id,
    startX: event.clientX,
    originalOffset: task.startOffsetDays,
  });
}}

// Reset button
<button
  type="button"
  disabled={!canEditSchedule}
  onClick={resetSchedule}
>
  Reset Schedule
</button>

// Project Start DatePicker
<DatePickerButton
  value={projectStart}
  onChange={(value) => canEditSchedule && handleProjectStartChange(value)}
/>


// 5) แนะนำให้แสดงข้อความบอกสิทธิ์
{!canEditSchedule && (
  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
    View Only Mode: หน้านี้ดูได้อย่างเดียว เฉพาะ Admin เท่านั้นที่แก้ไข Schedule ได้
  </div>
)}
