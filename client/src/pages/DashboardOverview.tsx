import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { useFloorPlan } from "@/contexts/FloorPlanContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#22c55e", "#f59e0b", "#94a3b8"];

type Tone = "blue" | "green" | "yellow" | "slate" | "gray" | "purple" | "orange";

const toneClass: Record<Tone, string> = {
  blue: "from-blue-50 to-sky-50 border-blue-100",
  green: "from-green-50 to-emerald-50 border-green-100",
  yellow: "from-yellow-50 to-amber-50 border-yellow-100",
  slate: "from-slate-50 to-gray-50 border-slate-100",
  gray: "from-gray-50 to-slate-50 border-gray-100",
  purple: "from-purple-50 to-violet-50 border-purple-100",
  orange: "from-orange-50 to-amber-50 border-orange-100",
};

const getProgress = (item: any, type: string) => {
  if (type === "camera") return Number(item.onlineProgress || 0);
  if (type === "fiber") return Number(item.progress || 0);

  const keys =
    type === "cabinet"
      ? [
          "installCabinetProgress",
          "acPowerProgress",
          "utpProgress",
          "poeSwitchProgress",
          "fiberOpticProgress",
          "readyProgress",
        ]
      : [
          "acPowerProgress",
          "utpProgress",
          "poeSwitchProgress",
          "fiberOpticProgress",
          "readyProgress",
        ];

  const values = keys.map((key) => Number(item[key] || 0));
  if (values.length === 0) return 0;

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const getStatus = (progress: number) => {
  if (progress >= 100) return "Completed";
  if (progress > 0) return "In Progress";
  return "Not Started";
};

const getPhotos = (item: any) =>
  [item.photo1, item.photo2, item.photo3, item.photo4].filter(Boolean);

const averageProgress = (items: any[], key: string) => {
  if (!items.length) return 0;
  return Math.round(
    items.reduce((sum, item) => sum + Number(item[key] || 0), 0) / items.length
  );
};

const countByProgress = (items: any[], key: string) => ({
  completed: items.filter((item) => Number(item[key] || 0) >= 100).length,
  inProgress: items.filter((item) => {
    const value = Number(item[key] || 0);
    return value > 0 && value < 100;
  }).length,
  notStarted: items.filter((item) => Number(item[key] || 0) <= 0).length,
});

const DashboardOverview: React.FC = () => {
  const { cameras, racks, cabinets, fiberRoutes } = useFloorPlan();

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [workPlans, setWorkPlans] = useState<Record<string, any>>({});

  const safeCameras = cameras || [];
  const safeRacks = racks || [];
  const safeCabinets = cabinets || [];
  const safeFiberRoutes = fiberRoutes || [];

  const equipmentRows = useMemo(() => {
    const cameraRows = safeCameras.map((item: any) => ({
      ...item,
      equipmentType: "Camera",
      typeKey: "camera",
      progress: getProgress(item, "camera"),
    }));

    const rackRows = safeRacks.map((item: any) => ({
      ...item,
      equipmentType: "Rack",
      typeKey: "rack",
      progress: getProgress(item, "rack"),
    }));

    const cabinetRows = safeCabinets.map((item: any) => ({
      ...item,
      equipmentType: "Cabinet",
      typeKey: "cabinet",
      progress: getProgress(item, "cabinet"),
    }));

    const fiberRows = safeFiberRoutes.map((item: any) => ({
      ...item,
      equipmentType: "Fiber",
      typeKey: "fiber",
      progress: getProgress(item, "fiber"),
    }));

    return [...cameraRows, ...rackRows, ...cabinetRows, ...fiberRows].map((row) => ({
      ...row,
      statusLabel: getStatus(row.progress),
    }));
  }, [safeCameras, safeRacks, safeCabinets, safeFiberRoutes]);

  const summary = useMemo(() => {
    const total = equipmentRows.length;
    const completed = equipmentRows.filter((r) => r.progress >= 100).length;
    const inProgress = equipmentRows.filter((r) => r.progress > 0 && r.progress < 100).length;
    const notStarted = equipmentRows.filter((r) => r.progress <= 0).length;
    const overall =
      total > 0
        ? Math.round(equipmentRows.reduce((sum, row) => sum + row.progress, 0) / total)
        : 0;

    return { total, completed, inProgress, notStarted, overall };
  }, [equipmentRows]);

  const donutData = [
    { name: "Completed", value: summary.completed },
    { name: "In Progress", value: summary.inProgress },
    { name: "Not Started", value: summary.notStarted },
  ];

  const cameraStats = {
    total: safeCameras.length,
    online: safeCameras.filter((c: any) => Number(c.onlineProgress || 0) >= 100).length,
    type1: safeCameras.filter((c: any) => c.type === "type1").length,
    type2: safeCameras.filter((c: any) => c.type === "type2").length,
  };

  const rackStats = {
    total: safeRacks.length,
    ready: safeRacks.filter((r: any) => Number(r.readyProgress || 0) >= 100).length,
    type1: safeRacks.filter((r: any) => r.type === "type1").length,
    type2: safeRacks.filter((r: any) => r.type === "type2").length,
  };

  const cabinetStats = {
    total: safeCabinets.length,
    ready: safeCabinets.filter((c: any) => Number(c.readyProgress || 0) >= 100).length,
  };

  const fiberStats = {
    total: safeFiberRoutes.length,
    completed: safeFiberRoutes.filter((f: any) => Number(f.progress || 0) >= 100).length,
    inProgress: safeFiberRoutes.filter((f: any) => {
      const progress = Number(f.progress || 0);
      return progress > 0 && progress < 100;
    }).length,
    overall:
      safeFiberRoutes.length > 0
        ? Math.round(
            safeFiberRoutes.reduce((sum: number, f: any) => sum + Number(f.progress || 0), 0) /
              safeFiberRoutes.length
          )
        : 0,
  };

  const todayKey = new Date().toISOString().slice(0, 10);

  const monthDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: lastDay }, (_, index) => {
      const day = index + 1;
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const jobs = equipmentRows.filter(
        (row) => row.planStartDate === key || workPlans[row.id]?.date === key
      );
      const isWorkingToday =
        key === todayKey && jobs.some((job) => workPlans[job.id]?.isWorking);

      return { day, key, jobs, isWorkingToday };
    });
  }, [equipmentRows, workPlans, todayKey]);

  const updateWorkPlan = (id: string, changes: any) => {
    setWorkPlans((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        ...changes,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">MDL CCTV Monitoring Dashboard</h1>
          <p className="text-sm text-slate-500">
            Executive overview, progress, schedule, and uploaded field photos
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500">
              Created by Tadchai Sittisomboon (EPM)
            </p>
          </div>

          <Link
            href="/floorplan"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-500 transition"
          >
            Open Floor Plan
          </Link>
        </div>
      </header>

      <main className="p-5 space-y-5">
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiCard title="Overall" value={`${summary.overall}%`} tone="blue" />
          <KpiCard title="Total Equipment" value={summary.total} tone="slate" />
          <KpiCard title="Completed" value={summary.completed} tone="green" />
          <KpiCard title="In Progress" value={summary.inProgress} tone="yellow" />
          <KpiCard title="Not Started" value={summary.notStarted} tone="gray" />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3">
            <MetricCard title="CCTV Cameras" tone="blue">
              <MetricGrid
                items={[
                  ["Total", cameraStats.total],
                  ["Online", cameraStats.online],
                  ["T1 New", cameraStats.type1],
                  ["T2 Replace", cameraStats.type2],
                ]}
              />
            </MetricCard>

            <MetricCard title="RACK Equipment" tone="purple">
              <MetricGrid
                items={[
                  ["Total", rackStats.total],
                  ["Ready", rackStats.ready],
                  ["Type 1", rackStats.type1],
                  ["Type 2", rackStats.type2],
                ]}
              />
            </MetricCard>

            <MetricCard title="CABINET Equipment" tone="orange">
              <MetricGrid
                items={[
                  ["Total", cabinetStats.total],
                  ["Ready", cabinetStats.ready],
                ]}
              />
            </MetricCard>

            <FiberProgressCard fiberRoutes={safeFiberRoutes} fiberStats={fiberStats} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <StepProgressPanel
              title="Camera Installation Steps"
              steps={[
                {
                  title: "Wiring UTP",
                  subTitle: "Install UTP cable",
                  progress: averageProgress(safeCameras, "wiringUTPProgress"),
                  checked: countByProgress(safeCameras, "wiringUTPProgress").completed,
                  total: safeCameras.length,
                },
                {
                  title: "Install Wall Mounting",
                  subTitle: "Mount the bracket on wall",
                  progress: averageProgress(safeCameras, "wallMountingProgress"),
                  checked: countByProgress(safeCameras, "wallMountingProgress").completed,
                  total: safeCameras.length,
                },
                {
                  title: "Install Dome Camera",
                  subTitle: "Install the dome camera unit",
                  progress: averageProgress(safeCameras, "domeCameraProgress"),
                  checked: countByProgress(safeCameras, "domeCameraProgress").completed,
                  total: safeCameras.length,
                },
                {
                  title: "Camera Online",
                  subTitle: "Device connected and online",
                  progress: averageProgress(safeCameras, "onlineProgress"),
                  checked: countByProgress(safeCameras, "onlineProgress").completed,
                  total: safeCameras.length,
                },
              ]}
            />

            <StepProgressPanel
              title="Rack Installation Steps"
              steps={[
                {
                  title: "AC POWER",
                  subTitle: "Power supply installed",
                  progress: averageProgress(safeRacks, "acPowerProgress"),
                  checked: countByProgress(safeRacks, "acPowerProgress").completed,
                  total: safeRacks.length,
                },
                {
                  title: "UTP",
                  subTitle: "Network cable installed",
                  progress: averageProgress(safeRacks, "utpProgress"),
                  checked: countByProgress(safeRacks, "utpProgress").completed,
                  total: safeRacks.length,
                },
                {
                  title: "POE SWITCH",
                  subTitle: "Switch installed",
                  progress: averageProgress(safeRacks, "poeSwitchProgress"),
                  checked: countByProgress(safeRacks, "poeSwitchProgress").completed,
                  total: safeRacks.length,
                },
                {
                  title: "FIBER OPTIC",
                  subTitle: "Fiber optic connected",
                  progress: averageProgress(safeRacks, "fiberOpticProgress"),
                  checked: countByProgress(safeRacks, "fiberOpticProgress").completed,
                  total: safeRacks.length,
                },
                {
                  title: "READY",
                  subTitle: "Rack ready for use",
                  progress: averageProgress(safeRacks, "readyProgress"),
                  checked: countByProgress(safeRacks, "readyProgress").completed,
                  total: safeRacks.length,
                },
              ]}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5">
          <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Overall Status</CardTitle>
            </CardHeader>

            <CardContent className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={4}
                  >
                    {donutData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Equipment Master Table</CardTitle>
            </CardHeader>

            <CardContent className="p-0 overflow-auto max-h-[420px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-100 text-slate-600">
                  <tr>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Label</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Progress</th>
                    <th className="text-left p-3">Plan Start</th>
                    <th className="text-left p-3">Plan Finish</th>
                    <th className="text-left p-3">Photos</th>
                  </tr>
                </thead>

                <tbody>
                  {equipmentRows.map((row) => {
                    const photos = getPhotos(row);

                    return (
                      <tr
                        key={`${row.typeKey}-${row.id}`}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-3 font-semibold">{row.equipmentType}</td>
                        <td className="p-3">{row.name || row.label || row.id}</td>
                        <td className="p-3">
                          <StatusPill status={row.statusLabel} />
                        </td>
                        <td className="p-3 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${row.progress}%` }}
                              />
                            </div>
                            <b className="text-xs w-9 text-right">{row.progress}%</b>
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="date"
                            value={workPlans[row.id]?.date || ""}
                            onChange={(e) => updateWorkPlan(row.id, { date: e.target.value })}
                            className="border border-slate-200 rounded-lg px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="date"
                            value={workPlans[row.id]?.finishDate || ""}
                            onChange={(e) =>
                              updateWorkPlan(row.id, { finishDate: e.target.value })
                            }
                            className="border border-slate-200 rounded-lg px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {photos.length > 0 ? (
                              photos.slice(0, 4).map((photo: string, idx: number) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedPhoto(photo)}
                                  className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200"
                                >
                                  <img
                                    src={photo}
                                    alt="uploaded"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">No photo</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
          <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base">Monthly Work Calendar</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day) => (
                  <button
                    key={day.key}
                    onClick={() => setSelectedDate(day.key)}
                    className={`min-h-[76px] rounded-xl border p-2 text-left bg-white hover:bg-blue-50 ${
                      day.isWorkingToday
                        ? "border-yellow-400 border-4 animate-pulse"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="font-bold text-sm">{day.day}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {day.jobs.length} jobs
                    </div>
                    {day.isWorkingToday && (
                      <div className="text-[10px] font-bold text-yellow-700 mt-1">
                        LIVE WORKING
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base">Daily Schedule</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="text-sm font-semibold">{selectedDate || "Select a date"}</div>

              {equipmentRows.map((row) =>
                workPlans[row.id]?.date === selectedDate ? (
                  <div
                    key={row.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                  >
                    <div className="font-semibold text-sm">{row.name || row.label}</div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={workPlans[row.id]?.startTime || ""}
                        onChange={(e) =>
                          updateWorkPlan(row.id, { startTime: e.target.value })
                        }
                        className="border rounded-lg px-2 py-1 text-xs"
                      />
                      <input
                        type="time"
                        value={workPlans[row.id]?.endTime || ""}
                        onChange={(e) =>
                          updateWorkPlan(row.id, { endTime: e.target.value })
                        }
                        className="border rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <textarea
                      value={workPlans[row.id]?.workDetail || ""}
                      onChange={(e) =>
                        updateWorkPlan(row.id, { workDetail: e.target.value })
                      }
                      placeholder="ระบุว่าเข้าไปทำอะไร"
                      className="w-full border rounded-lg px-2 py-1 text-xs"
                    />

                    <label className="flex items-center gap-2 text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={Boolean(workPlans[row.id]?.isWorking)}
                        onChange={(e) =>
                          updateWorkPlan(row.id, { isWorking: e.target.checked })
                        }
                      />
                      เข้าทำงานวันนี้ / On Site
                    </label>
                  </div>
                ) : null
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="preview"
            className="max-w-[92vw] max-h-[92vh] rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

const KpiCard = ({ title, value, tone }: { title: string; value: any; tone: Tone }) => (
  <Card className={`rounded-2xl border shadow-sm bg-gradient-to-br ${toneClass[tone]}`}>
    <CardContent className="p-4">
      <div className="text-xs text-slate-500 font-semibold">{title}</div>
      <div
        className={`text-2xl font-black mt-1 ${
          tone === "green"
            ? "text-green-600"
            : tone === "yellow"
              ? "text-yellow-600"
              : tone === "blue"
                ? "text-blue-600"
                : "text-slate-900"
        }`}
      >
        {value}
      </div>
    </CardContent>
  </Card>
);

const MetricCard = ({
  title,
  tone,
  children,
}: {
  title: string;
  tone: Tone;
  children: React.ReactNode;
}) => (
  <Card className={`rounded-2xl border shadow-sm bg-gradient-to-br ${toneClass[tone]}`}>
    <CardHeader className="pb-1 px-4 pt-4">
      <CardTitle className="text-sm font-bold text-slate-700">{title}</CardTitle>
    </CardHeader>
    <CardContent className="px-4 pb-4">{children}</CardContent>
  </Card>
);

const MetricGrid = ({ items }: { items: Array<[string, any]> }) => (
  <div className="grid grid-cols-4 gap-3">
    {items.map(([label, value]) => (
      <div key={label}>
        <div className="text-[11px] text-slate-500">{label}</div>
        <div
          className={`text-lg font-black ${
            label.toLowerCase().includes("online") || label.toLowerCase().includes("ready")
              ? "text-green-600"
              : label.toLowerCase().includes("type 2") ||
                  label.toLowerCase().includes("replace")
                ? "text-blue-600"
                : label.toLowerCase().includes("type 1") ||
                    label.toLowerCase().includes("new")
                  ? "text-orange-500"
                  : "text-slate-900"
          }`}
        >
          {value}
        </div>
      </div>
    ))}
  </div>
);

const StepProgressPanel = ({
  title,
  steps,
}: {
  title: string;
  steps: Array<{
    title: string;
    subTitle: string;
    progress: number;
    checked: number;
    total: number;
  }>;
}) => (
  <Card className="rounded-2xl border border-slate-200 shadow-sm bg-slate-950 text-white overflow-hidden">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-blue-200 font-medium">{title}</CardTitle>
    </CardHeader>

    <CardContent className="space-y-2">
      {steps.map((step) => (
        <div
          key={step.title}
          className="rounded-xl border border-slate-700 bg-black px-3 py-2 flex items-center gap-3"
        >
          <input
            type="checkbox"
            readOnly
            checked={step.progress >= 100}
            className="w-4 h-4 accent-blue-500"
          />

          <div className="flex-1 min-w-0">
            <div className="text-sm font-black truncate">{step.title}</div>
            <div className="text-[11px] text-blue-200 truncate">{step.subTitle}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Done {step.checked}/{step.total}
            </div>
          </div>

          {step.progress >= 100 && <span className="text-green-400 text-xl">✓</span>}

          <div className="w-16 h-9 rounded-lg border border-slate-400 flex items-center justify-center font-black">
            {step.progress}
          </div>

          <span className="text-blue-200 font-black">%</span>
        </div>
      ))}
    </CardContent>
  </Card>
);

const FiberProgressCard = ({
  fiberRoutes,
  fiberStats,
}: {
  fiberRoutes: any[];
  fiberStats: {
    total: number;
    completed: number;
    inProgress: number;
    overall: number;
  };
}) => (
  <Card className="rounded-2xl border border-green-100 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
    <CardHeader className="pb-1 px-4 pt-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-bold text-slate-700">
          Fiber Optic Progress
        </CardTitle>
        <div className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-black">
          รวม {fiberStats.overall}%
        </div>
      </div>
    </CardHeader>

    <CardContent className="px-4 pb-4 space-y-2">
      <div className="flex items-center gap-4 text-xs">
        <span>
          ทั้งหมด <b>{fiberStats.total}</b> เส้น
        </span>
        <span className="text-green-600 font-bold">เสร็จ {fiberStats.completed}</span>
        <span className="text-orange-500 font-bold">กำลังทำ {fiberStats.inProgress}</span>
      </div>

      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full"
          style={{ width: `${fiberStats.overall}%` }}
        />
      </div>

      <div className="space-y-1 max-h-[70px] overflow-auto pr-1">
        {fiberRoutes.length > 0 ? (
          fiberRoutes.map((fiber) => (
            <div
              key={fiber.id}
              className="grid grid-cols-[95px_1fr_38px] gap-2 items-center text-xs"
            >
              <span className="truncate text-slate-600">{fiber.name || "Fiber Route"}</span>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Number(fiber.progress || 0)}%` }}
                />
              </div>
              <b className="text-right text-orange-600">{Number(fiber.progress || 0)}%</b>
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-400">ยังไม่มี Fiber Route</div>
        )}
      </div>
    </CardContent>
  </Card>
);

const StatusPill = ({ status }: { status: string }) => {
  const cls =
    status === "Completed"
      ? "bg-green-100 text-green-700"
      : status === "In Progress"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-slate-100 text-slate-600";

  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>{status}</span>;
};

export default DashboardOverview;
