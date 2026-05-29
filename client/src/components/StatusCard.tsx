import React, { useMemo } from 'react';
import { useFloorPlan } from '@/contexts/FloorPlanContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const StatusCard: React.FC = () => {
  const { cameras, racks, cabinets } = useFloorPlan();

  const statusCounts = useMemo(() => {
    const safeCameras = cameras || [];
    const safeRacks = racks || [];
    const safeCabinets = cabinets || [];

    const cameraStatus = {
      not_started: safeCameras.filter((c) => c.installationStatus === 'not_started').length,
      in_progress: safeCameras.filter((c) => c.installationStatus === 'in_progress').length,
      completed: safeCameras.filter((c) => c.installationStatus === 'completed').length,
    };

    const rackStatus = {
      not_started: safeRacks.filter((r) => r.installationStatus === 'not_started').length,
      in_progress: safeRacks.filter((r) => r.installationStatus === 'in_progress').length,
      completed: safeRacks.filter((r) => r.installationStatus === 'completed').length,
    };

    const cabinetStatus = {
      not_started: safeCabinets.filter((c) => c.installationStatus === 'not_started').length,
      in_progress: safeCabinets.filter((c) => c.installationStatus === 'in_progress').length,
      completed: safeCabinets.filter((c) => c.installationStatus === 'completed').length,
    };

    return { cameraStatus, rackStatus, cabinetStatus };
  }, [cameras, racks, cabinets]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0 min-w-max">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700">Installation Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Cameras</p>
          <div className="flex gap-2">
            <Badge className={`${getStatusColor('not_started')} border-0`}>Not Started: {statusCounts.cameraStatus.not_started}</Badge>
            <Badge className={`${getStatusColor('in_progress')} border-0`}>In Progress: {statusCounts.cameraStatus.in_progress}</Badge>
            <Badge className={`${getStatusColor('completed')} border-0`}>Completed: {statusCounts.cameraStatus.completed}</Badge>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Racks</p>
          <div className="flex gap-2">
            <Badge className={`${getStatusColor('not_started')} border-0`}>Not Started: {statusCounts.rackStatus.not_started}</Badge>
            <Badge className={`${getStatusColor('in_progress')} border-0`}>In Progress: {statusCounts.rackStatus.in_progress}</Badge>
            <Badge className={`${getStatusColor('completed')} border-0`}>Completed: {statusCounts.rackStatus.completed}</Badge>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Cabinets</p>
          <div className="flex gap-2">
            <Badge className={`${getStatusColor('not_started')} border-0`}>Not Started: {statusCounts.cabinetStatus.not_started}</Badge>
            <Badge className={`${getStatusColor('in_progress')} border-0`}>In Progress: {statusCounts.cabinetStatus.in_progress}</Badge>
            <Badge className={`${getStatusColor('completed')} border-0`}>Completed: {statusCounts.cabinetStatus.completed}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
