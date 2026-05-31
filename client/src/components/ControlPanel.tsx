import React, { useMemo } from "react";
import { useFloorPlan } from "@/contexts/FloorPlanContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import StatusCard from "./StatusCard";

const ControlPanel: React.FC = () => {
  const { cameras, racks, cabinets, fiberRoutes } = useFloorPlan();

  const stats = useMemo(() => {
    const safeCameras = cameras || [];
    const safeRacks = racks || [];
    const safeCabinets = cabinets || [];
    const safeFiberRoutes = fiberRoutes || [];

    const totalCameras = safeCameras.length;
    const onlineCameras = safeCameras.filter(
  (c) => Number(c.onlineProgress || 0) >= 100
).length;

    const type1Cameras = safeCameras.filter(
      (c) => c.type === "type1"
    ).length;

    const type2Cameras = safeCameras.filter(
      (c) => c.type === "type2"
    ).length;

    const totalRacks = safeRacks.length;
    const onlineRacks = safeRacks.filter(
      (r) => r.status === "online"
    ).length;

    const newRacks = safeRacks.filter(
      (r) => r.type === "type1"
    ).length;

    const oldRacks = safeRacks.filter(
      (r) => r.type === "type2"
    ).length;

    const totalCabinets = safeCabinets.length;
    const onlineCabinets = safeCabinets.filter(
      (c) => c.status === "online"
    ).length;

    const totalFiberRoutes = safeFiberRoutes.length;

    const completedFiberRoutes = safeFiberRoutes.filter(
      (f) => (f.progress || 0) >= 100
    ).length;

    const inProgressFiberRoutes = safeFiberRoutes.filter(
      (f) =>
        (f.progress || 0) > 0 &&
        (f.progress || 0) < 100
    ).length;

    const totalFiberProgress =
      totalFiberRoutes > 0
        ? Math.round(
            safeFiberRoutes.reduce(
              (sum, f) => sum + (f.progress || 0),
              0
            ) / totalFiberRoutes
          )
        : 0;

    return {
      totalCameras,
      onlineCameras,
      type1Cameras,
      type2Cameras,
      totalRacks,
      onlineRacks,
      newRacks,
      oldRacks,
      totalCabinets,
      onlineCabinets,
      totalFiberRoutes,
      completedFiberRoutes,
      inProgressFiberRoutes,
      totalFiberProgress,
      safeFiberRoutes,
    };
  }, [cameras, racks, cabinets, fiberRoutes]);

  return (
    <div className="w-full bg-white">
      <div className="px-6 py-4 flex gap-4 overflow-x-auto">
        <div className="flex-shrink-0 flex flex-col justify-center min-w-max pr-4 border-r border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
          <p className="text-xs text-gray-500 mt-1">MDL CCTV Project</p>
        </div>

        <StatusCard />

        <Card className="border-0 bg-blue-50 flex-shrink-0 min-w-max">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              CCTV Cameras
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-1">
            <div className="flex justify-between items-center gap-8">
              <div>
                <span className="text-xs text-gray-600">Total</span>
                <div className="text-lg font-bold text-gray-900">
                  {stats.totalCameras}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-600">Online</span>
                <div className="text-lg font-bold text-green-600">
                  {stats.onlineCameras}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-600">
                  Type 1 (New)
                </span>
                <div className="text-lg font-bold text-yellow-600">
                  {stats.type1Cameras}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-600">
                  Type 2 (Replace)
                </span>
                <div className="text-lg font-bold text-blue-600">
                  {stats.type2Cameras}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-purple-50 flex-shrink-0 min-w-max">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              RACK Equipment
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-1">
            <div className="flex justify-between items-center gap-8">
              <div>
                <span className="text-xs text-gray-600">Total</span>
                <div className="text-lg font-bold text-gray-900">
                  {stats.totalRacks}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-600">Ready</span>
                <div className="text-lg font-bold text-green-600">
                  {stats.onlineRacks}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-600">
                  Type 1 New RACK
                </span>
                <div className="text-lg font-bold text-green-600">
                  {stats.newRacks}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-600">
                  Type 2 Old RACK
                </span>
                <div className="text-lg font-bold text-blue-600">
                  {stats.oldRacks}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-orange-50 flex-shrink-0 min-w-max">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              CABINET Equipment
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-1">
            <div className="flex justify-between items-center gap-8">
              <div>
                <span className="text-xs text-gray-600">Total</span>
                <div className="text-lg font-bold text-gray-900">
                  {stats.totalCabinets}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-600">Ready</span>
                <div className="text-lg font-bold text-green-600">
                  {stats.onlineCabinets}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-green-50 flex-shrink-0 min-w-[420px]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Fiber Optic Progress
              </CardTitle>

              <div className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold">
                รวม {stats.totalFiberProgress}%
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <div>
                ทั้งหมด{" "}
                <span className="font-bold">
                  {stats.totalFiberRoutes}
                </span>{" "}
                เส้น
              </div>

              <div className="text-green-600 font-bold">
                เสร็จ {stats.completedFiberRoutes}
              </div>

              <div className="text-yellow-600 font-bold">
                กำลังทำ {stats.inProgressFiberRoutes}
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{
                  width: `${stats.totalFiberProgress}%`,
                }}
              />
            </div>

            <div className="space-y-2 max-h-[180px] overflow-auto pr-1">
              {stats.safeFiberRoutes.length > 0 ? (
                stats.safeFiberRoutes.map((fiber) => (
                  <div
                    key={fiber.id}
                    className="grid grid-cols-[120px_1fr_50px] gap-3 items-center"
                  >
                    <div className="text-sm text-gray-700 truncate">
                      {fiber.name || fiber.label || "Fiber Route"}
                    </div>

                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{
                          width: `${fiber.progress || 0}%`,
                        }}
                      />
                    </div>

                    <div className="text-sm font-bold text-yellow-700 text-right">
                      {fiber.progress || 0}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">
                  ยังไม่มี Fiber Route
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gray-50 flex-shrink-0 min-w-max">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Legend
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full border-2 border-yellow-400 bg-yellow-100"></div>
              <span>Camera Type 1 (New)</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-blue-400 bg-blue-100"></div>
              <span>Camera Type 2 (Replace)</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-green-500 bg-green-200"></div>
              <span>Rack Type 1 - New RACK</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-blue-500 bg-blue-200"></div>
              <span>Rack Type 2 - Old RACK (Existing)</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-orange-400 bg-orange-100"></div>
              <span>Cabinet</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-red-500"></div>
              <span>Fiber</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-blue-50 flex-shrink-0 min-w-max">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              How to Use
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-1 text-xs text-gray-600">
            <p>1. Click equipment to view</p>
            <p>2. Update status step by step</p>
            <p>3. Mark as Online when done</p>
            <p>4. Scroll to zoom, right-click to pan</p>
          </CardContent>
        </Card>

        <div className="flex-shrink-0 flex flex-col justify-center min-w-max pl-4 border-l border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Status Summary
          </h3>

          <div className="space-y-1 text-xs">
            <p>
              <span className="font-semibold">Total Cameras:</span>{" "}
              {stats.totalCameras}
            </p>

            <p>
              <span className="font-semibold">Cameras Online:</span>{" "}
              <span className="text-green-600 font-bold">
                {stats.onlineCameras}
              </span>
            </p>

            <p>
              <span className="font-semibold">RACK Ready:</span>{" "}
              <span className="text-green-600 font-bold">
                {stats.onlineRacks}/{stats.totalRacks}
              </span>
            </p>

            <p>
              <span className="font-semibold">CABINET Ready:</span>{" "}
              <span className="text-green-600 font-bold">
                {stats.onlineCabinets}/{stats.totalCabinets}
              </span>
            </p>

            <p>
              <span className="font-semibold">Fiber Progress:</span>{" "}
              <span className="text-yellow-600 font-bold">
                {stats.totalFiberProgress}%
              </span>
            </p>

            <p>
              <span className="font-semibold">Overall Progress:</span>{" "}
              <span className="text-blue-600 font-bold">
                {stats.totalCameras > 0
                  ? Math.round(
                      (stats.onlineCameras / stats.totalCameras) * 100
                    )
                  : 0}
                %
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
