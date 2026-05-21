import React from 'react';
import { Rack, RackStatus } from '@/lib/floorPlanData';
import { useFloorPlan } from '@/contexts/FloorPlanContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface RackStatusModalProps {
  rack: Rack;
  isOpen: boolean;
  onClose: () => void;
  onEditPosition?: () => void;
}

const RackStatusModal: React.FC<RackStatusModalProps> = ({ rack, isOpen, onClose, onEditPosition }) => {
  const { updateRackStatus, updateRackField, updateRackInstallationStatus, addActivityLog } = useFloorPlan();

  const handleStatusUpdate = (status: RackStatus) => {
    updateRackStatus(rack.id, status);
  };

  const handleFieldUpdate = (field: keyof Omit<Rack, 'id' | 'type' | 'x' | 'y' | 'name' | 'status'>, value: boolean) => {
    updateRackField(rack.id, field, value);
    
    // Compute updated state for all checkboxes
    const updated = {
      acPower: field === 'acPower' ? value : rack.acPower,
      utp: field === 'utp' ? value : rack.utp,
      poeSwitch: field === 'poeSwitch' ? value : rack.poeSwitch,
      fiberOptic: field === 'fiberOptic' ? value : rack.fiberOptic,
      ready: field === 'ready' ? value : rack.ready,
    };
    const checkedCount = Object.values(updated).filter(Boolean).length;
    
    // Update installation status based on checked items
    if (checkedCount === 0) {
      updateRackInstallationStatus(rack.id, 'not_started');
    } else if (checkedCount === 5) {
      updateRackInstallationStatus(rack.id, 'completed');
    } else {
      updateRackInstallationStatus(rack.id, 'in_progress');
    }
  };

  const handleOnlineClick = () => {
    if (rack.acPower && rack.utp && rack.ready) {
      handleStatusUpdate('online');
      updateRackInstallationStatus(rack.id, 'completed');
      addActivityLog({
        userId: 'current_user',
        equipmentId: rack.id,
        equipmentName: rack.name,
        equipmentType: 'rack',
        changeType: 'status',
        action: `${rack.name} marked as Online`,
        oldValue: 'idle',
        newValue: 'online'
      });
    }
  };

  const allConditionsMet = rack.acPower && rack.utp && rack.ready;
  
  // Calculate installation status display
  const getInstallationStatusDisplay = () => {
    const checkedCount = [
      rack.acPower,
      rack.utp,
      rack.poeSwitch,
      rack.fiberOptic,
      rack.ready
    ].filter(Boolean).length;
    
    if (checkedCount === 0) return 'Not Started';
    if (checkedCount === 5) return 'Completed';
    return 'In Progress';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{rack.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Installation Status */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Installation Status:</span> <span className="font-semibold text-blue-600">{getInstallationStatusDisplay()}</span>
            </p>
          </div>

        {/* Rack Type */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Type:</span> {rack.type === 'old' ? 'Old RACK (Existing)' : 'New RACK (WALL RACK 19" GERMAN 6U)'}
            </p>
          </div>

          {/* Installation/Configuration Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Configuration Items</h3>

            {/* AC POWER */}
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Checkbox
                id="ac_power"
                checked={rack.acPower}
                onCheckedChange={(checked) => handleFieldUpdate('acPower', checked as boolean)}
              />
              <Label htmlFor="ac_power" className="flex-1 cursor-pointer">
                <span className="font-medium">AC POWER</span>
                <p className="text-xs text-gray-500">Power supply installed</p>
              </Label>
              {rack.acPower && <span className="text-green-600 text-sm font-semibold">✓</span>}
            </div>

            {/* UTP */}
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Checkbox
                id="utp"
                checked={rack.utp}
                onCheckedChange={(checked) => handleFieldUpdate('utp', checked as boolean)}
              />
              <Label htmlFor="utp" className="flex-1 cursor-pointer">
                <span className="font-medium">UTP</span>
                <p className="text-xs text-gray-500">Network cables installed</p>
              </Label>
              {rack.utp && <span className="text-green-600 text-sm font-semibold">✓</span>}
            </div>

            {/* POE Switch */}
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Checkbox
                id="poe_switch"
                checked={rack.poeSwitch}
                onCheckedChange={(checked) => handleFieldUpdate('poeSwitch', checked as boolean)}
              />
              <Label htmlFor="poe_switch" className="flex-1 cursor-pointer">
                <span className="font-medium">POE Switch</span>
                <p className="text-xs text-gray-500">Power over Ethernet switch</p>
              </Label>
              {rack.poeSwitch && <span className="text-green-600 text-sm font-semibold">✓</span>}
            </div>

            {/* Fiber Optic */}
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Checkbox
                id="fiber_optic"
                checked={rack.fiberOptic}
                onCheckedChange={(checked) => handleFieldUpdate('fiberOptic', checked as boolean)}
              />
              <Label htmlFor="fiber_optic" className="flex-1 cursor-pointer">
                <span className="font-medium">Fiber Optic</span>
                <p className="text-xs text-gray-500">Fiber optic connection (optional)</p>
              </Label>
              {rack.fiberOptic && <span className="text-green-600 text-sm font-semibold">✓</span>}
            </div>

            {/* Ready */}
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Checkbox
                id="ready"
                checked={rack.ready}
                onCheckedChange={(checked) => handleFieldUpdate('ready', checked as boolean)}
              />
              <Label htmlFor="ready" className="flex-1 cursor-pointer">
                <span className="font-medium">Ready</span>
                <p className="text-xs text-gray-500">All checks passed</p>
              </Label>
              {rack.ready && <span className="text-green-600 text-sm font-semibold">✓</span>}
            </div>
          </div>

          {/* Online Status */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-semibold">Current Status:</span> {rack.status}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleOnlineClick}
                disabled={!allConditionsMet}
                className={`flex-1 ${allConditionsMet ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300'}`}
              >
                {rack.status === 'online' ? '✓ Online' : 'Mark as Online'}
              </Button>
              <Button
                onClick={() => handleStatusUpdate('idle')}
                variant="outline"
                className="flex-1"
              >
                Mark as Idle
              </Button>
            </div>
            {!allConditionsMet && (
              <p className="text-xs text-gray-500 mt-2">Complete all required items to mark as online</p>
            )}
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

export default RackStatusModal;
