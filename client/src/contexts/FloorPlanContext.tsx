import React, { createContext, useContext, useState } from "react";

const initialCameras = [
  {
    id: "cam-01",
    name: "Camera 01",
    x: 500,
    y: 500,
    type: "type1",
    status: "offline",
    installationStatus: "not_started",
    wiringUTP: false,
    wallMountingInstalled: false,
    domeCameraInstalled: false,
    rotation: 0,
  },
];

const FloorPlanContext = createContext<any>({
  cameras: initialCameras,
  racks: [],
  cabinets: [],
  fiberRoutes: [],
  activityLogs: [],
  isLoading: false,
  hasDbError: false,

  updateCameraPosition: () => {},
  updateCameraStatus: () => {},
  updateCameraRotation: () => {},
  updateCameraField: () => {},
  updateCameraInstallationStatus: () => {},

  updateRackPosition: () => {},
  updateCabinetPosition: () => {},
  addActivityLog: () => {},
  addFiberRoute: () => {},
  deleteFiberRoute: () => {},
});

export const FloorPlanProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cameras, setCameras] = useState(initialCameras);

  const updateCameraPosition = (id: string, x: number, y: number) => {
    setCameras((prev) =>
      prev.map((camera) =>
        camera.id === id ? { ...camera, x, y } : camera
      )
    );
  };

  const updateCameraStatus = (id: string, status: string) => {
    setCameras((prev) =>
      prev.map((camera) =>
        camera.id === id ? { ...camera, status } : camera
      )
    );
  };

  const updateCameraRotation = (id: string, rotation: number) => {
    setCameras((prev) =>
      prev.map((camera) =>
        camera.id === id ? { ...camera, rotation } : camera
      )
    );
  };

  const updateCameraField = (id: string, field: string, value: boolean) => {
    setCameras((prev) =>
      prev.map((camera) =>
        camera.id === id ? { ...camera, [field]: value } : camera
      )
    );
  };

  const updateCameraInstallationStatus = (
    id: string,
    installationStatus: string
  ) => {
    setCameras((prev) =>
      prev.map((camera) =>
        camera.id === id ? { ...camera, installationStatus } : camera
      )
    );
  };

  return (
    <FloorPlanContext.Provider
      value={{
        cameras,
        racks: [],
        cabinets: [],
        fiberRoutes: [],
        activityLogs: [],
        isLoading: false,
        hasDbError: false,

        updateCameraPosition,
        updateCameraStatus,
        updateCameraRotation,
        updateCameraField,
        updateCameraInstallationStatus,

        updateRackPosition: () => {},
        updateCabinetPosition: () => {},
        addActivityLog: () => {},
        addFiberRoute: () => {},
        deleteFiberRoute: () => {},
      }}
    >
      {children}
    </FloorPlanContext.Provider>
  );
};

export const useFloorPlan = () => useContext(FloorPlanContext);
