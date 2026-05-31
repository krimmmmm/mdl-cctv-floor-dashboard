import React, { useMemo } from "react";
import { Rack, RackStatus } from "@/lib/floorPlanData";
import { useFloorPlan } from "@/contexts/FloorPlanContext";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

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
    updateRackPhotos,
  } = useFloorPlan();

  const steps = [
    {
      key: "acPower",
      title: "AC POWER",
      desc: "Power supply installed",
      progressKey: "acPowerProgress",
      progress: rack.acPowerProgress || 0,
      checked: rack.acPower,
    },

    {
      key: "utp",
      title: "UTP",
      desc: "Network cable installed",
      progressKey: "utpProgress",
      progress: rack.utpProgress || 0,
      checked: rack.utp,
    },

    {
      key: "poeSwitch",
      title: "POE SWITCH",
      desc: "Switch installed",
      progressKey: "poeSwitchProgress",
      progress: rack.poeSwitchProgress || 0,
      checked: rack.poeSwitch,
    },

    {
      key: "fiberOptic",
      title: "FIBER OPTIC",
      desc: "Fiber optic connected",
      progressKey: "fiberOpticProgress",
      progress: rack.fiberOpticProgress || 0,
      checked: rack.fiberOptic,
    },

    {
      key: "ready",
      title: "READY",
      desc: "Rack ready for use",
      progressKey: "readyProgress",
      progress: rack.readyProgress || 0,
      checked: rack.ready,
    },
  ];

  const totalProgress = useMemo(() => {
    const total =
      steps.reduce(
        (sum, item) =>
          sum + (item.progress || 0),
        0
      ) / steps.length;

    return Math.round(total);
  }, [rack]);

  const installationStatus =
    totalProgress === 0
      ? "Not Started"
      : totalProgress === 100
      ? "Completed"
      : "In Progress";

  const handleProgress = (
    field: string,
    value: number
  ) => {
    updateRackField(
      rack.id,
      field,
      Math.max(0, Math.min(100, value))
    );
  };

  const handleCheck = (
    field: string,
    value: boolean
  ) => {
    updateRackField(rack.id, field, value);
  };

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
      <DialogContent className="bg-black border border-cyan-500 text-white max-w-4xl overflow-y-auto max-h-[95vh]">
        <div className="space-y-5">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-4xl font-bold">
                {rack.name}
              </div>

              <div className="text-cyan-400 font-bold mt-2">
                Type:{" "}
                {rack.type === "type2"
                  ? "Old RACK (Existing)"
                  : 'New RACK (WALL RACK 19" GERMAN 6U)'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={rack.isUrgent || false}
                onChange={(e) =>
                  updateRackField(
                    rack.id,
                    "isUrgent",
                    e.target.checked
                  )
                }
              />

              <div className="text-yellow-400 font-bold">
                URGENT
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="flex gap-4">
            <div className="flex-1 border border-yellow-600 rounded-xl p-4 bg-[#221900]">
              <div className="text-yellow-400 text-2xl font-bold">
                Installation Status :{" "}
                {installationStatus}
              </div>
            </div>

            <select
              value={rack.installationStatus}
              onChange={(e) =>
                updateRackInstallationStatus(
                  rack.id,
                  e.target.value
                )
              }
              className="bg-black border border-cyan-500 rounded-xl px-5 text-xl"
            >
              <option value="not_started">
                Not Started
              </option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="completed">
                Completed
              </option>
            </select>
          </div>

          {/* INSTALLATION */}
          <div>
            <div className="text-cyan-400 text-2xl font-bold mb-4 border-b border-cyan-700 pb-2">
              INSTALLATION STEPS
            </div>

            <div className="border border-cyan-800 rounded-xl overflow-hidden">
              {steps.map((item) => (
                <div
                  key={item.key}
                  className="border-b border-cyan-900 p-4 bg-black"
                >
                  <div className="grid grid-cols-[50px_1fr_220px_60px] gap-4 items-center">

                    {/* CHECK */}
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) =>
                        handleCheck(
                          item.key,
                          e.target.checked
                        )
                      }
                      className="w-6 h-6"
                    />

                    {/* TITLE */}
                    <div>
                      <div className="text-3xl font-bold">
                        {item.title}
                      </div>

                      <div className="text-gray-400">
                        {item.desc}
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="flex items-center gap-2">
                      <button
                        className="bg-red-700 px-4 py-2 rounded-lg text-xl"
                        onClick={() =>
                          handleProgress(
                            item.progressKey,
                            item.progress - 10
                          )
                        }
                      >
                        -
                      </button>

                      <div className="bg-[#182234] w-full rounded-lg h-12 flex items-center justify-center text-2xl font-bold">
                        {item.progress} %
                      </div>

                      <button
                        className="bg-green-700 px-4 py-2 rounded-lg text-xl"
                        onClick={() =>
                          handleProgress(
                            item.progressKey,
                            item.progress + 10
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    {/* STATUS */}
                    <div className="text-center text-3xl">
                      {item.progress >= 100
                        ? "✅"
                        : item.progress > 0
                        ? "🟡"
                        : "⚪"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TOTAL */}
          <div className="bg-[#dff0e5] rounded-2xl p-6">
            <div className="flex justify-between">
              <div className="text-green-700 text-5xl font-bold">
                ความคืบหน้ารวม
              </div>

              <div className="bg-yellow-300 text-yellow-900 rounded-full px-5 py-2 text-2xl font-bold">
                {installationStatus}
              </div>
            </div>

            <div className="bg-gray-300 rounded-full h-8 mt-6 overflow-hidden">
              <div
                className="bg-orange-500 h-full transition-all duration-500"
                style={{
                  width: `${totalProgress}%`,
                }}
              />
            </div>

            <div className="text-center text-8xl font-extrabold text-orange-600 mt-8">
              {totalProgress}%
            </div>
          </div>

          {/* PHOTOS */}
          <div>
            <div className="text-cyan-400 text-2xl font-bold mb-4 border-b border-cyan-700 pb-2">
              UPLOAD RACK PHOTOS
            </div>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="mb-5"
            />

            <div className="grid grid-cols-4 gap-4">
              {[
                rack.photo1,
                rack.photo2,
                rack.photo3,
                rack.photo4,
              ]
                .filter(Boolean)
                .map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    className="rounded-xl border border-cyan-500 h-40 w-full object-cover"
                  />
                ))}
            </div>
          </div>

          {/* STATUS */}
          <div className="border border-cyan-700 rounded-xl p-5">
            <div className="text-cyan-400 text-2xl font-bold mb-4">
              CURRENT STATUS :{" "}
              {rack.status}
            </div>

            <div className="flex gap-4">
              <Button
                className="flex-1 bg-green-700 hover:bg-green-800 text-2xl h-16"
                onClick={() =>
                  updateRackStatus(
                    rack.id,
                    "online"
                  )
                }
              >
                ✓ Mark as Online
              </Button>

              <Button
                className="flex-1 bg-gray-900 border border-gray-600 text-2xl h-16"
                onClick={() =>
                  updateRackStatus(
                    rack.id,
                    "idle"
                  )
                }
              >
                Mark as Idle
              </Button>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              className="h-16 text-2xl bg-[#111827]"
              onClick={onEditPosition}
            >
              ✥ Edit Position
            </Button>

            <Button
              className="h-16 text-2xl bg-black border border-gray-500"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RackStatusModal;
