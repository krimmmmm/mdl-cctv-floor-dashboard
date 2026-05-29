import React, { createContext, useContext } from "react";

const FloorPlanContext = createContext<any>({
  cameras: [],
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

export const FloorPlanProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <FloorPlanContext.Provider
      value={{
        cameras: [],
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
