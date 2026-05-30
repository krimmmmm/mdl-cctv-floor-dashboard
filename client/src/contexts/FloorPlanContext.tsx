import React, { createContext, useContext } from "react";

const FloorPlanContext = createContext<any>({
  cameras: [
  {
    id: "cam-01",
    name: "Camera 01",
    x: 500,
    y: 500,
    type: "type1",
    status: "offline",
    installationStatus: "not_started",
  },
],
  racks: [],
  cabinets: [],
  fiberRoutes: [],
  activityLogs: [],
  isLoading: false,
  hasDbError: false,

  updateCameraPosition: () => {},
  updateRackPosition: () => {},
  updateCabinetPosition: () => {},
  addActivityLog: () => {},
  addFiberRoute: () => {},
  deleteFiberRoute: () => {},
});

export const FloorPlanProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <FloorPlanContext.Provider
      value={{
        cameras: [
  {
    id: "cam-01",
    name: "Camera 01",
    x: 500,
    y: 500,
    type: "type1",
    status: "offline",
    installationStatus: "not_started",
  },
],
        racks: [],
        cabinets: [],
        fiberRoutes: [],
        activityLogs: [],
        isLoading: false,
        hasDbError: false,

        updateCameraPosition: () => {},
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
