import React from 'react';
import { Camera, CameraStatus } from '@/lib/floorPlanData';
import { useFloorPlan } from '@/contexts/FloorPlanContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CameraStatusModalProps {
  camera: Camera;
  isOpen: boolean;
  onClose: () => void;
  onEditPosition?: () => void;
}

const CameraStatusModal: React.FC<CameraStatusModalProps> = ({ camera, isOpen, onClose, onEditPosition }) => {
  const { updateCameraStatus, updateCameraField, updateCameraRotation, updateCameraInstallationStatus, addActivityLog } = useFloorPlan();
  const prevRotationRef = React.useRef(camera.rotation || 0);

  const handleStatusUpdate = (status: CameraStatus) => {
    updateCameraStatus(camera.id, status);
    addActivityLog({
      userId: 'Current User',
      action: `${camera.name} marked as ${status === 'online' ? 'Online' : 'Idle'}`,
      equipmentId: camera.id,
      equipmentName: camera.name,
      equipmentType: 'camera',
      changeType: 'status',
      oldValue: camera.status,
      newValue: status,
    });
  };

  const handleFieldUpdate = (field: keyof Omit<Camera, 'id' | 'type' | 'x' | 'y' | 'name' | 'status'>, value: boolean) => {
    updateCameraField(camera.id, field, value);
    const fieldLabels: Record<string, string> = {
      wiringUTP: 'Wiring UTP',
      wallMountingInstalled: 'Wall Mounting',
      domeCameraInstalled: 'Dome Camera',
    };
    
    // Recalculate installationStatus based on updated checkbox state
    const updatedCamera = {
      wiringUTP: field === 'wiringUTP' ? value : camera.wiringUTP,
      wallMountingInstalled: field === 'wallMountingInstalled' ? value : camera.wallMountingInstalled,
      domeCameraInstalled: field === 'domeCameraInstalled' ? value : camera.domeCameraInstalled,
    };
    const anyChecked = updatedCamera.wiringUTP || updatedCamera.wallMountingInstalled || updatedCamera.domeCameraInstalled;
    const allChecked = updatedCamera.wiringUTP && updatedCamera.wallMountingInstalled && updatedCamera.domeCameraInstalled;

    if (camera.installationStatus !== 'completed') {
      if (!anyChecked) {
        // All unchecked → reset to not_started
        updateCameraInstallationStatus(camera.id, 'not_started');
      } else if (anyChecked && !allChecked) {
        // Some checked → in_progress
        updateCameraInstallationStatus(camera.id, 'in_progress');
      }
      // allChecked but not yet marked online → stay in_progress until Mark as Online
    }
    
    addActivityLog({
      userId: 'Current User',
      action: `${camera.name}: ${fieldLabels[field]} ${value ? 'completed' : 'unchecked'}`,
      equipmentId: camera.id,
      equipmentName: camera.name,
      equipmentType: 'camera',
      changeType: 'installation_step',
      oldValue: !value,
      newValue: value,
    });
  };

  const handleOnlineClick = () => {
    // Check if all prerequisites are met
    if (camera.domeCameraInstalled) {
      handleStatusUpdate('online');
      updateCameraInstallationStatus(camera.id, 'completed');
    }
  };

  const allConditionsMet = camera.wiringUTP && camera.wallMountingInstalled && camera.domeCameraInstalled;

  const getInstallationStatus = () => {
    if (camera.installationStatus === 'completed') return 'Completed';
    if (camera.installationStatus === 'in_progress') return 'In Progress';
    return 'Not Started';
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'in_progress') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{camera.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Camera Type and Installation Status */}
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Type:</span> {camera.type === 'type1' ? 'New Installation (Type 1)' : 'Replacement (Type 2)'}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${getStatusColor(camera.installationStatus)}`}>
              <p className="text-sm font-semibold">
                Installation Status: {getInstallationStatus()}
              </p>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Installation Steps</h3>

            {/* Step 1: Wiring UTP */}
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Checkbox
                id="wiring_utp"
                checked={camera.wiringUTP}
                onCheckedChange={(checked) => handleFieldUpdate('wiringUTP', checked as boolean)}
              />
              <Label htmlFor="wiring_utp" className="flex-1 cursor-pointer">
                <span className="font-medium">Wiring UTP</span>
                <p className="text-xs text-gray-500">Install UTP cable</p>
              </Label>
              {camera.wiringUTP && <span className="text-green-600 text-sm font-semibold">✓</span>}
            </div>

            {/* Step 2: Install Wall Mounting */}
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Checkbox
                id="wall_mounting"
                checked={camera.wallMountingInstalled}
                onCheckedChange={(checked) => handleFieldUpdate('wallMountingInstalled', checked as boolean)}
              />
              <Label htmlFor="wall_mounting" className="flex-1 cursor-pointer">
                <span className="font-medium">Install Wall Mounting</span>
                <p className="text-xs text-gray-500">Mount the bracket on wall</p>
              </Label>
              {camera.wallMountingInstalled && <span className="text-green-600 text-sm font-semibold">✓</span>}
            </div>

            {/* Step 3: Install Dome Camera */}
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Checkbox
                id="dome_camera"
                checked={camera.domeCameraInstalled}
                onCheckedChange={(checked) => handleFieldUpdate('domeCameraInstalled', checked as boolean)}
              />
              <Label htmlFor="dome_camera" className="flex-1 cursor-pointer">
                <span className="font-medium">Install Dome Camera</span>
                <p className="text-xs text-gray-500">Install the dome camera unit</p>
              </Label>
              {camera.domeCameraInstalled && <span className="text-green-600 text-sm font-semibold">✓</span>}
            </div>
          </div>

          {/* Online Status */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-semibold">Current Status:</span> {camera.status}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleOnlineClick}
                disabled={!allConditionsMet}
                className={`flex-1 ${allConditionsMet ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300'}`}
              >
                {camera.status === 'online' ? '✓ Online' : 'Mark as Online'}
              </Button>
              <Button
                onClick={() => {
                  handleStatusUpdate('idle');
                  updateCameraInstallationStatus(camera.id, 'not_started');
                }}
                variant="outline"
                className="flex-1"
              >
                Mark as Idle
              </Button>
            </div>
            {!allConditionsMet && (
              <p className="text-xs text-gray-500 mt-2">Complete all installation steps to mark as online</p>
            )}
          </div>

          {/* Rotation Control */}
          <div className="space-y-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Label className="text-sm font-semibold">Camera Direction (Rotation)</Label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="360"
                value={camera.rotation || 0}
                onChange={(e) => {
                  const newRotation = parseInt(e.target.value);
                  const oldRotation = camera.rotation || 0;
                  updateCameraRotation(camera.id, newRotation);
                  if (newRotation !== oldRotation) {
                    addActivityLog({
                      userId: 'Current User',
                      action: `${camera.name} rotation changed to ${newRotation}°`,
                      equipmentId: camera.id,
                      equipmentName: camera.name,
                      equipmentType: 'camera',
                      changeType: 'rotation',
                      oldValue: oldRotation,
                      newValue: newRotation,
                    });
                  }
                }}
                className="flex-1"
              />
              <span className="text-sm font-semibold min-w-12">{camera.rotation || 0}°</span>
            </div>
            <div className="text-xs text-gray-600">
              0° = Right, 90° = Down, 180° = Left, 270° = Up
            </div>
          </div>

          {/* Edit Position Button */}
          {onEditPosition && (
            <Button onClick={onEditPosition} variant="secondary" className="w-full">
              Edit Position
            </Button>
          )}

          {/* Close Button */}
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraStatusModal;
