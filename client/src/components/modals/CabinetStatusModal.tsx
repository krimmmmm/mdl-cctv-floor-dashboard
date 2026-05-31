import React, { useMemo } from "react";
import {
  Cabinet,
  CabinetStatus,
} from "@/lib/floorPlanData";

import { useFloorPlan } from "@/contexts/FloorPlanContext";

interface CabinetStatusModalProps {
  cabinet: Cabinet;
  isOpen: boolean;
  onClose: () => void;
  onEditPosition?: () => void;
}

const CabinetStatusModal: React.FC<
  CabinetStatusModalProps
> = ({
  cabinet,
  isOpen,
  onClose,
  onEditPosition,
}) => {
  const {
    updateCabinetStatus,
    updateCabinetField,
    updateCabinetInstallationStatus,
  } = useFloorPlan();

  if (!isOpen) return null;

  const stepList = [
    {
      key: "installCabinet",
      title: "INSTALL CABINET",
      desc: "Cabinet installed",
    },
    {
      key: "acPower",
      title: "AC POWER",
      desc: "Power supply installed",
    },
    {
      key: "utp",
      title: "UTP",
      desc: "Network cable installed",
    },
    {
      key: "poeSwitch",
      title: "POE SWITCH",
      desc: "Switch installed",
    },
    {
      key: "fiberOptic",
      title: "FIBER OPTIC",
      desc: "Fiber optic connected",
    },
    {
      key: "ready",
      title: "READY",
      desc: "Cabinet ready for use",
    },
  ];

  const checkedCount = stepList.filter(
    (s) => cabinet[s.key as keyof Cabinet]
  ).length;

  const totalProgress = Math.round(
    (checkedCount / stepList.length) * 100
  );

  const installationText = useMemo(() => {
    if (totalProgress === 0)
      return "Not Started";

    if (totalProgress === 100)
      return "Completed";

    return "In Progress";
  }, [totalProgress]);

  const installationColor =
    installationText === "Completed"
      ? "bg-green-100 text-green-700"
      : installationText === "In Progress"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-yellow-100 text-yellow-800";

  const handleCheckbox = (
    field: keyof Cabinet,
    value: boolean
  ) => {
    updateCabinetField(
      cabinet.id,
      field as any,
      value
    );

    const updatedCount = value
      ? checkedCount + 1
      : checkedCount - 1;

    if (updatedCount <= 0) {
      updateCabinetInstallationStatus(
        cabinet.id,
        "not_started"
      );
    } else if (
      updatedCount >= stepList.length
    ) {
      updateCabinetInstallationStatus(
        cabinet.id,
        "completed"
      );
    } else {
      updateCabinetInstallationStatus(
        cabinet.id,
        "in_progress"
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="
          bg-white
          w-[560px]
          max-h-[90vh]
          overflow-y-auto
          rounded-2xl
          border-2
          border-blue-300
          shadow-2xl
          p-6
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-black text-black">
            {cabinet.name}
          </h1>

          <div
            className={`mt-4 rounded-2xl px-6 py-4 text-2xl font-bold ${installationColor}`}
          >
            Installation Status:{" "}
            {installationText}
          </div>
        </div>

        {/* Type */}
        <div className="mb-6">
          <div className="text-[34px] font-black text-black">
            Type: CCTV OUTDOOR STEEL CABINET
          </div>
        </div>

        {/* Urgent */}
        <div className="mb-6">
          <label className="flex items-center gap-3 text-xl font-bold">
            <input
              type="checkbox"
              checked={
                (cabinet as any).isUrgent ||
                false
              }
              onChange={(e) =>
                updateCabinetField(
                  cabinet.id,
                  "isUrgent" as any,
                  e.target.checked
                )
              }
            />
            Urgent Task
          </label>
        </div>

        {/* Installation Steps */}
        <div className="space-y-5">
          <h2 className="text-4xl font-black text-blue-300">
            Installation Steps
          </h2>

          {stepList.map((step) => {
            const checked =
              cabinet[
                step.key as keyof Cabinet
              ] as boolean;

            return (
              <div
                key={step.key}
                className="
                  bg-black
                  rounded-3xl
                  px-6
                  py-5
                  text-white
                  flex
                  items-center
                  gap-5
                "
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    handleCheckbox(
                      step.key as keyof Cabinet,
                      e.target.checked
                    )
                  }
                  className="w-7 h-7"
                />

                <div className="flex-1">
                  <div className="text-3xl font-black">
                    {step.title}
                  </div>

                  <div className="text-lg text-gray-300">
                    {step.desc}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={
                      checked ? 100 : 0
                    }
                    className="
                      w-24
                      h-14
                      rounded-xl
                      border-2
                      border-white
                      bg-black
                      text-center
                      text-2xl
                      font-bold
                    "
                  />

                  <span className="text-3xl font-black">
                    %
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div
          className="
            mt-8
            rounded-3xl
            bg-green-50
            p-6
          "
        >
          <div className="flex items-center justify-between">
            <div className="text-5xl font-black text-green-700">
              Progress รวม
            </div>

            <div
              className={`
                px-5
                py-3
                rounded-full
                text-2xl
                font-black
                ${installationColor}
              `}
            >
              {installationText}
            </div>
          </div>

          <div className="mt-5 h-7 rounded-full bg-gray-300 overflow-hidden">
            <div
              className="
                h-full
                bg-orange-500
                transition-all
              "
              style={{
                width: `${totalProgress}%`,
              }}
            />
          </div>

          <div className="text-center text-[90px] font-black text-orange-600 mt-4">
            {totalProgress}%
          </div>
        </div>

        {/* Upload */}
        <div className="mt-8">
          <div className="text-4xl font-black text-blue-300 mb-5">
            Upload Cabinet Photos
          </div>

          <input
            type="file"
            multiple
            className="text-xl"
          />
        </div>

        {/* Status */}
        <div
          className="
            mt-8
            rounded-3xl
            border
            border-blue-200
            bg-blue-50
            p-6
          "
        >
          <div className="text-2xl font-bold mb-5">
            Current Status: {cabinet.status}
          </div>

          <div className="flex gap-4">
            <button
              className="
                flex-1
                h-16
                rounded-2xl
                bg-green-600
                text-white
                text-2xl
                font-black
              "
              onClick={() =>
                updateCabinetStatus(
                  cabinet.id,
                  "online" as CabinetStatus
                )
              }
            >
              Mark as Online
            </button>

            <button
              className="
                flex-1
                h-16
                rounded-2xl
                bg-gray-200
                text-black
                text-2xl
                font-black
              "
              onClick={() =>
                updateCabinetStatus(
                  cabinet.id,
                  "offline" as CabinetStatus
                )
              }
            >
              Mark as Idle
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 space-y-4">
          {onEditPosition && (
            <button
              onClick={onEditPosition}
              className="
                w-full
                h-16
                rounded-2xl
                bg-gray-200
                text-2xl
                font-black
              "
            >
              Edit Position
            </button>
          )}

          <button
            onClick={onClose}
            className="
              w-full
              h-16
              rounded-2xl
              border
              text-2xl
              font-black
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CabinetStatusModal;
