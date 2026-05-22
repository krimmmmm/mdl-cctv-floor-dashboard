import ControlPanel from '@/components/ControlPanel';
import FloorPlanCanvas from '@/components/FloorPlanCanvas';
import { ActivityLog } from '@/components/ActivityLog';
import { useFloorPlan } from '@/contexts/FloorPlanContext';
import { Loader2 } from 'lucide-react';

/**
 * MDL CCTV Floor Plan Dashboard
 * Interactive dashboard for managing CCTV equipment installation and status
 * Layout: Horizontal cards at top, full-width floor plan below
 */
export default function Home() {
  const { isLoading, hasDbError } = useFloorPlan();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* DB error banner */}
      {hasDbError && !isLoading && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 flex items-center gap-2">
          <span className="text-yellow-700 text-sm font-medium">⚠️ ไม่สามารถเชื่อมต่อ Database ได้ — แสดงข้อมูลเริ่มต้น (ข้อมูลจะไม่ถูกบันทึก)</span>
        </div>
      )}

      {/* Loading overlay while fetching from DB */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600 font-medium">Loading data from database...</p>
          </div>
        </div>
      )}
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MDL CCTV Floor Plan Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">AIS-MDL New CCTV Project - Interactive Installation Tracker</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">สร้างโดย Tadchai Sittisomboob (EPM)</p>
            </div>
          </div>
        </header>

        {/* Main Content - Vertical Layout */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Control Panel - Horizontal Cards at Top */}
          <div className="flex-shrink-0 border-b border-gray-200 overflow-x-auto bg-white">
            <ControlPanel />
          </div>

          {/* Floor Plan Canvas - Full Width Middle */}
          <div className="flex-1 overflow-hidden">
            <FloorPlanCanvas />
          </div>

          {/* Activity Log - Horizontal at Bottom */}
          <div className="h-48 border-t border-gray-200 overflow-hidden flex flex-col bg-white">
            <ActivityLog />
          </div>
        </div>
      </div>
  );
}
