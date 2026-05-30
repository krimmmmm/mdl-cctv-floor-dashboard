import { Checkbox } from "@/components/ui/checkbox";
import React, { useEffect, useState } from "react";
import { Camera } from "@/lib/floorPlanData";
import { useFloorPlan } from "@/contexts/FloorPlanContext";
import { supabase } from "@/lib/supabase";
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
    updateCameraField,
    updateCameraInstallationStatus,
  } = useFloorPlan();

  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const existingPhotos = [
      (camera as any).photo1,
      (camera as any).photo2,
      (camera as any).photo3,
      (camera as any).photo4,
    ].filter(Boolean);

    setPhotos(existingPhotos);
  }, [camera]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files).slice(0, 4)) {
      const fileName = `${camera.id}-${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("camera-photos")
        .upload(fileName, file, {
          upsert: true,
        });

      if (error) {
        console.error("UPLOAD ERROR:", error);
        continue;
      }

      const { data } = supabase.storage
        .from("camera-photos")
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }

    setPhotos(uploadedUrls);

    uploadedUrls.forEach((url, index) => {
      updateCameraField(camera.id, `photo${index + 1}`, url);
    });
  };

  const rotation = camera.rotation || 0;

  const completedSteps = [
    camera.wiringUTP,
    camera.wallMountingInstalled,
    camera.domeCameraInstalled,
  ].filter(Boolean).length;

  const progress = Math.round((completedSteps / 3) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-[760px] max-h-[88vh] overflow-y-auto !bg-[#050505] !text-white !border-blue-500 rounded-xl p-5 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-white">
            {camera.name || "Camera"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 px-1">
          <div className="bg-white text-gray-800 rounded-lg px-3 py-2">
            <b>Type:</b>{" "}
            {camera.type === "type1"
              ? "New Installation (Type 1)"
              : "Replacement (Type 2)"}
          </div>

          <div className="bg-yellow-100 text-yellow-800 rounded-lg px-3 py-2 font-semibold col-span-2">
            Installation Status: {camera.installationStatus || "not_started"}
          </div>

          <div className="space-y-2 col-span-2">
            <div className="text-gray-400 text-xs">Installation Steps</div>

            <div className="border border-gray-700 rounded-lg p-3 bg-black flex items-center gap-3">
              <Checkbox
                checked={camera.wiringUTP || false}
                onCheckedChange={(checked) => {
                  const value = Boolean(checked);
                  updateCameraField(camera.id, "wiringUTP", value);
                  updateCameraInstallationStatus(
                    camera.id,
                    value ? "in_progress" : "not_started"
                  );
                }}
              />

              <div className="flex-1">
                <div className="font-bold text-white">Wiring UTP</div>
                <div className="text-[10px] text-gray-500">
                  Install UTP cable
                </div>
              </div>

              <div className="text-green-400 text-lg">
                {camera.wiringUTP ? "✓" : ""}
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg p-3 bg-black flex items-center gap-3">
              <Checkbox
                checked={camera.wallMountingInstalled || false}
                onCheckedChange={(checked) => {
                  const value = Boolean(checked);
                  updateCameraField(camera.id, "wallMountingInstalled", value);
                  updateCameraInstallationStatus(
                    camera.id,
                    value ? "in_progress" : "not_started"
                  );
                }}
              />

              <div className="flex-1">
                <div className="font-bold text-white">
                  Install Wall Mounting
                </div>

                <div className="text-[10px] text-gray-500">
                  Mount the bracket on wall
                </div>
              </div>

              <div className="text-green-400 text-lg">
                {camera.wallMountingInstalled ? "✓" : ""}
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg p-3 bg-black flex items-center gap-3">
              <Checkbox
                checked={camera.domeCameraInstalled || false}
                onCheckedChange={(checked) => {
                  const value = Boolean(checked);
                  updateCameraField(camera.id, "domeCameraInstalled", value);
                  updateCameraInstallationStatus(
                    camera.id,
                    value ? "completed" : "in_progress"
                  );
                }}
              />

              <div className="flex-1">
                <div className="font-bold text-white">
                  Install Dome Camera
                </div>

                <div className="text-[10px] text-gray-500">
                  Install the dome camera unit
                </div>
              </div>

              <div className="text-green-400 text-lg">
                {camera.domeCameraInstalled ? "✓" : ""}
              </div>
            </div>
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
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="text-center text-3xl font-bold text-gray-400 mt-3">
              {progress}%
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

          <div className="bg-yellow-50 text-black rounded-lg p-3 col-span-2">
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

          <div className="col-span-2 pt-3 border-t border-gray-800">
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

            <div className="grid grid-cols-2 gap-2 mt-2">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`photo-${index}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-700"
                />
              ))}

              {photos.length === 0 && (
                <div className="text-center text-gray-500 text-xs py-4 col-span-2">
                  ยังไม่มีรูปหน้างาน
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2 col-span-2">
            {onEditPosition && (
              <Button
                onClick={onEditPosition}
                variant="outline"
                className="flex-1 !bg-black !text-white !border-gray-700"
              >
                Edit Position
              </Button>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 !bg-black !text-white !border-gray-700"
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
