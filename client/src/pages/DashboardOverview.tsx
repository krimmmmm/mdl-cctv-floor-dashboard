import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { useFloorPlan } from "@/contexts/FloorPlanContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#22c55e", "#eab308", "#94a3b8"];

const getProgress = (item: any, type: string) => {
  if (type === "camera") return Number(item.onlineProgress || 0);
  if (type === "fiber") return Number(item.progress || 0);

  const keys = [
    "acPowerProgress",
    "utpProgress",
    "poeSwitchProgress",
    "fiberOpticProgress",
    "readyProgress",
    "installCabinetProgress",
  ];

  const values = keys
    .map((key) => Number(item[key] || 0))
    .filter((value) => value > 0);

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

const DashboardOverview: React.FC = () => {
  const { cameras, racks, cabinets, fiberRoutes } = useFloorPlan();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [workPlans, setWorkPlans] = useState<Record<string, any>>({});

  const equipmentRows = useMemo(() => {
    const cameraRows = (cameras || []).map((item: any) => ({
      ...item,
      equipmentType: "Camera",
      typeKey: "camera",
      progress: getProgress(item, "camera"),
    }));

    const rackRows = (racks || []).map((item: any) => ({
      ...item,
      equipmentType: "Rack",
      typeKey: "rack",
      progress: getProgress(item, "rack"),
    }));

    const cabinetRows = (cabinets || []).map((item: any) => ({
      ...item,
      equipmentType: "Cabinet",
      typeKey: "cabinet",
      progress: getProgress(item, "cabinet"),
    }));

    const fiberRows = (fiberRoutes || []).map((item: any) => ({
      ...item,
      equipmentType: "Fiber",
      typeKey: "fiber",
      progress: getProgress(item, "fiber"),
    }));

    return [...cameraRows, ...rackRows, ...cabinetRows, ...fiberRows].map((row) => ({
      ...row,
      statusLabel: getStatus(row.progress),
    }));
  }, [cameras, racks, cabinets, fiberRoutes]);

  const summary = useMemo(() => {
    const total = equipmentRows.length;
    const completed = equipmentRows.filter((r) => r.progress >= 100).length;
    const inProgress = equipmentRows.filter((r) => r.progress > 0 && r.progress < 100).length;
    const notStarted = equipmentRows.filter((r) => r.progress <= 0).length;
    const overall = total > 0 ? Math.round(equipmentRows.reduce((s, r) => s + r.progress, 0) / total) : 0;

    return { total, completed, inProgress, notStarted, overall };
  }, [equipmentRows]);

  const donutData = [
    { name: "Completed", value: summary.completed },
    { name: "In Progress", value: summary.inProgress },
    { name: "Not Started", value: summary.notStarted },
  ];

  const todayKey = new Date().toISOString().slice(0, 10);
  const monthDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: lastDay }, (_, index) => {
      const day = index + 1;
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const jobs = equipmentRows.filter((row) => row.planStartDate === key || workPlans[row.id]?.date === key);
      const isWorkingToday = key === todayKey && jobs.some((job) => workPlans[job.id]?.isWorking);
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
    <h1 className="text-2xl font-bold">
      MDL CCTV Monitoring Dashboard
    </h1>

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
      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm"
    >
      Open Floor Plan
    </Link>
  </div>
</header>

      <main className="p-5 space-y-5">
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KpiCard title="Overall" value={`${summary.overall}%`} tone="blue" />
          <KpiCard title="Total Equipment" value={summary.total} tone="slate" />
          <KpiCard title="Completed" value={summary.completed} tone="green" />
          <KpiCard title="In Progress" value={summary.inProgress} tone="yellow" />
          <KpiCard title="Not Started" value={summary.notStarted} tone="gray" />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
          <Card className="rounded-2xl border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Overall Status</CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={4}>
                    {donutData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                      <tr key={`${row.typeKey}-${row.id}`} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-semibold">{row.equipmentType}</td>
                        <td className="p-3">{row.name || row.label || row.id}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full bg-slate-100 text-xs font-semibold">{row.statusLabel}</span>
                        </td>
                        <td className="p-3 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${row.progress}%` }} />
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
                            onChange={(e) => updateWorkPlan(row.id, { finishDate: e.target.value })}
                            className="border border-slate-200 rounded-lg px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {photos.length > 0 ? photos.slice(0, 4).map((photo: string, idx: number) => (
                              <button key={idx} onClick={() => setSelectedPhoto(photo)} className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200">
                                <img src={photo} alt="uploaded" className="w-full h-full object-cover" />
                              </button>
                            )) : <span className="text-xs text-slate-400">No photo</span>}
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
          <Card className="rounded-2xl border border-slate-200 shadow-sm">
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
                      day.isWorkingToday ? "border-yellow-400 border-4 animate-pulse" : "border-slate-200"
                    }`}
                  >
                    <div className="font-bold text-sm">{day.day}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{day.jobs.length} jobs</div>
                    {day.isWorkingToday && <div className="text-[10px] font-bold text-yellow-700 mt-1">LIVE WORKING</div>}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Daily Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm font-semibold">{selectedDate || "Select a date"}</div>
              {equipmentRows.map((row) => (
                workPlans[row.id]?.date === selectedDate ? (
                  <div key={row.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="font-semibold text-sm">{row.name || row.label}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="time" value={workPlans[row.id]?.startTime || ""} onChange={(e) => updateWorkPlan(row.id, { startTime: e.target.value })} className="border rounded-lg px-2 py-1 text-xs" />
                      <input type="time" value={workPlans[row.id]?.endTime || ""} onChange={(e) => updateWorkPlan(row.id, { endTime: e.target.value })} className="border rounded-lg px-2 py-1 text-xs" />
                    </div>
                    <textarea value={workPlans[row.id]?.workDetail || ""} onChange={(e) => updateWorkPlan(row.id, { workDetail: e.target.value })} placeholder="ระบุว่าเข้าไปทำอะไร" className="w-full border rounded-lg px-2 py-1 text-xs" />
                    <label className="flex items-center gap-2 text-xs font-semibold">
                      <input type="checkbox" checked={Boolean(workPlans[row.id]?.isWorking)} onChange={(e) => updateWorkPlan(row.id, { isWorking: e.target.checked })} />
                      เข้าทำงานวันนี้ / On Site
                    </label>
                  </div>
                ) : null
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      {selectedPhoto && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} alt="preview" className="max-w-[92vw] max-h-[92vh] rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};

const KpiCard = ({ title, value, tone }: { title: string; value: any; tone: string }) => (
  <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
    <CardContent className="p-4">
      <div className="text-xs text-slate-500 font-semibold">{title}</div>
      <div className={`text-2xl font-black mt-1 ${tone === "green" ? "text-green-600" : tone === "yellow" ? "text-yellow-600" : tone === "blue" ? "text-blue-600" : "text-slate-900"}`}>
        {value}
      </div>
    </CardContent>
  </Card>
);

export default DashboardOverview;
