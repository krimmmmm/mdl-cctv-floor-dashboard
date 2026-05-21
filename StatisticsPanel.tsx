import React, { useMemo } from 'react';
import { useFloorPlan } from '@/contexts/FloorPlanContext';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatisticsPanel: React.FC = () => {
  const { cameras, racks, cabinets } = useFloorPlan();

  const stats = useMemo(() => {
    // Camera statistics
    const camerasByStatus = {
      idle: cameras.filter((c) => c.status === 'idle').length,
      wiring_utp: cameras.filter((c) => c.status === 'wiring_utp').length,
      install_wall_mounting: cameras.filter((c) => c.status === 'install_wall_mounting').length,
      install_dome_camera: cameras.filter((c) => c.status === 'install_dome_camera').length,
      online: cameras.filter((c) => c.status === 'online').length,
    };

    // Rack statistics
    const racksByStatus = {
      idle: racks.filter((r) => r.status === 'idle').length,
      online: racks.filter((r) => r.status === 'online').length,
    };

    // Cabinet statistics
    const cabinetsByStatus = {
      idle: cabinets.filter((c) => c.status === 'idle').length,
      online: cabinets.filter((c) => c.status === 'online').length,
    };

    return {
      camerasByStatus,
      racksByStatus,
      cabinetsByStatus,
    };
  }, [cameras, racks, cabinets]);

  const cameraChartData = [
    { name: 'Idle', value: stats.camerasByStatus.idle, fill: '#9CA3AF' },
    { name: 'Wiring UTP', value: stats.camerasByStatus.wiring_utp, fill: '#F59E0B' },
    { name: 'Wall Mount', value: stats.camerasByStatus.install_wall_mounting, fill: '#3B82F6' },
    { name: 'Dome Camera', value: stats.camerasByStatus.install_dome_camera, fill: '#8B5CF6' },
    { name: 'Online', value: stats.camerasByStatus.online, fill: '#22C55E' },
  ];

  const equipmentChartData = [
    { name: 'RACK', idle: stats.racksByStatus.idle, online: stats.racksByStatus.online },
    { name: 'CABINET', idle: stats.cabinetsByStatus.idle, online: stats.cabinetsByStatus.online },
  ];

  return (
    <div className="space-y-4">
      {/* Camera Status Distribution */}
      <Card className="border-0 bg-white">
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Camera Installation Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={cameraChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {cameraChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Equipment Status */}
      <Card className="border-0 bg-white">
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Equipment Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={equipmentChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="idle" stackId="a" fill="#9CA3AF" />
              <Bar dataKey="online" stackId="a" fill="#22C55E" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Status */}
      <Card className="border-0 bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Summary</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Total Cameras:</span>
              <span className="font-semibold">{cameras.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Cameras Online:</span>
              <span className="font-semibold text-green-600">{stats.camerasByStatus.online}</span>
            </div>
            <div className="flex justify-between">
              <span>RACK Online:</span>
              <span className="font-semibold text-green-600">{stats.racksByStatus.online}/{racks.length}</span>
            </div>
            <div className="flex justify-between">
              <span>CABINET Online:</span>
              <span className="font-semibold text-green-600">{stats.cabinetsByStatus.online}/{cabinets.length}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
              <span>Overall Progress:</span>
              <span className="font-semibold">
                {Math.round(
                  ((stats.camerasByStatus.online + stats.racksByStatus.online + stats.cabinetsByStatus.online) /
                    (cameras.length + racks.length + cabinets.length)) *
                    100
                )}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsPanel;
