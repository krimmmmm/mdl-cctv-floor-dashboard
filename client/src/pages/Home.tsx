import { useState } from 'react';
import ControlPanel from '@/components/ControlPanel';
import FloorPlanCanvas from '@/components/FloorPlanCanvas';
import { ActivityLog } from '@/components/ActivityLog';
import { useFloorPlan } from '@/contexts/FloorPlanContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield, Eye, Upload } from 'lucide-react';
import { Link } from 'wouter';

/**
 * MDL CCTV Floor Plan Dashboard
 * Interactive dashboard for managing CCTV equipment installation and status
 * Layout: Horizontal cards at top, full-width floor plan below
 */
export default function Home() {
  const { isLoading, hasDbError, uploadFloorPlan } = useFloorPlan();
  const { user, logout } = useAuth();
  const [isUploadingFloorPlan, setIsUploadingFloorPlan] = useState(false);

  const role = user?.role || 'customer';
  const isAdmin = role === 'admin';
  const isNewStaff = role === 'newstaff';
  const isStaffOnly = role === 'staffonly';
  const canViewFloorPlan = role === 'admin' || role === 'newstaff' || role === 'staffonly' || role === 'staff' || role === 'customer';
  const canManageLayout = isAdmin;
  const canManageFiber = role === 'admin' || role === 'newstaff' || role === 'staffonly';
  const canEditProgress = role === 'admin' || role === 'newstaff' || role === 'staffonly';
  const isCustomer = role === 'customer';

  const handleResetFloorPlanView = () => {
    window.dispatchEvent(new CustomEvent('resetFloorPlanView'));
  };

  const handleFloorPlanUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;

    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const isWebpFile =
      file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp");

    if (!isWebpFile) {
      alert("รองรับเฉพาะไฟล์ .webp เท่านั้น");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ไฟล์ Floor Plan ต้องมีขนาดไม่เกิน 5 MB");
      return;
    }

    if (typeof uploadFloorPlan !== "function") {
      alert("ระบบ Upload Floor Plan ยังไม่พร้อม กรุณาอัปเดต FloorPlanContext.tsx ก่อน");
      return;
    }

    setIsUploadingFloorPlan(true);

    try {
      const success = await uploadFloorPlan(file);

      if (success) {
        alert("Upload Floor Plan สำเร็จ");
      }
    } catch (error: any) {
      console.error("Upload Floor Plan failed:", error);
      alert(error?.message || "Upload Floor Plan ไม่สำเร็จ");
    } finally {
      setIsUploadingFloorPlan(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* DB error banner */}
      {hasDbError && !isLoading && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 flex items-center gap-2">
          <span className="text-yellow-700 text-sm font-medium">
            ⚠️ ไม่สามารถเชื่อมต่อ Database ได้ — แสดงข้อมูลเริ่มต้น (ข้อมูลจะไม่ถูกบันทึก)
          </span>
        </div>
      )}

      {/* Customer read-only banner */}
      {isCustomer && !isLoading && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2 flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <span className="text-blue-700 text-sm font-medium">
            Customer View Mode — สามารถดูข้อมูลได้เท่านั้น ไม่สามารถแก้ไข Floor Plan ได้
          </span>
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
        <div className="px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              MDL CCTV Floor Plan Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              AIS-MDL New CCTV Project - Interactive Installation Tracker
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold shadow-sm hover:bg-slate-700 transition"
            >
              ← Dashboard
            </Link>

            {isAdmin && (
              <label
                className={`px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm transition flex items-center gap-2 ${
                  isUploadingFloorPlan
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-500 cursor-pointer"
                }`}
              >
                {isUploadingFloorPlan ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploadingFloorPlan ? "Uploading..." : "Upload Floor Plan"}
                <input
                  type="file"
                  accept=".webp,image/webp"
                  disabled={isUploadingFloorPlan}
                  onChange={handleFloorPlanUpload}
                  className="hidden"
                />
              </label>
            )}

            <button
              type="button"
              onClick={handleResetFloorPlanView}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-500 transition"
            >
              Reset View
            </button>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200">
              <Shield className="w-4 h-4 text-slate-600" />
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-700">
                  {user?.username || 'Guest'}
                </p>
                <p className="text-[10px] uppercase font-black text-blue-600">
                  {role}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100 hover:bg-red-100 transition"
            >
              Logout
            </button>

            <div className="text-right ml-2">
              <p className="text-xs text-gray-500">
                Created by Tadchai Sittisomboon (EPM)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Vertical Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Control Panel - Hidden for Customer */}
        {canManageLayout ? (
          <div className="flex-shrink-0 border-b border-gray-200 overflow-x-auto bg-white">
            <ControlPanel />
          </div>
        ) : (
          <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-700">
                View Only Mode
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Admin เท่านั้นที่สามารถเพิ่ม/ลด/ย้ายตำแหน่งอุปกรณ์ได้ ส่วน Staff สามารถอัปเดต Progress ได้ และ Customer ดูข้อมูลได้เท่านั้น
              </p>
            </div>
          </div>
        )}

        {/* Floor Plan Canvas - Full Width Middle */}
        <div className="flex-1 overflow-hidden">
          <FloorPlanCanvas
            readOnly={!canViewFloorPlan}
            canManageLayout={canManageLayout}
            canManageFiber={canManageFiber}
            canEditProgress={canEditProgress}
          />
        </div>

        {/* Activity Log - Admin/Staff only */}
        {!isCustomer && (
          <div className="h-48 border-t border-gray-200 overflow-hidden flex flex-col bg-white">
            <ActivityLog />
          </div>
        )}
      </div>
    </div>
  );
}
