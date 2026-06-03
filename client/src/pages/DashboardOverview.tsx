import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { useFloorPlan } from "@/contexts/FloorPlanContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/lib/supabase";

const COLORS = ["#22c55e", "#f59e0b", "#94a3b8"];

const MONTH_NAMES = [
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

const formatDateDisplay = (dateValue?: string) => {
  if (!dateValue) return "";

  const [year, month, day] = String(dateValue).slice(0, 10).split("-");
  if (!year || !month || !day) return "";

  return `${day}/${month}/${year}`;
};

const parseDisplayDate = (value: string) => {
  const cleaned = value.trim();
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (day < 1 || day > 31 || month < 1 || month > 12) return null;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const getProjectPlanStart = (workPlans: Record<string, any>) =>
  workPlans.__project_plan__?.planStart || workPlans.__project_plan__?.date || "";

const getProjectPlanFinish = (workPlans: Record<string, any>) =>
  workPlans.__project_plan__?.finishDate || "";



const calculateCameraOverallProgress = (camera: any) => {
  const values = [
    Number(camera.wiringUTPProgress || 0),
    Number(camera.wallMountingProgress || 0),
    Number(camera.domeCameraProgress || 0),
    Number(camera.onlineProgress || 0),
  ];

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const getProgress = (item: any, type: string) => {
  if (type === "camera") return calculateCameraOverallProgress(item);
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


const calculateRackOverallProgress = (rack: any) => {
  const values = [
    Number(rack.acPowerProgress || 0),
    Number(rack.utpProgress || 0),
    Number(rack.poeSwitchProgress || 0),
    Number(rack.fiberOpticProgress || 0),
    Number(rack.readyProgress || 0),
  ];

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const calculateCabinetOverallProgress = (cabinet: any) => {
  const values = [
    Number(cabinet.installCabinetProgress || 0),
    Number(cabinet.acPowerProgress || 0),
    Number(cabinet.utpProgress || 0),
    Number(cabinet.poeSwitchProgress || 0),
    Number(cabinet.fiberOpticProgress || 0),
    Number(cabinet.readyProgress || 0),
  ];

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const countByOverallProgress = (
  items: any[],
  calculateProgress: (item: any) => number
) => ({
  completed: items.filter((item) => calculateProgress(item) >= 100).length,
  inProgress: items.filter((item) => {
    const progress = calculateProgress(item);
    return progress > 0 && progress < 100;
  }).length,
  notStarted: items.filter((item) => calculateProgress(item) <= 0).length,
});

const averageOverallProgress = (
  items: any[],
  calculateProgress: (item: any) => number
) => {
  if (!items.length) return 0;

  return Math.round(
    items.reduce((sum, item) => sum + calculateProgress(item), 0) / items.length
  );
};

const getReportSummary = (equipmentRows: any[]) => {
  const total = equipmentRows.length;
  const completed = equipmentRows.filter((row) => row.progress >= 100).length;
  const inProgress = equipmentRows.filter((row) => row.progress > 0 && row.progress < 100).length;
  const notStarted = equipmentRows.filter((row) => row.progress <= 0).length;
  const overall =
    total > 0
      ? Math.round(equipmentRows.reduce((sum, row) => sum + Number(row.progress || 0), 0) / total)
      : 0;

  return { total, completed, inProgress, notStarted, overall };
};

const getRowsForDate = (
  dateKey: string,
  equipmentRows: any[],
  workPlans: Record<string, any>
) =>
  equipmentRows.filter((row) => {
    const plan = workPlans[row.id] || {};
    return plan.date === dateKey || plan.planStart === dateKey || row.planStartDate === dateKey;
  });

const getWeekRangeFromTuesday = (tuesdayKey: string) => {
  const start = new Date(`${tuesdayKey}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const toIso = (date: Date) => date.toISOString().slice(0, 10);

  return {
    startKey: toIso(start),
    endKey: toIso(end),
  };
};

const getRowsForWeek = (
  tuesdayKey: string,
  equipmentRows: any[],
  workPlans: Record<string, any>
) => {
  const { startKey, endKey } = getWeekRangeFromTuesday(tuesdayKey);

  return equipmentRows.filter((row) => {
    const plan = workPlans[row.id] || {};
    const date = plan.date || plan.planStart || row.planStartDate;
    return date && date >= startKey && date <= endKey;
  });
};

const escapeHtml = (value: any) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const buildReportHtml = ({
  title,
  subTitle,
  equipmentRows,
  workPlans,
  reportRows,
}: {
  title: string;
  subTitle: string;
  equipmentRows: any[];
  workPlans: Record<string, any>;
  reportRows: any[];
}) => {
  const summary = getReportSummary(equipmentRows);
  const generatedAt = new Date().toLocaleString("th-TH");

  const rowsHtml = reportRows
    .map((row) => {
      const plan = workPlans[row.id] || {};

      return `
        <tr>
          <td>${escapeHtml(row.equipmentType)}</td>
          <td><b>${escapeHtml(row.name || row.label || row.id)}</b></td>
          <td>${escapeHtml(row.statusLabel)}</td>
          <td>${Number(row.progress || 0)}%</td>
          <td>${escapeHtml(plan.supervisorName || "-")}</td>
          <td>${escapeHtml(plan.supervisorPhone || "-")}</td>
          <td>${escapeHtml(plan.startTime || "-")} - ${escapeHtml(plan.endTime || "-")}</td>
          <td>${escapeHtml(plan.workDetail || "-")}</td>
          <td>${plan.isWorking ? "On Site" : "-"}</td>
        </tr>
      `;
    })
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Tahoma, sans-serif;
      color: #0f172a;
      background: #f8fafc;
    }
    .page {
      max-width: 1180px;
      margin: 0 auto;
      padding: 32px;
    }
    .hero {
      background: linear-gradient(135deg, #06164a, #0f3b8f);
      color: white;
      border-radius: 24px;
      padding: 28px 32px;
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
    }
    .hero h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .hero p { margin: 8px 0 0; opacity: 0.85; }
    .creator {
      margin-top: 18px;
      color: #facc15;
      font-weight: 800;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
      margin: 24px 0;
    }
    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 18px;
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
    }
    .label {
      color: #64748b;
      font-size: 12px;
      font-weight: 800;
    }
    .value {
      margin-top: 8px;
      font-size: 30px;
      font-weight: 900;
      color: #0f172a;
    }
    h2 {
      margin: 28px 0 12px;
      font-size: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
    }
    th {
      background: #eaf0f7;
      color: #334155;
      font-size: 12px;
      text-align: left;
      padding: 12px;
      text-transform: uppercase;
    }
    td {
      border-top: 1px solid #e2e8f0;
      padding: 12px;
      vertical-align: top;
      font-size: 13px;
    }
    .empty {
      background: white;
      border: 1px dashed #cbd5e1;
      border-radius: 18px;
      padding: 28px;
      text-align: center;
      color: #64748b;
      font-weight: 700;
    }
    .footer {
      margin-top: 26px;
      text-align: right;
      color: #64748b;
      font-size: 12px;
    }
    @media print {
      body { background: white; }
      .page { padding: 12px; }
      .hero, .card, table { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="hero">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(subTitle)}</p>
      <div class="creator">Created by Tadchai Sittisomboon _ AWN (EPM)</div>
    </div>

    <div class="summary">
      <div class="card"><div class="label">Overall Progress</div><div class="value">${summary.overall}%</div></div>
      <div class="card"><div class="label">Total Work</div><div class="value">${summary.total}</div></div>
      <div class="card"><div class="label">Completed</div><div class="value">${summary.completed}</div></div>
      <div class="card"><div class="label">In Progress</div><div class="value">${summary.inProgress}</div></div>
      <div class="card"><div class="label">Not Started</div><div class="value">${summary.notStarted}</div></div>
    </div>

    <h2>Work Detail</h2>
    ${
      reportRows.length > 0
        ? `<table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Equipment</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Supervisor</th>
                <th>Phone</th>
                <th>Time</th>
                <th>Work Detail</th>
                <th>On Site</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>`
        : `<div class="empty">ยังไม่มีรายการงานสำหรับช่วงเวลานี้</div>`
    }

    <div class="footer">Generated at ${escapeHtml(generatedAt)}</div>
  </div>
</body>
</html>`;
};

const downloadHtmlReport = (fileName: string, html: string) => {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const downloadDailyReport = (
  dateKey: string,
  equipmentRows: any[],
  workPlans: Record<string, any>
) => {
  const reportRows = getRowsForDate(dateKey, equipmentRows, workPlans);
  const html = buildReportHtml({
    title: "Daily Work Report",
    subTitle: `Daily Report Date: ${formatDateDisplay(dateKey)}`,
    equipmentRows,
    workPlans,
    reportRows,
  });

  downloadHtmlReport(`Daily-Work-Report-${dateKey}.html`, html);
};

const downloadWeeklyReport = (
  tuesdayKey: string,
  equipmentRows: any[],
  workPlans: Record<string, any>
) => {
  const { startKey, endKey } = getWeekRangeFromTuesday(tuesdayKey);
  const reportRows = getRowsForWeek(tuesdayKey, equipmentRows, workPlans);
  const html = buildReportHtml({
    title: "Weekly Work Report",
    subTitle: `Weekly Report: ${formatDateDisplay(startKey)} - ${formatDateDisplay(endKey)}`,
    equipmentRows,
    workPlans,
    reportRows,
  });

  downloadHtmlReport(`Weekly-Work-Report-${startKey}-to-${endKey}.html`, html);
};


const DashboardOverview: React.FC = () => {
  const {
    cameras,
    racks,
    cabinets,
    fiberRoutes,
    workPlans = {},
    updateWorkPlan = () => {},
  } = useFloorPlan();

  const {
    user,
    users = [],
    onlineUsers = [],
    loginSessions = [],
  } = useAuth();
  const userRole = user?.role || null;
  const canEdit = userRole === "admin" || userRole === "staff";
  const isCustomer = userRole === "customer";

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDayModal, setSelectedDayModal] = useState<string | null>(null);

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
    {
      name: `Completed ${summary.completed} (${summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}%)`,
      value: summary.completed,
    },
    {
      name: `In Progress ${summary.inProgress} (${summary.total > 0 ? Math.round((summary.inProgress / summary.total) * 100) : 0}%)`,
      value: summary.inProgress,
    },
    {
      name: `Not Started ${summary.notStarted} (${summary.total > 0 ? Math.round((summary.notStarted / summary.total) * 100) : 0}%)`,
      value: summary.notStarted,
    },
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

  const getJobsForDate = (dateKey: string) =>
    equipmentRows.filter(
      (row) => row.planStartDate === dateKey || workPlans[row.id]?.date === dateKey
    );

  const hasWorkingOnDate = (dateKey: string) =>
    getJobsForDate(dateKey).some((job) => workPlans[job.id]?.isWorking);

  const months2026 = useMemo(() => {
    return MONTH_NAMES.map((name, index) => {
      const monthNumber = index + 5; // May = 5
      const monthKey = `2026-${String(monthNumber).padStart(2, "0")}`;
      const lastDay = new Date(2026, monthNumber, 0).getDate();

      const days = Array.from({ length: lastDay }, (_, dayIndex) => {
        const day = dayIndex + 1;
        const key = `${monthKey}-${String(day).padStart(2, "0")}`;
        const jobs = getJobsForDate(key);
        const isWorking = hasWorkingOnDate(key);
        const isToday = key === todayKey;

        return {
          day,
          key,
          jobs,
          isWorking,
          isToday,
        };
      });

      const totalJobs = days.reduce((sum, day) => sum + day.jobs.length, 0);
      const workingDays = days.filter((day) => day.isWorking).length;
      const isLive = days.some((day) => day.isToday && day.isWorking);

      return {
        name,
        monthNumber,
        monthKey,
        days,
        totalJobs,
        workingDays,
        isLive,
      };
    });
  }, [equipmentRows, workPlans, todayKey]);


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
              Created by Tadchai Sittisomboon _ AWN (EPM)
            </p>
            <p className="mt-1 text-[11px] font-black text-blue-600 uppercase">
              {user?.username || "Guest"} · {userRole || "no role"}
            </p>
          </div>

          {userRole === "admin" && (
            <Link
              href="/admin/users"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:bg-slate-700 transition"
            >
              Admin Permission
            </Link>
          )}

          <Link
            href="/floorplan"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-500 transition"
          >
            Open Floor Plan
          </Link>
        </div>
      </header>

      <main className="p-5 space-y-5">
        <section className="grid grid-cols-2 md:grid-cols-7 gap-3">
          <KpiCard title="Overall" value={`${summary.overall}%`} tone="blue" />
          <KpiCard title="Total Work" value={summary.total} tone="slate" />
          <KpiCard title="Completed" value={summary.completed} tone="green" />
          <KpiCard title="In Progress" value={summary.inProgress} tone="yellow" />
          <KpiCard title="Not Started" value={summary.notStarted} tone="gray" />
          <KpiDateInputCard
            title="Plan Start"
            value={getProjectPlanStart(workPlans)}
            tone="blue"
            disabled={!canEdit}
            onSave={(isoDate) =>
              canEdit &&
              updateWorkPlan("__project_plan__", {
                date: isoDate,
                planStart: isoDate,
                equipmentName: "Project Plan",
              })
            }
          />
          <KpiDateInputCard
            title="Plan Finish"
            value={getProjectPlanFinish(workPlans)}
            tone="orange"
            disabled={!canEdit}
            onSave={(isoDate) =>
              canEdit &&
              updateWorkPlan("__project_plan__", {
                finishDate: isoDate,
                equipmentName: "Project Plan",
              })
            }
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3">
            <MetricCard title="CCTV Cameras" tone="blue">
              <MetricGrid
                items={[
                  ["Total", cameraStats.total],
                  [
                    "Not Start",
                    countByOverallProgress(safeCameras, calculateCameraOverallProgress)
                      .notStarted,
                  ],
                  [
                    "In Progress",
                    countByOverallProgress(safeCameras, calculateCameraOverallProgress)
                      .inProgress,
                  ],
                  [
                    "Completed",
                    countByOverallProgress(safeCameras, calculateCameraOverallProgress)
                      .completed,
                  ],
                  [
                    "Overall",
                    `${averageOverallProgress(safeCameras, calculateCameraOverallProgress)}%`,
                  ],
                ]}
              />
            </MetricCard>

            <MetricCard title="RACK Equipment" tone="purple">
              <MetricGrid
                items={[
                  ["Total", rackStats.total],
                  [
                    "Not Start",
                    countByOverallProgress(safeRacks, calculateRackOverallProgress)
                      .notStarted,
                  ],
                  [
                    "In Progress",
                    countByOverallProgress(safeRacks, calculateRackOverallProgress)
                      .inProgress,
                  ],
                  [
                    "Completed",
                    countByOverallProgress(safeRacks, calculateRackOverallProgress)
                      .completed,
                  ],
                  [
                    "Overall",
                    `${averageOverallProgress(safeRacks, calculateRackOverallProgress)}%`,
                  ],
                ]}
              />
            </MetricCard>

            <MetricCard title="CABINET Equipment" tone="orange">
              <MetricGrid
                items={[
                  ["Total", cabinetStats.total],
                  [
                    "Not Start",
                    countByOverallProgress(safeCabinets, calculateCabinetOverallProgress)
                      .notStarted,
                  ],
                  [
                    "In Progress",
                    countByOverallProgress(safeCabinets, calculateCabinetOverallProgress)
                      .inProgress,
                  ],
                  [
                    "Completed",
                    countByOverallProgress(safeCabinets, calculateCabinetOverallProgress)
                      .completed,
                  ],
                  [
                    "Overall",
                    `${averageOverallProgress(safeCabinets, calculateCabinetOverallProgress)}%`,
                  ],
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
                // Sync from Rack Type1 + Rack Type2 + Cabinet
                {
                  title: "AC POWER",
                  subTitle: "Power supply installed",
                  progress: averageProgress([...safeRacks, ...safeCabinets], "acPowerProgress"),
                  checked: countByProgress([...safeRacks, ...safeCabinets], "acPowerProgress").completed,
                  total: (safeRacks.length + safeCabinets.length),
                },
                {
                  title: "UTP",
                  subTitle: "Network cable installed",
                  progress: averageProgress([...safeRacks, ...safeCabinets], "utpProgress"),
                  checked: countByProgress([...safeRacks, ...safeCabinets], "utpProgress").completed,
                  total: (safeRacks.length + safeCabinets.length),
                },
                {
                  title: "POE SWITCH",
                  subTitle: "Switch installed",
                  progress: averageProgress([...safeRacks, ...safeCabinets], "poeSwitchProgress"),
                  checked: countByProgress([...safeRacks, ...safeCabinets], "poeSwitchProgress").completed,
                  total: (safeRacks.length + safeCabinets.length),
                },
                {
                  title: "FIBER OPTIC",
                  subTitle: "Fiber optic connected",
                  progress: averageProgress([...safeRacks, ...safeCabinets], "fiberOpticProgress"),
                  checked: countByProgress([...safeRacks, ...safeCabinets], "fiberOpticProgress").completed,
                  total: (safeRacks.length + safeCabinets.length),
                },
                {
                  title: "READY",
                  subTitle: "Rack ready for use",
                  progress: averageProgress([...safeRacks, ...safeCabinets], "readyProgress"),
                  checked: countByProgress([...safeRacks, ...safeCabinets], "readyProgress").completed,
                  total: (safeRacks.length + safeCabinets.length),
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

            <CardContent className="space-y-4">
              <div className="relative h-[210px]">
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

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-3xl font-black text-blue-600">
                    {summary.overall}%
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Overall Progress
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {donutData.map((item, index) => {
                  const percent =
                    summary.total > 0 ? Math.round((item.value / summary.total) * 100) : 0;

                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-semibold text-slate-700">
                          {item.name}
                        </span>
                      </div>

                      <span className="font-black text-slate-900">
                        {item.value} / {percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
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
                    <th className="text-left p-3 w-[70px]">No.</th>
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
                  {equipmentRows.map((row, index) => {
                    const photos = getPhotos(row);

                    return (
                      <tr
                        key={`${row.typeKey}-${row.id}`}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-3 font-black text-slate-700">
                          {index + 1}
                        </td>
                        <td className="p-3 font-semibold">{row.equipmentType}</td>
                        <td className="p-3">
                          <Link
                            href={`/floorplan?focus=${row.typeKey}:${row.id}`}
                            className="text-blue-600 font-semibold hover:underline"
                          >
                            {row.name || row.label || row.id}
                          </Link>
                        </td>
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
                          <DateInput
                            value={workPlans[row.id]?.date || workPlans[row.id]?.planStart || ""}
                            disabled={!canEdit}
                            onSave={(isoDate) =>
                              canEdit &&
                              updateWorkPlan(row.id, {
                                date: isoDate,
                                planStart: isoDate,
                                equipmentName: row.name || row.label || row.id,
                              })
                            }
                          />
                        </td>
                        <td className="p-3">
                          <DateInput
                            value={workPlans[row.id]?.finishDate || ""}
                            disabled={!canEdit}
                            onSave={(isoDate) =>
                              canEdit &&
                              updateWorkPlan(row.id, {
                                finishDate: isoDate,
                                equipmentName: row.name || row.label || row.id,
                              })
                            }
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {photos.length > 0 ? (
                              photos.slice(0, 4).map((photo: string, idx: number) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedPhoto(photo)}
                                  className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in hover:ring-2 hover:ring-blue-400"
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

        <section>
          <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Work Calendar 2026</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
                {months2026.map((month) => (
                  <button
                    key={month.monthKey}
                    onClick={() => setSelectedMonth(month.monthNumber)}
                    className={`rounded-2xl border bg-white p-4 text-left shadow-sm hover:bg-blue-50 hover:border-blue-300 transition ${
                      month.isLive
                        ? "border-yellow-400 border-4 animate-pulse shadow-yellow-200"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-lg font-black text-slate-900">
                          {month.name}
                        </div>
                        <div className="text-xs text-slate-500">2026</div>
                      </div>

                      {month.isLive && (
                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-black">
                          LIVE
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-slate-500">Jobs</div>
                        <div className="font-black text-blue-600">{month.totalJobs}</div>
                      </div>

                      <div>
                        <div className="text-slate-500">Working</div>
                        <div className="font-black text-orange-600">{month.workingDays}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-5">
          <CustomerRequirementBox
            currentUser={user}
            isCustomer={isCustomer}
          />

          <OnlineUsersBox
            currentUser={user}
            users={users}
            onlineUsers={onlineUsers}
            loginSessions={loginSessions}
          />
        </section>
      </main>

      {selectedMonth && (
        <MonthCalendarModal
          month={months2026.find((month) => month.monthNumber === selectedMonth)}
          equipmentRows={equipmentRows}
          workPlans={workPlans}
          onClose={() => setSelectedMonth(null)}
          onSelectDay={(dateKey) => {
            setSelectedDate(dateKey);
            setSelectedDayModal(dateKey);
          }}
        />
      )}

      {selectedDayModal && (
        <DayWorkModal
          dateKey={selectedDayModal}
          equipmentRows={equipmentRows}
          workPlans={workPlans}
          updateWorkPlan={updateWorkPlan}
          canEdit={canEdit}
          onClose={() => setSelectedDayModal(null)}
        />
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[999999] bg-black flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-5 right-5 z-[1000000] h-12 w-12 rounded-full bg-white/15 text-white text-2xl font-black hover:bg-white/25"
          >
            ×
          </button>

          <img
            src={selectedPhoto}
            alt="preview"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[98vw] max-h-[98vh] object-contain"
          />
        </div>
      )}
    </div>
  );
};


const MonthCalendarModal = ({
  month,
  equipmentRows,
  workPlans,
  onClose,
  onSelectDay,
}: {
  month: any;
  equipmentRows: any[];
  workPlans: Record<string, any>;
  onClose: () => void;
  onSelectDay: (dateKey: string) => void;
}) => {
  if (!month) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {month.name} 2026
            </h2>
            <p className="text-sm text-slate-500">
              Monthly daily work calendar
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold"
          >
            Close
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {month.days.map((day: any) => {
              const isTuesday = new Date(`${day.key}T00:00:00`).getDay() === 2;

              return (
                <div
                  key={day.key}
                  onClick={() => onSelectDay(day.key)}
                  className={`min-h-[108px] rounded-2xl border p-3 text-left bg-white hover:bg-blue-50 transition cursor-pointer ${
                    day.isToday && day.isWorking
                      ? "border-yellow-400 border-4 animate-pulse shadow-yellow-200"
                      : day.isWorking
                        ? "border-yellow-300 border-2"
                        : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-black text-slate-900">{day.day}</div>

                    {day.jobs.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black">
                        {day.jobs.length}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 mt-2">
                    {day.jobs.length} jobs
                  </div>

                  {day.isWorking && (
                    <div className="text-[10px] font-black text-yellow-700 mt-1">
                      LIVE WORKING
                    </div>
                  )}

                  {isTuesday && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadWeeklyReport(day.key, equipmentRows, workPlans);
                      }}
                      className="mt-2 w-full rounded-lg bg-blue-600 px-2 py-1.5 text-[10px] font-black text-white hover:bg-blue-500 transition"
                    >
                      Download Weekly Report
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const DayWorkModal = ({
  dateKey,
  equipmentRows,
  workPlans,
  updateWorkPlan,
  canEdit,
  onClose,
}: {
  dateKey: string;
  equipmentRows: any[];
  workPlans: Record<string, any>;
  updateWorkPlan: (id: string, changes: any) => void;
  canEdit: boolean;
  onClose: () => void;
}) => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(
    equipmentRows[0]?.id || ""
  );
  const [showDayJobsModal, setShowDayJobsModal] = useState(false);

  const selectedEquipment = equipmentRows.find(
    (row) => row.id === selectedEquipmentId
  );

  const currentPlan = selectedEquipmentId ? workPlans[selectedEquipmentId] || {} : {};

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Daily Work Plan
            </h2>
            <p className="text-sm text-slate-500">{formatDateDisplay(dateKey)}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadDailyReport(dateKey, equipmentRows, workPlans)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold"
            >
              Download Daily Report
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600">
              Equipment
            </label>
            <select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
            >
              {equipmentRows.map((row) => (
                <option key={`${row.typeKey}-${row.id}`} value={row.id}>
                  {row.equipmentType} - {row.name || row.label || row.id}
                </option>
              ))}
            </select>
          </div>

          {selectedEquipment && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">
                    ชื่อหัวหน้างาน / Supervisor
                  </label>
                  <input
                    type="text"
                    value={currentPlan.supervisorName || ""}
                    disabled={!canEdit}
                    onChange={(e) =>
                      updateWorkPlan(selectedEquipment.id, {
                        date: dateKey,
                        planStart: dateKey,
                        equipmentName: selectedEquipment.name || selectedEquipment.label || selectedEquipment.id,
                        supervisorName: e.target.value,
                      })
                    }
                    placeholder="ระบุชื่อหัวหน้างาน"
                    className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">
                    เบอร์โทร / Phone
                  </label>
                  <input
                    type="tel"
                    value={currentPlan.supervisorPhone || ""}
                    disabled={!canEdit}
                    onChange={(e) =>
                      updateWorkPlan(selectedEquipment.id, {
                        date: dateKey,
                        planStart: dateKey,
                        equipmentName: selectedEquipment.name || selectedEquipment.label || selectedEquipment.id,
                        supervisorPhone: e.target.value,
                      })
                    }
                    placeholder="ระบุเบอร์โทร"
                    className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={currentPlan.startTime || ""}
                    disabled={!canEdit}
                    onChange={(e) =>
                      updateWorkPlan(selectedEquipment.id, {
                        date: dateKey,
                        planStart: dateKey,
                        equipmentName: selectedEquipment.name || selectedEquipment.label || selectedEquipment.id,
                        startTime: e.target.value,
                      })
                    }
                    className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={currentPlan.endTime || ""}
                    disabled={!canEdit}
                    onChange={(e) =>
                      updateWorkPlan(selectedEquipment.id, {
                        date: dateKey,
                        planStart: dateKey,
                        equipmentName: selectedEquipment.name || selectedEquipment.label || selectedEquipment.id,
                        endTime: e.target.value,
                      })
                    }
                    className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">
                  Work Detail
                </label>
                <textarea
                  value={currentPlan.workDetail || ""}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateWorkPlan(selectedEquipment.id, {
                      date: dateKey,
                      planStart: dateKey,
                      equipmentName: selectedEquipment.name || selectedEquipment.label || selectedEquipment.id,
                      workDetail: e.target.value,
                    })
                  }
                  placeholder="ระบุว่าเข้าไปทำอะไร"
                  className="mt-1 w-full min-h-[120px] border border-slate-200 rounded-xl px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              <label className="flex items-center gap-3 p-3 rounded-2xl border border-yellow-200 bg-yellow-50 text-sm font-bold text-yellow-800">
                <input
                  type="checkbox"
                  checked={Boolean(currentPlan.isWorking)}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateWorkPlan(selectedEquipment.id, {
                      date: dateKey,
                      planStart: dateKey,
                      equipmentName: selectedEquipment.name || selectedEquipment.label || selectedEquipment.id,
                      isWorking: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-yellow-500"
                />
                เข้าทำงานวันนี้ / On Site
              </label>

              <button
                type="button"
                onClick={() => setShowDayJobsModal(true)}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-700 transition"
              >
                ดูงานทั้งหมดของวันนี้
              </button>
            </>
          )}
        </div>
      </div>

      {showDayJobsModal && (
        <DayJobListModal
          dateKey={dateKey}
          equipmentRows={equipmentRows}
          workPlans={workPlans}
          onClose={() => setShowDayJobsModal(false)}
        />
      )}
    </div>
  );
};


const DayJobListModal = ({
  dateKey,
  equipmentRows,
  workPlans,
  onClose,
}: {
  dateKey: string;
  equipmentRows: any[];
  workPlans: Record<string, any>;
  onClose: () => void;
}) => {
  const dayJobs = equipmentRows.filter((row) => {
    const plan = workPlans[row.id] || {};
    return plan.date === dateKey || row.planStartDate === dateKey;
  });

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              รายการงานของวันนี้
            </h2>
            <p className="text-sm text-slate-500">{formatDateDisplay(dateKey)}</p>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold"
          >
            Close
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-auto">
          {dayJobs.length > 0 ? (
            <div className="space-y-3">
              {dayJobs.map((row) => {
                const plan = workPlans[row.id] || {};

                return (
                  <div
                    key={`${row.typeKey}-${row.id}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-black text-slate-900">
                          {row.equipmentType} - {row.name || row.label || row.id}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Status: <b>{row.statusLabel}</b> · Progress: <b>{row.progress}%</b>
                        </div>
                      </div>

                      {plan.isWorking && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
                          ON SITE
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-white border border-slate-200 p-3">
                        <div className="text-xs font-bold text-slate-500">
                          หัวหน้างาน
                        </div>
                        <div className="font-semibold text-slate-900">
                          {plan.supervisorName || "-"}
                        </div>
                      </div>

                      <div className="rounded-xl bg-white border border-slate-200 p-3">
                        <div className="text-xs font-bold text-slate-500">
                          เบอร์โทร
                        </div>
                        <div className="font-semibold text-slate-900">
                          {plan.supervisorPhone || "-"}
                        </div>
                      </div>

                      <div className="rounded-xl bg-white border border-slate-200 p-3">
                        <div className="text-xs font-bold text-slate-500">
                          เวลาเริ่ม
                        </div>
                        <div className="font-semibold text-slate-900">
                          {plan.startTime || "-"}
                        </div>
                      </div>

                      <div className="rounded-xl bg-white border border-slate-200 p-3">
                        <div className="text-xs font-bold text-slate-500">
                          เวลาจบ
                        </div>
                        <div className="font-semibold text-slate-900">
                          {plan.endTime || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-white border border-slate-200 p-3">
                      <div className="text-xs font-bold text-slate-500">
                        รายละเอียดงาน
                      </div>
                      <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                        {plan.workDetail || "-"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              ยังไม่มีรายการงานในวันนี้
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



const CustomerRequirementBox = ({
  currentUser,
  isCustomer,
}: {
  currentUser: any;
  isCustomer: boolean;
}) => {
  const [requirements, setRequirements] = React.useState<any[]>([]);
  const [text, setText] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const canSubmitRequirement = isCustomer || currentUser?.role === "admin";

  const loadRequirements = async () => {
    const { data, error } = await supabase
      .from("customer_requirements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load customer requirements error:", error);
      return;
    }

    setRequirements(data || []);
    setIsLoading(false);
  };

  React.useEffect(() => {
    loadRequirements();

    const channel = supabase
      .channel("customer-requirements-sync")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customer_requirements",
        },
        () => {
          loadRequirements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const submitRequirement = async () => {
    if (!text.trim()) return;

    const { error } = await supabase
      .from("customer_requirements")
      .insert({
        message: text.trim(),
        created_by: currentUser?.username || "customer",
      });

    if (error) {
      console.error("Insert requirement error:", error);
      alert(error.message);
      return;
    }

    setText("");
    await loadRequirements();
  };

  return (
    <Card className="rounded-2xl border-2 border-red-500/80 shadow-lg bg-red-50/70 animate-pulse">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-red-700">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white animate-bounce">
            !
          </span>
          Customer Requirement / Comment
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {canSubmitRequirement ? (
          <div className="space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="พิมพ์ Comment หรือ Requirement ถึง Admin / Staff"
              className="w-full min-h-[110px] rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />

            <button
              type="button"
              onClick={submitRequirement}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-black text-white hover:bg-blue-500 transition"
            >
              ส่ง Requirement
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700 font-semibold">
            กล่องนี้สำหรับรับ Requirement / Comment จากลูกค้า และ Admin สามารถเพิ่ม Comment ได้ และ Admin สามารถเพิ่ม Comment ได้
          </div>
        )}

        <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
          {requirements.length > 0 ? (
            requirements.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-black text-slate-700">
                    Requirement / Comment by: {item.created_by || item.createdBy || "-"}
                  </div>

                  <div className="text-[11px] text-slate-400">
                    {new Date(item.created_at).toLocaleString("th-TH")}
                  </div>
                </div>

                <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                  {item.message}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              {isLoading
                ? "Loading..."
                : "ยังไม่มี Requirement จากลูกค้า"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const OnlineUsersBox = ({
  currentUser,
  users,
  onlineUsers,
  loginSessions,
}: {
  currentUser: any;
  users: any[];
  onlineUsers: any[];
  loginSessions: any[];
}) => {
  const knownUsers = users || [];

  const todayKey = new Date().toISOString().slice(0, 10);

  const loginToday = (loginSessions || []).filter(
    (item: any) => String(item.loginAt || "").slice(0, 10) === todayKey
  );

  const isOnline = (username: string) =>
    (onlineUsers || []).some((u: any) => u.username === username);

  const getLastLogin = (username: string) => {
    const found = (loginSessions || []).find(
      (session: any) => session.username === username
    );

    if (!found?.loginAt) return "-";

    return new Date(found.loginAt).toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">
            Login Today / Online Users
          </CardTitle>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-black">
              Login Today {loginToday.length}
            </div>

            <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-black">
              Online {(onlineUsers || []).length}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {currentUser && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-green-800">
                  {currentUser.username}
                </div>

                <div className="text-xs text-green-700 uppercase">
                  Current User · {currentUser.role}
                </div>
              </div>

              <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-black text-white animate-pulse">
                ONLINE
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-[350px] overflow-auto pr-1">
          {knownUsers.length > 0 ? (
            knownUsers.map((item: any) => {
              const online = isOnline(item.username);

              return (
                <div
                  key={item.username}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-900">
                        {item.username}
                      </div>

                      <div className="text-xs uppercase text-slate-500 mt-1">
                        {item.role}
                      </div>
                    </div>

                    {online ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700 animate-pulse">
                        ONLINE
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                        OFFLINE
                      </span>
                    )}
                  </div>

                  <div className="mt-3 text-[11px] text-slate-500">
                    Last Login:
                    <b className="ml-1 text-slate-700">
                      {getLastLogin(item.username)}
                    </b>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              ยังไม่มีข้อมูลผู้ใช้งาน
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const DateInput = ({
  value,
  onSave,
  disabled = false,
}: {
  value?: string;
  onSave: (isoDate: string) => void;
  disabled?: boolean;
}) => {
  const [text, setText] = React.useState(formatDateDisplay(value));

  React.useEffect(() => {
    setText(formatDateDisplay(value));
  }, [value]);

  const commit = (nextText: string) => {
    const isoDate = parseDisplayDate(nextText);
    if (isoDate) onSave(isoDate);
  };

  return (
    <input
      type="text"
      disabled={disabled}
      inputMode="numeric"
      placeholder="วัน/เดือน/ปี"
      value={text}
      onChange={(e) => {
        const nextText = e.target.value;
        setText(nextText);
        if (nextText.length >= 10) commit(nextText);
      }}
      onBlur={() => commit(text)}
      className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-[120px] disabled:bg-slate-100 disabled:text-slate-400"
    />
  );
};

const KpiDateInputCard = ({
  title,
  value,
  tone,
  disabled = false,
  onSave,
}: {
  title: string;
  value?: string;
  tone: Tone;
  disabled?: boolean;
  onSave: (isoDate: string) => void;
}) => (
  <Card className={`rounded-2xl border shadow-sm bg-gradient-to-br ${toneClass[tone]}`}>
    <CardContent className="p-4">
      <div className="text-xs text-slate-500 font-semibold">{title}</div>
      <DateInput value={value} disabled={disabled} onSave={onSave} />
    </CardContent>
  </Card>
);

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
  <div className="grid grid-cols-5 gap-3">
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
