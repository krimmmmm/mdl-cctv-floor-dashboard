import React, { useMemo } from "react";
import { Rack, RackStatus } from "@/lib/floorPlanData";
import { useFloorPlan } from "@/contexts/FloorPlanContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RackStatusModalProps {
  rack: Rack;
  isOpen: boolean;
  onClose: () => void;
  onEditPosition?: () => void;
}

const RackStatusModal: React.FC<RackStatusModalProps> = ({
  rack,
  isOpen,
  onClose,
  onEditPosition,
}) => {
  const {
    updateRackStatus,
    updateRackField,
    updateRackInstallationStatus,
    addActivityLog,
    updateRackPhotos,
  } = useFloorPlan();

  const handleStatusUpdate = (
    status: RackStatus
  ) => {
    updateRackStatus(rack.id, status);
  };

  const handleFieldUpdate = (
    field: keyof Omit<
      Rack,
      "id" | "type" | "x" | "y" | "name" | "status"
    >,
    value: boolean
  ) => {
    updateRackField(rack.id, field, value);

    const updated = {
      acPower:
        field === "acPower"
          ? value
          : rack.acPower,

      utp:
        field === "utp"
          ? value
          : rack.utp,

      poeSwitch:
        field === "poeSwitch"
          ? value
          : rack.poeSwitch,

      fiberOptic:
        field === "fiberOptic"
          ? value
          : rack.fiberOptic,

      ready:
        field === "ready"
          ? value
          : rack.ready,
    };

    const checkedCount =
      Object.values(updated).filter(Boolean)
        .length;

    if (checkedCount === 0) {
      updateRackInstallationStatus(
        rack.id,
        "not_started"
      );
    } else if (checkedCount === 5) {
      updateRackInstallationStatus(
        rack.id,
        "completed"
      );
    } else {
      updateRackInstallationStatus(
        rack.id,
        "in_progress"
      );
    }
  };

  const handleOnlineClick = () => {
    if (
      rack.acPower &&
      rack.utp &&
      rack.ready
    ) {
      handleStatusUpdate("online");

      updateRackInstallationStatus(
        rack.id,
        "completed"
      );

      addActivityLog({
        userId: "current_user",
        equipmentId: rack.id,
        equipmentName: rack.name,
        equipmentType: "rack",
        changeType: "status",
        action: `${rack.name} marked as Online`,
        oldValue: "idle",
        newValue: "online",
      });
    }
  };

  const allConditionsMet =
    rack.acPower &&
    rack.utp &&
    rack.ready;

  const checkedCount = [
    rack.acPower,
    rack.utp,
    rack.poeSwitch,
    rack.fiberOptic,
    rack.ready,
  ].filter(Boolean).length;

  const totalProgress = useMemo(() => {
    return Math.round(
      (checkedCount / 5) * 100
    );
  }, [checkedCount]);

  const getInstallationStatusDisplay =
    () => {
      if (checkedCount === 0)
        return "Not Started";

      if (checkedCount === 5)
        return "Completed";

      return "In Progress";
    };

  const getStatusColor = () => {
    if (checkedCount === 0)
      return "bg-yellow-100 text-yellow-800";

    if (checkedCount === 5)
      return "bg-green-100 text-green-700";

    return "bg-orange-100 text-orange-700";
  };

  const photoList = [
    rack.photo1,
    rack.photo2,
    rack.photo3,
    rack.photo4,
  ].filter(Boolean);

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files) return;

    const uploadedPhotos: string[] = [];

    for (
      let i = 0;
      i < files.length;
      i++
    ) {
      const file = files[i];

      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          uploadedPhotos.push(
            reader.result as string
          );
          resolve();
        };

        reader.readAsDataURL(file);
      });
    }

    updateRackPhotos(
      rack.id,
      uploadedPhotos
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-2xl bg-black border border-blue-500 text-white overflow-y-auto max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-white">
            {rack.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* TYPE */}
          <div className="bg-white text-black rounded-xl p-4">
            <p className="font-bold">
              Type:{" "}
              {rack.type === "type2" ||
              rack.type === "old"
                ? "Old RACK (Existing)"
                : 'New RACK (WALL RACK 19" GERMAN 6U)'}
            </p>
          </div>

          {/* STATUS */}
          <div
            className={`rounded-xl p-4 font-bold text-lg ${getStatusColor()}`}
          >
            Installation Status:{" "}
            {getInstallationStatusDisplay()}
          </div>

          {/* ITEMS */}
          <div className="space-y-4">
            <h3 className="text-blue-300 text-lg font-semibold">
              Installation Steps
            </h3>

            {[
              {
                key: "acPower",
                title: "AC POWER",
                desc: "Power supply installed",
                checked: rack.acPower,
              },

              {
                key: "utp",
                title: "UTP",
                desc: "Network cable installed",
                checked: rack.utp,
              },

              {
                key: "poeSwitch",
                title: "POE SWITCH",
                desc: "Switch installed",
                checked: rack.poeSwitch,
              },

              {
                key: "fiberOptic",
                title: "FIBER OPTIC",
                desc: "Fiber optic connected",
                checked: rack.fiberOptic,
              },

              {
                key: "ready",
                title: "READY",
                desc: "Rack ready for use",
                checked: rack.ready,
              },
            ].map((item) => (
              <div
                key={item.key}
                className="border border-blue-900 rounded-xl p-4 bg-black"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={(
                      checked
                    ) =>
                      handleFieldUpdate(
                        item.key as any,
                        checked as boolean
                      )
                    }
                  />

                  <div className="flex-1">
                    <div className="font-bold text-xl">
                      {item.title}
                    </div>

                    <div className="text-gray-400 text-sm">
                      {item.desc}
                    </div>
                  </div>

                  {item.checked && (
                    <div className="text-green-400 text-2xl">
                      ✓
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL PROGRESS */}
          <div className="bg-[#dff0e5] rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-green-700">
                Progress รวม
              </div>

              <div
                className={`px-4 py-2 rounded-full text-lg font-bold ${
                  totalProgress === 100
                    ? "bg-green-200 text-green-700"
                    : totalProgress === 0
                    ? "bg-yellow-200 text-yellow-700"
                    : "bg-orange-200 text-orange-700"
                }`}
              >
                {getInstallationStatusDisplay()}
              </div>
            </div>

            <div className="w-full h-5 bg-gray-300 rounded-full mt-5 overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{
                  width: `${totalProgress}%`,
                }}
              />
            </div>

            <div className="text-center text-6xl font-extrabold text-orange-600 mt-6">
              {totalProgress}%
            </div>
          </div>

          {/* PHOTO UPLOAD */}
          <div className="space-y-4">
            <div className="text-xl font-bold text-blue-300">
              Upload Rack Photos
            </div>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="w-full bg-white text-black rounded-lg p-3"
            />

            {photoList.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {photoList.map(
                  (photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`rack-${index}`}
                      className="rounded-xl border border-blue-500"
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* STATUS BUTTONS */}
          <div className="bg-blue-50 border border-blue-300 rounded-xl p-4">
            <p className="text-black font-semibold mb-4">
              Current Status:{" "}
              {rack.status}
            </p>

            <div className="flex gap-3">
              <Button
                onClick={
                  handleOnlineClick
                }
                disabled={
                  !allConditionsMet
                }
                className={`flex-1 ${
                  allConditionsMet
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400"
                }`}
              >
                {rack.status ===
                "online"
                  ? "✓ Online"
                  : "Mark as Online"}
              </Button>

              <Button
                onClick={() =>
                  handleStatusUpdate(
                    "idle"
                  )
                }
                variant="outline"
                className="flex-1 text-black"
              >
                Mark as Idle
              </Button>
            </div>
          </div>

          {/* BUTTONS */}
          {onEditPosition && (
            <Button
              onClick={onEditPosition}
              className="w-full bg-gray-700 hover:bg-gray-600"
            >
              Edit Position
            </Button>
          )}

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full text-black"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RackStatusModal;
