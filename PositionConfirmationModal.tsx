import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Rack, Cabinet } from '@/lib/floorPlanData';

interface PositionConfirmationModalProps {
  isOpen: boolean;
  item: Camera | Rack | Cabinet | null;
  newX: number;
  newY: number;
  oldX: number;
  oldY: number;
  onConfirm: () => void;
  onCancel: () => void;
  onPositionChange: (x: number, y: number) => void;
}

const PositionConfirmationModal: React.FC<PositionConfirmationModalProps> = ({
  isOpen,
  item,
  newX,
  newY,
  oldX,
  oldY,
  onConfirm,
  onCancel,
  onPositionChange,
}) => {
  const [x, setX] = useState(newX);
  const [y, setY] = useState(newY);

  React.useEffect(() => {
    setX(newX);
    setY(newY);
  }, [newX, newY]);

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setX(value);
    onPositionChange(value, y);
  };

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setY(value);
    onPositionChange(x, value);
  };

  const handleConfirm = () => {
    onPositionChange(x, y);
    onConfirm();
  };

  const handleRevert = () => {
    setX(oldX);
    setY(oldY);
    onPositionChange(oldX, oldY);
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirm Position Change</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">Equipment: {item.name}</p>
            <p className="text-xs text-gray-500">ID: {item.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="old-x" className="text-xs">
                Old X Position
              </Label>
              <Input
                id="old-x"
                type="number"
                value={oldX.toFixed(0)}
                disabled
                className="mt-1 bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="old-y" className="text-xs">
                Old Y Position
              </Label>
              <Input
                id="old-y"
                type="number"
                value={oldY.toFixed(0)}
                disabled
                className="mt-1 bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-x" className="text-xs">
                New X Position
              </Label>
              <Input
                id="new-x"
                type="number"
                value={x.toFixed(0)}
                onChange={handleXChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-y" className="text-xs">
                New Y Position
              </Label>
              <Input
                id="new-y"
                type="number"
                value={y.toFixed(0)}
                onChange={handleYChange}
                className="mt-1"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> You can manually edit the X and Y coordinates or confirm the dragged position.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleRevert}>
            Revert to Old Position
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
            Confirm Position
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PositionConfirmationModal;
