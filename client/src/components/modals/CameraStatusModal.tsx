import React, { useState } from 'react';
import { Camera, CameraStatus } from '@/lib/floorPlanData';
import { useFloorPlan } from '@/contexts/FloorPlanContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
    updateCameraField,
    updateCameraRotation,
    updateCameraInstallationStatus,
  } = useFloorPlan();

  const [photos, setPhotos] = useState<string[]>([]);

  const completedSteps = [
    camera.wiringUTP,
    camera.wallMountingInstalled,
    camera.domeCameraInstalled,
  ].filter(Boolean).length;

  const progress = Math.round((completedSteps / 3) * 100);

  const handleStatusUpdate = (status: CameraStatus) => {
    updateCameraStatus(camera.id, status);
  };

  const handleFieldUpdate = (field: any, value: boolean) => {
    updateCameraField(camera.id, field, value);

    const updatedCamera = {
      wiringUTP:
        field === 'wiringUTP' ? value : camera.wiringUTP,

      wallMountingInstalled:
        field === 'wallMountingInstalled'
          ? value
          : camera.wallMountingInstalled,

      domeCameraInstalled:
        field === 'domeCameraInstalled'
          ? value
          : camera.domeCameraInstalled,
    };

    const completed = [
      updatedCamera.wiringUTP,
      updatedCamera.wallMountingInstalled,
      updatedCamera.domeCameraInstalled,
    ].filter(Boolean).length;

    if (completed === 0) {
      updateCameraInstallationStatus(
        camera.id,
        'not_started'
      );
    } else if (completed < 3) {
      updateCameraInstallationStatus(
        camera.id,
        'in_progress'
      );
    } else {
      updateCameraInstallationStatus(
        camera.id,
        'completed'
      );
    }
  };

  const handleUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files) return;

    const newPhotos: string[] = [];

    Array.from(files).forEach((file) => {
      newPhotos.push(URL.createObjectURL(file));
    });

    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 4));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-black text-white border border-blue-400">

        <DialogHeader>
          <DialogTitle className="text-xl">
            {camera.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* TYPE */}
          <div className="bg-gray-100 text-black rounded-lg p-3">
            <b>Type:</b>{' '}
            {camera.type === 'type1'
              ? 'New Installation (Type 1)'
              : 'Replacement (Type 2)'}
          </div>

          {/* STATUS */}
          <div className="bg-yellow-100 text-yellow-800 rounded-lg p-3 font-semibold">
            Installation Status:{' '}
            {camera.installationStatus === 'completed'
              ? 'Completed'
              : camera.installationStatus === 'in_progress'
              ? 'In Progress'
              : 'Not Started'}
          </div>

          {/* INSTALLATION STEPS */}
          <div className="space-y-3">

            {/* Wiring */}
            <div className="border rounded-xl p-3">
              <div className="flex items-center gap-3">

                <Checkbox
                  checked={camera.wiringUTP}
                  onCheckedChange={(checked) =>
                    handleFieldUpdate(
                      'wiringUTP',
                      checked as boolean
                    )
                  }
                />

                <div className="flex-1">
                  <div className="font-semibold">
                    Wiring UTP
                  </div>

                  <div className="text-xs text-gray-400">
                    Install UTP cable
                  </div>
                </div>

                {camera.wiringUTP && (
                  <span className="text-green-400">
                    ✓
                  </span>
                )}
              </div>
            </div>

            {/* Wall Mount */}
            <div className="border rounded-xl p-3">
              <div className="flex items-center gap-3">

                <Checkbox
                  checked={camera.wallMountingInstalled}
                  onCheckedChange={(checked) =>
                    handleFieldUpdate(
                      'wallMountingInstalled',
                      checked as boolean
                    )
                  }
                />

                <div className="flex-1">
                  <div className="font-semibold">
                    Install Wall Mounting
                  </div>

                  <div className="text-xs text-gray-400">
                    Mount bracket
                  </div>
                </div>

                {camera.wallMountingInstalled && (
                  <span className="text-green-400">
                    ✓
                  </span>
                )}
              </div>
            </div>

            {/* Dome */}
            <div className="border rounded-xl p-3">
              <div className="flex items-center gap-3">

                <Checkbox
                  checked={camera.domeCameraInstalled}
                  onCheckedChange={(checked) =>
                    handleFieldUpdate(
                      'domeCameraInstalled',
                      checked as boolean
                    )
                  }
                />

                <div className="flex-1">
                  <div className="font-semibold">
                    Install Dome Camera
                  </div>

                  <div className="text-xs text-gray-400">
                    Install camera
                  </div>
                </div>

                {camera.domeCameraInstalled && (
                  <span className="text-green-400">
                    ✓
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="bg-green-50 rounded-xl p-4 text-black">

            <div className="flex justify-between mb-2">
              <span className="font-semibold">
                Progress Installation
              </span>

              <span>
                {camera.installationStatus}
              </span>
            </div>

            <div className="w-full bg-gray-300 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="text-center text-4xl font-bold mt-4">
              {progress}%
            </div>
          </div>

          {/* STATUS BUTTON */}
          <div className="bg-gray-100 rounded-xl p-4 text-black">

            <div className="mb-3">
              Current Status: {camera.status}
            </div>

            <div className="flex gap-3">

              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() =>
                  handleStatusUpdate('online')
                }
              >
                Mark as Online
              </Button>

              <Button
                className="flex-1"
                variant="outline"
                onClick={() =>
                  handleStatusUpdate('idle')
                }
              >
                Mark as Idle
              </Button>
            </div>
          </div>

          {/* ROTATION */}
          <div className="bg-yellow-50 rounded-xl p-4 text-black">

            <Label className="font-semibold">
              Camera Direction (Rotation)
            </Label>

            <input
              type="range"
              min="0"
              max="360"
              value={camera.rotation || 0}
              onChange={(e) =>
                updateCameraRotation(
                  camera.id,
                  parseInt(e.target.value)
                )
              }
              className="w-full mt-3"
            />

            <div className="mt-2 font-semibold">
              {camera.rotation || 0}°
            </div>

            <div className="text-xs text-gray-500">
              0° = Right, 90° = Down,
              180° = Left, 270° = Up
            </div>
          </div>

          {/* UPLOAD PHOTO */}
          <div className="space-y-3">

            <div className="flex justify-between items-center">
              <div className="font-semibold">
                รูปหน้างาน ({photos.length}/4)
              </div>

              <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded cursor-pointer text-sm">
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

            <div className="grid grid-cols-2 gap-2">

              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  className="rounded-lg border h-24 w-full object-cover"
                />
              ))}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">

            {onEditPosition && (
              <Button
                onClick={onEditPosition}
                className="flex-1"
                variant="outline"
              >
                Edit Position
              </Button>
            )}

            <Button
              onClick={onClose}
              className="flex-1"
              variant="outline"
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
