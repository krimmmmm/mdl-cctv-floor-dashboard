import React, { createContext, useContext } from "react";

import {
  initialCameras,
  initialRacks,
  initialCabinets,
  initialFiberRoutes,
} from "@/lib/floorPlanData";
const FloorPlanContext = createContext<any>({
  cameras: initialCameras || [],
racks: initialRacks || [],
cabinets: initialCabinets || [],
fiberRoutes: initialFiberRoutes || [],
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

export const FloorPlanProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <FloorPlanContext.Provider
      value={{
        cameras: initialCameras || [],
racks: initialRacks || [],
cabinets: initialCabinets || [],
fiberRoutes: initialFiberRoutes || [],
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
