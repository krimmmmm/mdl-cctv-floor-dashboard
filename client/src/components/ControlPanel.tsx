import React, { useMemo } from 'react';
import { useFloorPlan } from '@/contexts/FloorPlanContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import StatisticsPanel from './StatisticsPanel';
import StatusCard from './StatusCard';

const ControlPanel: React.FC = () => {
  const { cameras, racks, cabinets } = useFloorPlan();

  const stats = useMemo(() => {
    const totalCameras = cameras.length;
    const onlineCameras = cameras.filter((c) => c.status === 'online').length;
    const type1Cameras = cameras.filter((c) => c.type === 'type1').length;
    const type2Cameras = cameras.filter((c) => c.type === 'type2').length;

    const totalRacks = racks.length;
    const onlineRacks = racks.filter((r) => r.status === 'online').length;

    const totalCabinets = cabinets.length;
    const onlineCabinets = cabinets.filter((c) => c.status === 'online').length;

    return {
      totalCameras,
      onlineCameras,
      type1Cameras,
      type2Cameras,
      totalRacks,
      onlineRacks,
      totalCabinets,
      onlineCabinets,
    };
  }, [cameras, racks, cabinets]);

  return (
    <div className="w-full bg-white">
      <div className="px-6 py-4 flex gap-4 overflow-x-auto">
        {/* Dashboard Header */}
        <div className="flex-shrink-0 flex flex-col justify-center min-w-max pr-4 border-r border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
          <p className="text-xs text-gray-500 mt-1">MDL CCTV Project</p>
        </div>

        {/* Status Card */}
        <StatusCard />

        {/* CCTV Cameras Card */}
        <Card className="border-0 bg-blue-50 flex-shrink-0 min-w-max">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">CCTV Cameras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between items-center gap-8">
              <div>
                <span className="text-xs text-gray-600">Total</span>
                <div className="text-lg font-bold text-gray-900">{stats.totalCameras}</div>
              </div>
              <div>
                <span className="text-xs text-gray-600">Online</span>
                <div className="text-lg font-bold text-green-600">{stats.onlineCameras}</div>
              </div>
              <div>
                <span className="text-xs text-gray-600">Type 1</span>
                <div className="text-lg font-bold text-yellow-600">{stats.type1Cameras}</div>
              </div>
              <div>
                <span className="text-xs text-gray-600">Type 2</span>
                <div className="text-lg font-bold text-blue-600">{stats.type2Cameras}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RACK Equipment Card */}
        <Card className="border-0 bg-purple-50 flex-shrink-0 min-w-max">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">RACK Equipment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between items-center gap-8">
              <div>
                <span className="text-xs text-gray-600">Total</span>
                <div className="text-lg font-bold text-gray-900">{stats.totalRacks}</div>
              </div>
              <div>
                <span className="text-xs text-gray-600">Ready</span>
                <div className="text-lg font-bold text-green-600">{stats.onlineRacks}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CABINET Equipment Card */}
        <Card className="border-0 bg-orange-50 flex-shrink-0 min-w-max">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">CABINET Equipment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between items-center gap-8">
              <div>
                <span className="text-xs text-gray-600">Total</span>
                <div className="text-lg font-bold text-gray-900">{stats.totalCabinets}</div>
              </div>
              <div>
                <span className="text-xs text-gray-600">Ready</span>
                <div className="text-lg font-bold text-green-600">{stats.onlineCabinets}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend Card */}
        <Card className="border-0 bg-gray-50 flex-shrink-0 min-w-max">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full border-2 border-yellow-400 bg-yellow-100"></div>
              <span>Type 1</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-blue-400 bg-blue-100"></div>
              <span>Type 2</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-blue-500 bg-blue-200"></div>
              <span>Old RACK</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-green-500 bg-green-200"></div>
              <span>New RACK</span>
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

        {/* How to Use Card */}
        <Card className="border-0 bg-blue-50 flex-shrink-0 min-w-max">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-gray-600">
            <p>1. Click equipment to view</p>
            <p>2. Update status step by step</p>
            <p>3. Mark as Online when done</p>
            <p>4. Scroll to zoom, right-click to pan</p>
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <div className="flex-shrink-0 flex flex-col justify-center min-w-max pl-4 border-l border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Status Summary</h3>
          <div className="space-y-1 text-xs">
            <p><span className="font-semibold">Total Cameras:</span> {stats.totalCameras}</p>
            <p><span className="font-semibold">Cameras Online:</span> <span className="text-green-600 font-bold">{stats.onlineCameras}</span></p>
            <p><span className="font-semibold">RACK Ready:</span> <span className="text-green-600 font-bold">{stats.onlineRacks}/{stats.totalRacks}</span></p>
            <p><span className="font-semibold">CABINET Ready:</span> <span className="text-green-600 font-bold">{stats.onlineCabinets}/{stats.totalCabinets}</span></p>
            <p><span className="font-semibold">Overall Progress:</span> <span className="text-blue-600 font-bold">{Math.round((stats.onlineCameras / stats.totalCameras) * 100)}%</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
