import React, { useState } from "react";
import { Camera } from "@/lib/floorPlanData";
import { useFloorPlan } from "@/contexts/FloorPlanContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CameraStatusModalProps {
  camera: Camera;
  isOpen: boolean;
  onClose: () => void;
  onEditPosition?: () => void;
}

const CameraStatusModal: React.FC<CameraStatusModalProps> = ({
  camera,
  isOpen,
  onClose,
  onEditPosition,
}) => {
  const {
    updateCameraStatus,
    updateCameraRotation,
  } = useFloorPlan();

  const [photos, setPhotos] = useState<string[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...urls].slice(0, 4));
  };

  const rotation = camera.rotation || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[390px] bg-black text-white border border-blue-500 rounded-xl p-4">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-white">
            {camera.name || "Camera"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          <div className="bg-white text-gray-800 rounded-lg px-3 py-2">
            <b>Type:</b>{" "}
            {camera.type === "type1"
              ? "New Installation (Type 1)"
              : "Replacement (Type 2)"}
          </div>

          <div className="bg-yellow-100 text-yellow-800 rounded-lg px-3 py-2 font-semibold">
            Installation Status: {camera.installationStatus || "not_started"}
          </div>

          <div className="bg-green-50 text-black rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-green-700">
                Progress การติดตั้งรวม
              </span>
              <span className="text-[10px] px-2 py-1 rounded bg-white text-gray-500 font-bold">
                {camera.installationStatus || "not_started"}
              </span>
            </div>

            <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "0%" }} />
            </div>

            <div className="text-center text-3xl font-bold text-gray-400 mt-3">
              0%
            </div>
          </div>

          <div className="bg-blue-50 text-black rounded-lg p-3">
            <div className="mb-2 text-gray-500">
              Current Status: {camera.status || "offline"}
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-white text-gray-400 border"
                variant="outline"
                onClick={() => updateCameraStatus(camera.id, "online")}
              >
                Mark as Online
              </Button>

              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => updateCameraStatus(camera.id, "idle")}
              >
                Mark as Idle
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 text-black rounded-lg p-3">
            <div className="font-semibold text-gray-500 mb-2">
              Camera Direction (Rotation)
            </div>

            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) =>
                updateCameraRotation(camera.id, parseInt(e.target.value))
              }
              className="w-full"
            />

            <div className="font-bold">{rotation}°</div>
            <div className="text-[10px] text-gray-500">
              0° = Right, 90° = Down, 180° = Left, 270° = Up
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold">▧ รูปหน้างาน ({photos.length}/4)</div>

              <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs cursor-pointer">
                Upload Photo
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>
            </div>

            <div className="text-center text-gray-500 text-xs py-4">
              {photos.length === 0 ? "ยังไม่มีรูปหน้างาน" : ""}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {onEditPosition && (
              <Button
                onClick={onEditPosition}
                variant="outline"
                className="flex-1 bg-black text-white border-gray-700"
              >
                Edit Position
              </Button>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-black text-white border-gray-700"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraStatusModal;
