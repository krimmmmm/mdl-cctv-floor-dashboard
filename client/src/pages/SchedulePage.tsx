import React, { useMemo, useRef, useState } from "react";
import { Link } from "wouter";

type TaskStatus = "planned" | "risk" | "done" | "active";

type ScheduleTask = {
  id: string;
  no: string;
  name: string;
  owner: string;
  durationDays: number;
  startOffsetDays: number;
  color: string;
  status: TaskStatus;
  note?: string;
  isGroup?: boolean;
};

const defaultTasks: ScheduleTask[] = [
  {
    id: "order",
    no: "3",
    name: "Order the equipment and delivery to customer site",
    owner: "AWN",
    durationDays: 90,
    startOffsetDays: 14,
    color: "#facc15",
    status: "active",
    note: "HDD ขาดตลาด ระยะเวลารอสินค้ายังคงเดิม 90 วัน",
    isGroup: true,
  },
  {
    id: "camera-nvr",
    no: "3.1",
    name: "CCTV Camera and NVR",
    owner: "AWN",
    durationDays: 45,
    startOffsetDays: 14,
    color: "#fef200",
    status: "planned",
  },
  {
    id: "network",
    no: "3.2",
    name: "Network Switch / AP",
    owner: "AWN",
    durationDays: 45,
    startOffsetDays: 21,
    color: "#fef200",
    status: "planned",
  },
  {
    id: "cab-rack",
    no: "3.3",
    name: "Outdoor Cabinet & Wall Rack",
    owner: "AWN",
    durationDays: 15,
    startOffsetDays: 28,
    color: "#fef200",
    status: "planned",
  },
  {
    id: "hdd",
    no: "3.4",
    name: "SEAGATE Harddisk",
    owner: "AWN",
    durationDays: 90,
    startOffsetDays: 42,
    color: "#fef200",
    status: "risk",
    note: "HDD Delivery",
  },
  {
    id: "ups",
    no: "3.5",
    name: "UPS",
    owner: "AWN",
    durationDays: 15,
    startOffsetDays: 70,
    color: "#fef200",
    status: "planned",
  },
  {
    id: "kickoff",
    no: "4",
    name: "Project Kick-off and Confirm Solutions Design",
    owner: "Customer & AWN",
    durationDays: 1,
    startOffsetDays: 28,
    color: "#0ea5e9",
    status: "done",
    isGroup: true,
  },
  {
    id: "survey",
    no: "5",
    name: "Site Survey and Assessment (Safety Training)",
    owner: "Customer & AWN",
    durationDays: 1,
    startOffsetDays: 35,
    color: "#0ea5e9",
    status: "done",
    isGroup: true,
  },
  {
    id: "implementation",
    no: "6",
    name: "Implementation",
    owner: "AWN",
    durationDays: 65,
    startOffsetDays: 49,
    color: "#fdba74",
    status: "active",
    isGroup: true,
  },
  {
    id: "wiring",
    no: "6.1",
    name: "CCTV installation & Wiring",
    owner: "AWN",
    durationDays: 45,
    startOffsetDays: 49,
    color: "#bef264",
    status: "active",
    note: "Conduit Wiring installation",
  },
  {
    id: "switch-ap",
    no: "6.2",
    name: "Network Switch / AP",
    owner: "AWN",
    durationDays: 5,
    startOffsetDays: 91,
    color: "#fdba74",
    status: "planned",
  },
  {
    id: "outdoor-cabinet",
    no: "6.3",
    name: "Outdoor Cabinet & Wall Rack",
    owner: "AWN",
    durationDays: 2,
    startOffsetDays: 98,
    color: "#fdba74",
    status: "planned",
  },
  {
    id: "config",
    no: "6.4",
    name: "CCTV Configuration",
    owner: "AWN",
    durationDays: 2,
    startOffsetDays: 98,
    color: "#fdba74",
    status: "planned",
  },
  {
    id: "nvr",
    no: "6.5",
    name: "Confirm NVR registration & record",
    owner: "AWN",
    durationDays: 2,
    startOffsetDays: 105,
    color: "#fdba74",
    status: "planned",
  },
  {
    id: "camera-live",
    no: "6.6",
    name: "Confirm camera live-view",
    owner: "AWN",
    durationDays: 1,
    startOffsetDays: 107,
    color: "#fdba74",
    status: "planned",
  },
  {
    id: "commissioning",
    no: "7",
    name: "Commissioning",
    owner: "Customer & AWN",
    durationDays: 1,
    startOffsetDays: 112,
    color: "#0ea5e9",
    status: "planned",
    isGroup: true,
  },
  {
    id: "uat",
    no: "7.1",
    name: "User Acceptance Test",
    owner: "Customer & AWN",
    durationDays: 1,
    startOffsetDays: 112,
    color: "#0ea5e9",
    status: "planned",
  },
  {
    id: "handover",
    no: "7.2",
    name: "Training and Hand over the project",
    owner: "Customer & AWN",
    durationDays: 1,
    startOffsetDays: 113,
    color: "#0ea5e9",
    status: "planned",
  },
  {
    id: "doc",
    no: "7.3",
    name: "Project Document",
    owner: "AWN",
    durationDays: 5,
    startOffsetDays: 114,
    color: "#0ea5e9",
    status: "planned",
    note: "Submit UAT Document",
  },
  {
    id: "closure",
    no: "8",
    name: "Project Closure and transfer to After Sales Service",
    owner: "AWN After Sales",
    durationDays: 1,
    startOffsetDays: 119,
    color: "#84cc16",
    status: "planned",
    isGroup: true,
  },
];

const SCHEDULE_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_MS = 24 * 60 * 60 * 1000;
const FRAME_WEEKS = 24;
const TOTAL_DAYS = FRAME_WEEKS * 7;
const ROW_HEIGHT = 42;
const LEFT_TABLE_WIDTH = 720;
const DAY_WIDTH = 16;

const getLocalDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDays = (dateKey: string, days: number) => {
  const base = new Date(`${dateKey}T00:00:00`);
  base.setDate(base.getDate() + days);
  return getLocalDateKey(base);
};

const diffDays = (fromKey: string, toKey: string) => {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  return Math.floor((to.getTime() - from.getTime()) / DAY_MS);
};

const formatThaiDate = (dateKey: string) => {
  if (!dateKey) return "-";

  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
};

const getStatusStyle = (status: TaskStatus) => {
  if (status === "done") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "active") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "risk") return "bg-red-100 text-red-700 border-red-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const SchedulePage: React.FC = () => {
  const savedStart =
    typeof window !== "undefined"
      ? localStorage.getItem("mdl_schedule_start")
      : null;

  const savedTasks =
    typeof window !== "undefined"
      ? localStorage.getItem("mdl_schedule_tasks")
      : null;

  const [projectStart, setProjectStart] = useState(savedStart || "2026-06-08");
  const [tasks, setTasks] = useState<ScheduleTask[]>(() => {
    if (!savedTasks) return defaultTasks;

    try {
      const parsed = JSON.parse(savedTasks);
      return Array.isArray(parsed) ? parsed : defaultTasks;
    } catch {
      return defaultTasks;
    }
  });

  const [dragging, setDragging] = useState<{
    id: string;
    startX: number;
    originalOffset: number;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({
    x: 0,
    scrollLeft: 0,
  });

  const todayKey = getLocalDateKey(new Date());
  const todayOffset = diffDays(projectStart, todayKey);
  const projectFinish = addDays(projectStart, TOTAL_DAYS - 1);

  const completed = tasks.filter((task) => task.status === "done").length;
  const active = tasks.filter((task) => task.status === "active").length;
  const risk = tasks.filter((task) => task.status === "risk").length;

  const monthHeaders = useMemo(() => {
    const baseDate = new Date(`${projectStart}T00:00:00`);

    return Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(baseDate);
      monthDate.setMonth(baseDate.getMonth() + index);

      return {
        label: `${SCHEDULE_MONTH_NAMES[monthDate.getMonth()]} ${monthDate.getFullYear()}`,
        left: index * 4 * 7 * DAY_WIDTH,
        width: 4 * 7 * DAY_WIDTH,
      };
    });
  }, [projectStart]);

  const weekHeaders = useMemo(() => {
    return Array.from({ length: FRAME_WEEKS }, (_, index) => ({
      week: index + 1,
      left: index * 7 * DAY_WIDTH,
      width: 7 * DAY_WIDTH,
    }));
  }, []);

  const persistTasks = (nextTasks: ScheduleTask[]) => {
    setTasks(nextTasks);
    localStorage.setItem("mdl_schedule_tasks", JSON.stringify(nextTasks));
  };

  const updateTask = (id: string, changes: Partial<ScheduleTask>) => {
    persistTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...changes,
              durationDays: Math.max(1, Number(changes.durationDays ?? task.durationDays)),
              startOffsetDays: Math.max(
                0,
                Math.min(
                  TOTAL_DAYS - 1,
                  Number(changes.startOffsetDays ?? task.startOffsetDays)
                )
              ),
            }
          : task
      )
    );
  };

  const handleProjectStartChange = (value: string) => {
    setProjectStart(value);
    localStorage.setItem("mdl_schedule_start", value);
  };

  const resetSchedule = () => {
    persistTasks(defaultTasks);
    handleProjectStartChange("2026-06-08");
  };

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) {
      const deltaDays = Math.round((event.clientX - dragging.startX) / DAY_WIDTH);
      updateTask(dragging.id, {
        startOffsetDays: dragging.originalOffset + deltaDays,
      });

      return;
    }

    if (isPanning && scrollRef.current) {
      const deltaX = event.clientX - panStartRef.current.x;
      scrollRef.current.scrollLeft = panStartRef.current.scrollLeft - deltaX;
    }
  };

  const onMouseDownToPan = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const blockedSelector =
      "input, button, a, select, textarea, [data-gantt-bar='true']";

    if (target.closest(blockedSelector)) return;

    setIsPanning(true);
    panStartRef.current = {
      x: event.clientX,
      scrollLeft: scrollRef.current?.scrollLeft || 0,
    };
  };

  const onMouseUp = () => {
    setDragging(null);
    setIsPanning(false);
  };

  const chartWidth = TOTAL_DAYS * DAY_WIDTH;
  const chartHeight = tasks.length * ROW_HEIGHT;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              MDL CCTV Smart Schedule
            </h1>
            <p className="text-sm text-slate-500">
              Intelligent Gantt schedule · Auto-shift by project start date · Today line
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2">
              <div className="text-[11px] font-black uppercase text-blue-700">
                Project Start
              </div>
              <input
                type="date"
                value={projectStart}
                onChange={(e) => handleProjectStartChange(e.target.value)}
                className="mt-1 rounded-xl border border-blue-200 bg-white px-3 py-1 text-sm font-bold"
              />
            </label>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-2">
              <div className="text-[11px] font-black uppercase text-orange-700">
                Project Finish
              </div>
              <div className="mt-1 text-sm font-black">{formatThaiDate(projectFinish)}</div>
            </div>

            <button
              type="button"
              onClick={resetSchedule}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow hover:bg-slate-700"
            >
              Reset Schedule
            </button>

            <Link
              href="/dashboard"
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white shadow hover:bg-blue-500"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="space-y-5 p-5">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-500">Total Tasks</div>
            <div className="mt-1 text-3xl font-black">{tasks.length}</div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
            <div className="text-xs font-bold text-emerald-700">Completed</div>
            <div className="mt-1 text-3xl font-black text-emerald-600">{completed}</div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
            <div className="text-xs font-bold text-blue-700">Active</div>
            <div className="mt-1 text-3xl font-black text-blue-600">{active}</div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm">
            <div className="text-xs font-bold text-red-700">Risk</div>
            <div className="mt-1 text-3xl font-black text-red-600">{risk}</div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 shadow-sm">
            <div className="text-xs font-bold text-violet-700">Today</div>
            <div className="mt-1 text-xl font-black text-violet-700">
              {formatThaiDate(todayKey)}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-black">
                  Minor Dairy Factory New CCTV Installation
                </h2>
                <p className="text-sm text-slate-300">
                  Drag bars to move schedule · Edit duration/start offset in table · Today line follows current date
                </p>
              </div>

              <div className="text-sm font-bold text-slate-200">
                Frame: 6 Months / 24 Weeks
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className={`max-h-[68vh] overflow-auto select-none ${
              isPanning ? "cursor-grabbing" : "cursor-grab"
            }`}
            onMouseDown={onMouseDownToPan}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <div style={{ minWidth: LEFT_TABLE_WIDTH + chartWidth }}>
              <div className="sticky top-0 z-50 flex border-b border-slate-200 bg-white">
                <div
                  className="sticky left-0 z-40 grid shrink-0 grid-cols-[70px_1fr_160px_130px_120px] border-r border-slate-200 bg-lime-400 text-sm font-black text-slate-900 shadow-[8px_0_14px_rgba(15,23,42,0.08)]"
                  style={{ width: LEFT_TABLE_WIDTH }}
                >
                  <div className="flex items-center justify-center border-r border-lime-700 p-2">No.</div>
                  <div className="flex items-center justify-center border-r border-lime-700 p-2">Task</div>
                  <div className="flex items-center justify-center border-r border-lime-700 p-2">Task Owner</div>
                  <div className="flex items-center justify-center border-r border-lime-700 p-2 text-center">Duration<br />Days</div>
                  <div className="flex items-center justify-center p-2 text-center">Start<br />Offset</div>
                </div>

                <div className="relative shrink-0" style={{ width: chartWidth }}>
                  <div className="h-8 border-b border-emerald-900 bg-emerald-500 text-center text-sm font-black leading-8 text-slate-900">
                    The Frame (Week)
                  </div>

                  <div className="relative h-8 border-b border-slate-300 bg-lime-300">
                    {monthHeaders.map((month) => (
                      <div
                        key={month.label}
                        className="absolute top-0 flex h-8 items-center justify-center border-r border-lime-900 text-xs font-black"
                        style={{ left: month.left, width: month.width }}
                      >
                        {month.label}
                      </div>
                    ))}
                  </div>

                  <div className="relative h-8 bg-lime-300">
                    {weekHeaders.map((week) => (
                      <div
                        key={week.week}
                        className="absolute top-0 flex h-8 items-center justify-center border-r border-lime-900 text-xs font-bold"
                        style={{ left: week.left, width: week.width }}
                      >
                        {week.week}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex">
                <div className="sticky left-0 z-20 shrink-0 border-r border-slate-200 bg-white shadow-[8px_0_14px_rgba(15,23,42,0.08)]" style={{ width: LEFT_TABLE_WIDTH }}>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`grid grid-cols-[70px_1fr_160px_130px_120px] border-b border-slate-200 text-sm ${
                        task.isGroup ? "bg-slate-50 font-black" : "bg-white"
                      }`}
                      style={{ height: ROW_HEIGHT }}
                    >
                      <div className="flex items-center justify-center border-r border-slate-200 px-2">
                        {task.no}
                      </div>

                      <div className="flex items-center border-r border-slate-200 px-2">
                        <span className={task.status === "risk" ? "text-red-600" : ""}>
                          {task.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-center border-r border-slate-200 px-2">
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-slate-900">
                          {task.owner}
                        </span>
                      </div>

                      <div className="flex items-center justify-center border-r border-slate-200 px-2">
                        <input
                          type="number"
                          value={task.durationDays}
                          min={1}
                          onChange={(e) =>
                            updateTask(task.id, {
                              durationDays: Number(e.target.value),
                            })
                          }
                          className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-center font-black"
                        />
                      </div>

                      <div className="flex items-center justify-center px-2">
                        <input
                          type="number"
                          value={task.startOffsetDays}
                          min={0}
                          onChange={(e) =>
                            updateTask(task.id, {
                              startOffsetDays: Number(e.target.value),
                            })
                          }
                          className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-center font-black"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative shrink-0 bg-white" style={{ width: chartWidth, height: chartHeight }}>
                  {weekHeaders.map((week) => (
                    <div
                      key={week.week}
                      className="absolute top-0 h-full border-r border-slate-200"
                      style={{ left: week.left, width: week.width }}
                    />
                  ))}

                  {Array.from({ length: tasks.length + 1 }).map((_, index) => (
                    <div
                      key={index}
                      className="absolute left-0 w-full border-b border-slate-100"
                      style={{ top: index * ROW_HEIGHT }}
                    />
                  ))}

                  {todayOffset >= 0 && todayOffset <= TOTAL_DAYS && (
                    <div
                      className="absolute top-0 z-20 h-full border-l-4 border-red-600"
                      style={{ left: todayOffset * DAY_WIDTH }}
                    >
                      <div className="-ml-14 -mt-1 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-lg">
                        Today {formatThaiDate(todayKey)}
                      </div>
                    </div>
                  )}

                  {tasks.map((task, index) => {
                    const left = task.startOffsetDays * DAY_WIDTH;
                    const width = Math.max(10, task.durationDays * DAY_WIDTH);
                    const top = index * ROW_HEIGHT + 9;

                    return (
                      <div key={task.id}>
                        <div
                          data-gantt-bar="true"
                          onMouseDown={(event) => {
                            event.stopPropagation();
                            setDragging({
                              id: task.id,
                              startX: event.clientX,
                              originalOffset: task.startOffsetDays,
                            });
                          }}
                          className="absolute z-10 flex h-6 cursor-grab items-center rounded-md shadow-md ring-1 ring-black/10 active:cursor-grabbing"
                          style={{
                            left,
                            top,
                            width,
                            backgroundColor: task.color,
                          }}
                          title={`${task.name}: ${formatThaiDate(addDays(projectStart, task.startOffsetDays))} - ${formatThaiDate(addDays(projectStart, task.startOffsetDays + task.durationDays - 1))}`}
                        >
                          <div className="truncate px-2 text-xs font-black text-slate-900">
                            {task.durationDays}d
                          </div>
                        </div>

                        {task.note && (
                          <div
                            className="absolute z-10 rounded-xl border border-lime-500 bg-white px-3 py-1 text-xs font-black text-red-600 shadow-sm"
                            style={{
                              left: Math.min(chartWidth - 220, left + width + 14),
                              top: top - 3,
                              maxWidth: 220,
                            }}
                          >
                            {task.note}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-900">Smart Features</h3>
            <p className="mt-2 text-sm text-slate-500">
              เปลี่ยน Project Start แล้ว Schedule ทุก Task จะเลื่อนตามอัตโนมัติ โดยระยะห่างจากวันเริ่มต้นโครงการยังคงเดิม
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-900">Drag & Adjust</h3>
            <p className="mt-2 text-sm text-slate-500">
              ลากแถบ Gantt เพื่อขยับแผน หรือแก้ Start Offset / Duration Days จากตารางซ้ายมือได้ทันที
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-900">Today Indicator</h3>
            <p className="mt-2 text-sm text-slate-500">
              เส้นสีแดงจะแสดงวันที่ปัจจุบันพร้อม Label วันที่บนเส้น เพื่อเทียบกับแผนงานแบบ Real-time
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SchedulePage;
