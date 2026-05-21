import React, { useEffect, useRef } from 'react';
import { useFloorPlan } from '@/contexts/FloorPlanContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export const ActivityLog: React.FC = () => {
  const { activityLogs } = useFloorPlan();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new activity is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activityLogs]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'status':
        return 'bg-blue-100 text-blue-800';
      case 'position':
        return 'bg-purple-100 text-purple-800';
      case 'rotation':
        return 'bg-orange-100 text-orange-800';
      case 'installation_step':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentTypeColor = (equipmentType: string) => {
    switch (equipmentType) {
      case 'camera':
        return 'bg-yellow-50 border-l-4 border-yellow-400';
      case 'rack':
        return 'bg-green-50 border-l-4 border-green-400';
      case 'cabinet':
        return 'bg-blue-50 border-l-4 border-blue-400';
      default:
        return 'bg-gray-50 border-l-4 border-gray-400';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Activity Log</h3>
        <p className="text-xs text-gray-500 mt-1">Real-time updates of all changes</p>
      </div>

      {/* Activity List */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-3 space-y-2">
          {activityLogs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p className="text-sm">No activities yet</p>
            </div>
          ) : (
            activityLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-md text-sm transition-all ${getEquipmentTypeColor(log.equipmentType)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{log.action}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {log.equipmentName}
                      </Badge>
                      <Badge className={`text-xs ${getChangeTypeColor(log.changeType)}`}>
                        {log.changeType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                      <span>By: {log.userId}</span>
                      <span>•</span>
                      <span>{formatTime(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
