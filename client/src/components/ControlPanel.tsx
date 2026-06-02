import React, { useMemo } from "react";
import { useFloorPlan } from "@/contexts/FloorPlanContext";
import { Card, CardContent } from "./ui/card";

const cardBase =
  "border border-slate-200/80 bg-white/95 shadow-sm rounded-xl flex-shrink-0";

const ControlPanel: React.FC = () => {
  const { cameras, racks, cabinets, fiberRoutes } = useFloorPlan();

  const stats = useMemo(() => {
    const safeCameras = cameras || [];
    const safeRacks = racks || [];
    const safeCabinets = cabinets || [];
    const safeFiberRoutes = fiberRoutes || [];

    const totalCameras = safeCameras.length;
    const onlineCameras = safeCameras.filter(
      (c) => Number(c.onlineProgress || 0) >= 100,
    ).length;

    const cameraNotStarted = safeCameras.filter(
      (c) => Number(c.onlineProgress || 0) <= 0,
    ).length;

    const cameraInProgress = safeCameras.filter(
      (c) =>
        Number(c.onlineProgress || 0) > 0 &&
        Number(c.onlineProgress || 0) < 100,
    ).length;

    const cameraCompleted = safeCameras.filter(
      (c) => Number(c.onlineProgress || 0) >= 100,
    ).length;

    const type1Cameras = safeCameras.filter((c) => c.type === "type1").length;

    const type2Cameras = safeCameras.filter((c) => c.type === "type2").length;

    const totalRacks = safeRacks.length;
    const onlineRacks = safeRacks.filter((r) => r.status === "online").length;

    const rackNotStarted = safeRacks.filter(
      (r) => r.installationStatus === "not_started",
    ).length;

    const rackInProgress = safeRacks.filter(
      (r) => r.installationStatus === "in_progress",
    ).length;

    const rackCompleted = safeRacks.filter(
      (r) => r.installationStatus === "completed",
    ).length;

    const newRacks = safeRacks.filter((r) => r.type === "type1").length;

    const oldRacks = safeRacks.filter((r) => r.type === "type2").length;

    const totalCabinets = safeCabinets.length;
    const onlineCabinets = safeCabinets.filter(
      (c) => c.status === "online",
    ).length;

    const cabinetNotStarted = safeCabinets.filter(
      (c) => c.installationStatus === "not_started",
    ).length;

    const cabinetInProgress = safeCabinets.filter(
      (c) => c.installationStatus === "in_progress",
    ).length;

    const cabinetCompleted = safeCabinets.filter(
      (c) => c.installationStatus === "completed",
    ).length;

    const totalFiberRoutes = safeFiberRoutes.length;

    const completedFiberRoutes = safeFiberRoutes.filter(
      (f) => Number(f.progress || 0) >= 100,
    ).length;

    const inProgressFiberRoutes = safeFiberRoutes.filter(
      (f) => Number(f.progress || 0) > 0 && Number(f.progress || 0) < 100,
    ).length;

    const totalFiberProgress =
      totalFiberRoutes > 0
        ? Math.round(
            safeFiberRoutes.reduce(
              (sum, f) => sum + Number(f.progress || 0),
              0,
            ) / totalFiberRoutes,
          )
        : 0;

    const averageProgress = (items: any[], field: string) => {
      if (!items.length) return 0;

      return Math.round(
        items.reduce(
          (sum, item) => sum + Number(item?.[field] || 0),
          0,
        ) / items.length,
      );
    };

    const cameraWiringProgress = averageProgress(
      safeCameras,
      "wiringUTPProgress",
    );

    const cameraWallMountingProgress = averageProgress(
      safeCameras,
      "wallMountingProgress",
    );

    const cameraDomeCameraProgress = averageProgress(
      safeCameras,
      "domeCameraProgress",
    );

    const cameraOnlineProgress = averageProgress(
      safeCameras,
      "onlineProgress",
    );

    const rackCabinetItems = [...safeRacks, ...safeCabinets];

    const rackAcPowerProgress = averageProgress(
      rackCabinetItems,
      "acPowerProgress",
    );

    const rackUtpProgress = averageProgress(
      rackCabinetItems,
      "utpProgress",
    );

    const rackFiberOpticProgress = averageProgress(
      rackCabinetItems,
      "fiberOpticProgress",
    );

    const rackPoeSwitchProgress = averageProgress(
      rackCabinetItems,
      "poeSwitchProgress",
    );

    const rackReadyProgress = averageProgress(
      rackCabinetItems,
      "readyProgress",
    );

    const overallProgress =
      totalCameras > 0 ? Math.round((onlineCameras / totalCameras) * 100) : 0;

    return {
      totalCameras,
      onlineCameras,
      cameraNotStarted,
      cameraInProgress,
      cameraCompleted,
      type1Cameras,
      type2Cameras,
      totalRacks,
      onlineRacks,
      rackNotStarted,
      rackInProgress,
      rackCompleted,
      newRacks,
      oldRacks,
      totalCabinets,
      onlineCabinets,
      cabinetNotStarted,
      cabinetInProgress,
      cabinetCompleted,
      totalFiberRoutes,
      completedFiberRoutes,
      inProgressFiberRoutes,
      totalFiberProgress,
      safeFiberRoutes,
      overallProgress,

      cameraWiringProgress,
      cameraWallMountingProgress,
      cameraDomeCameraProgress,
      cameraOnlineProgress,

      rackAcPowerProgress,
      rackUtpProgress,
      rackFiberOpticProgress,
      rackPoeSwitchProgress,
      rackReadyProgress,
    };
  }, [cameras, racks, cabinets, fiberRoutes]);

  return (
    <div className="w-full border-b border-slate-200 bg-slate-50/80 backdrop-blur">
      <div className="flex items-start gap-2 overflow-x-auto px-2 py-2">
        <Card
          className={`${cardBase} min-w-[150px] bg-gradient-to-br from-slate-900 to-slate-700 text-white`}
        >
          <CardContent className="p-3">
            <div className="text-[11px] font-medium text-slate-300">
              MDL CCTV
            </div>
            <div className="mt-1 text-sm font-bold leading-tight">
              Floor Dashboard
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/20">
              <div
                className="h-1.5 rounded-full bg-emerald-400"
                style={{ width: `${stats.overallProgress}%` }}
              />
            </div>
            <div className="mt-1 text-[10px] text-slate-300">
              Overall {stats.overallProgress}%
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBase} min-w-[260px]`}>
          <CardContent className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700">
                Installation Status
              </div>
              <div className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                Live
              </div>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <StatusMiniRow
                label="Cameras"
                notStarted={stats.cameraNotStarted}
                inProgress={stats.cameraInProgress}
                completed={stats.cameraCompleted}
              />
              <StatusMiniRow
                label="Racks"
                notStarted={stats.rackNotStarted}
                inProgress={stats.rackInProgress}
                completed={stats.rackCompleted}
              />
              <StatusMiniRow
                label="Cabinets"
                notStarted={stats.cabinetNotStarted}
                inProgress={stats.cabinetInProgress}
                completed={stats.cabinetCompleted}
              />
            </div>
          </CardContent>
        </Card>

        <MetricCard
          title="CCTV Cameras"
          tone="blue"
          items={[
            ["Total", stats.totalCameras, "text-slate-900"],
            ["Online", stats.onlineCameras, "text-emerald-600"],
            ["T1 New", stats.type1Cameras, "text-amber-600"],
            ["T2 Replace", stats.type2Cameras, "text-blue-600"],
          ]}
        />

        <MetricCard
          title="RACK Equipment"
          tone="violet"
          items={[
            ["Total", stats.totalRacks, "text-slate-900"],
            ["Ready", stats.onlineRacks, "text-emerald-600"],
            ["Type 1", stats.newRacks, "text-green-600"],
            ["Type 2", stats.oldRacks, "text-blue-600"],
          ]}
        />

        <MetricCard
          title="CABINET Equipment"
          tone="orange"
          items={[
            ["Total", stats.totalCabinets, "text-slate-900"],
            ["Ready", stats.onlineCabinets, "text-emerald-600"],
          ]}
        />

        <Card className={`${cardBase} min-w-[300px]`}>
          <CardContent className="p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-700">
                Fiber Optic Progress
              </div>
              <div className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                รวม {stats.totalFiberProgress}%
              </div>
            </div>

            <div className="mb-1 flex items-center gap-3 text-[10px] text-slate-600">
              <span>
                ทั้งหมด <b>{stats.totalFiberRoutes}</b> เส้น
              </span>
              <span className="font-bold text-emerald-600">
                เสร็จ {stats.completedFiberRoutes}
              </span>
              <span className="font-bold text-amber-600">
                กำลังทำ {stats.inProgressFiberRoutes}
              </span>
            </div>

            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${stats.totalFiberProgress}%` }}
              />
            </div>

            <div className="max-h-[74px] space-y-1 overflow-auto pr-1">
              {stats.safeFiberRoutes.length > 0 ? (
                stats.safeFiberRoutes.map((fiber) => (
                  <div
                    key={fiber.id}
                    className="grid grid-cols-[90px_1fr_34px] items-center gap-2 text-[10px]"
                  >
                    <div className="truncate text-slate-600">
                      {fiber.name || fiber.label || "Fiber Route"}
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${Number(fiber.progress || 0)}%` }}
                      />
                    </div>
                    <div className="text-right font-bold text-amber-700">
                      {Number(fiber.progress || 0)}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-slate-400">
                  ยังไม่มี Fiber Route
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBase} min-w-[300px]`}>
          <CardContent className="p-3">
            <div className="mb-2 text-xs font-bold text-blue-200">
              Camera Installation Steps
            </div>

            <div className="space-y-2">
              <StepProgressRow
                title="Wiring UTP"
                subTitle="Camera Type1 + Type2"
                progress={stats.cameraWiringProgress}
              />
              <StepProgressRow
                title="Install Wall Mounting"
                subTitle="Camera Type1 + Type2"
                progress={stats.cameraWallMountingProgress}
              />
              <StepProgressRow
                title="Install Dome Camera"
                subTitle="Camera Type1 + Type2"
                progress={stats.cameraDomeCameraProgress}
              />
              <StepProgressRow
                title="Camera Online"
                subTitle="Camera Type1 + Type2"
                progress={stats.cameraOnlineProgress}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBase} min-w-[300px]`}>
          <CardContent className="p-3">
            <div className="mb-2 text-xs font-bold text-blue-200">
              Rack Installation Steps
            </div>

            <div className="space-y-2">
              <StepProgressRow
                title="AC POWER"
                subTitle="Rack Type1 + Type2 + Cabinet"
                progress={stats.rackAcPowerProgress}
              />
              <StepProgressRow
                title="UTP"
                subTitle="Rack Type1 + Type2 + Cabinet"
                progress={stats.rackUtpProgress}
              />
              <StepProgressRow
                title="FIBER OPTIC"
                subTitle="Rack Type1 + Type2 + Cabinet"
                progress={stats.rackFiberOpticProgress}
              />
              <StepProgressRow
                title="POE SWITCH"
                subTitle="Rack Type1 + Type2 + Cabinet"
                progress={stats.rackPoeSwitchProgress}
              />
              <StepProgressRow
                title="READY"
                subTitle="Rack Type1 + Type2 + Cabinet"
                progress={stats.rackReadyProgress}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBase} min-w-[190px]`}>
          <CardContent className="p-3">
            <div className="mb-2 text-xs font-bold text-slate-700">Legend</div>
            <div className="grid grid-cols-1 gap-1 text-[9px] text-slate-600">
              <LegendItem label="Camera Type 1 (New)">
                <CameraLegendIcon color="red" />
              </LegendItem>
              <LegendItem label="Camera Type 2 (Replace)">
                <CameraLegendIcon color="blue" />
              </LegendItem>
              <LegendItem label="Rack Type 1 - New RACK">
                <RackLegendIcon color="green" />
              </LegendItem>
              <LegendItem label="Rack Type 2 - Old RACK">
                <RackLegendIcon color="blue" />
              </LegendItem>
              <LegendItem label="Cabinet">
                <CabinetLegendIcon />
              </LegendItem>
              <LegendItem label="Fiber">
                <div className="h-0.5 w-6 rounded bg-red-500" />
              </LegendItem>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBase} min-w-[155px]`}>
          <CardContent className="p-3">
            <div className="mb-2 text-xs font-bold text-slate-700">
              Status Summary
            </div>
            <div className="space-y-1 text-[10px] text-slate-600">
              <SummaryLine
                label="Cameras"
                value={`${stats.onlineCameras}/${stats.totalCameras}`}
              />
              <SummaryLine
                label="RACK"
                value={`${stats.onlineRacks}/${stats.totalRacks}`}
              />
              <SummaryLine
                label="CABINET"
                value={`${stats.onlineCabinets}/${stats.totalCabinets}`}
              />
              <SummaryLine
                label="Fiber"
                value={`${stats.totalFiberProgress}%`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StepProgressRow = ({
  title,
  subTitle,
  progress,
}: {
  title: string;
  subTitle: string;
  progress: number;
}) => (
  <div className="rounded-xl bg-black px-3 py-2 text-white">
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={progress >= 100}
        readOnly
        className="h-4 w-4 rounded border-white"
      />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black">{title}</div>
        <div className="truncate text-[10px] text-slate-200">{subTitle}</div>
      </div>

      <div className="w-16 rounded-lg border border-slate-500 px-2 py-1 text-center text-sm font-black">
        {progress}
      </div>

      <div className="text-sm font-black text-blue-200">%</div>
    </div>

    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
      <div
        className="h-full rounded-full bg-emerald-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

const MetricCard = ({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "blue" | "violet" | "orange";
  items: [string, number, string][];
}) => {
  const toneClass = {
    blue: "from-blue-50 to-sky-50",
    violet: "from-violet-50 to-purple-50",
    orange: "from-orange-50 to-amber-50",
  }[tone];

  return (
    <Card
      className={`${cardBase} min-w-[230px] bg-gradient-to-br ${toneClass}`}
    >
      <CardContent className="p-3">
        <div className="mb-2 text-xs font-bold text-slate-700">{title}</div>
        <div className="flex items-center justify-between gap-3">
          {items.map(([label, value, color]) => (
            <div key={label} className="min-w-max">
              <div className="text-[10px] text-slate-500">{label}</div>
              <div className={`text-sm font-black ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const StatusMiniRow = ({
  label,
  notStarted,
  inProgress,
  completed,
}: {
  label: string;
  notStarted: number;
  inProgress: number;
  completed: number;
}) => (
  <div className="grid grid-cols-[58px_1fr] items-center gap-2">
    <div className="font-semibold text-slate-600">{label}</div>
    <div className="flex gap-1">
      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">
        NS {notStarted}
      </span>
      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 font-bold text-amber-700">
        IP {inProgress}
      </span>
      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-700">
        C {completed}
      </span>
    </div>
  </div>
);

const SummaryLine = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4">
    <span>{label}</span>
    <b className="text-slate-800">{value}</b>
  </div>
);

const LegendItem = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <div className="flex h-5 w-7 items-center justify-center">{children}</div>
    <span className="truncate">{label}</span>
  </div>
);

const CameraLegendIcon = ({ color }: { color: "red" | "blue" }) => {
  const mainColor =
    color === "red"
      ? "bg-red-500 border-red-500"
      : "bg-blue-600 border-blue-600";
  const borderColor = color === "red" ? "border-red-500" : "border-blue-600";

  return (
    <div className="relative h-5 w-7">
      <div
        className={`absolute left-0 top-0 h-5 w-3.5 rounded-l-full ${mainColor}`}
      />
      <div
        className={`absolute right-0 top-0 h-5 w-3.5 rounded-r-sm border ${borderColor} bg-yellow-300`}
      />
    </div>
  );
};

const RackLegendIcon = ({ color }: { color: "green" | "blue" }) => {
  const className =
    color === "green"
      ? "border-green-600 bg-green-300"
      : "border-blue-600 bg-blue-300";

  return (
    <div
      className={`flex h-5 w-5 items-center justify-center rounded border text-[8px] font-black text-slate-800 ${className}`}
    >
      R
    </div>
  );
};

const CabinetLegendIcon = () => (
  <div className="flex h-5 w-5 items-center justify-center rounded border border-orange-500 bg-orange-200 text-[7px] font-black text-slate-800">
    C
  </div>
);

export default ControlPanel;
