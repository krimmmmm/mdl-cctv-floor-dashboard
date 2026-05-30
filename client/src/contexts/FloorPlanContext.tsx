import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const defaultCamera = {
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
  
  wiringUTPProgress: 0,
wallMountingProgress: 0,
domeCameraProgress: 0,
  
  photo1: "",
  photo2: "",
  photo3: "",
  photo4: "",
};

const FloorPlanContext = createContext<any>({
  cameras: [],
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
  updateCameraPhotos: () => {},
  updateCameraInstallationStatus: () => {},

  updateRackPosition: () => {},
  updateCabinetPosition: () => {},
  addActivityLog: () => {},
  addFiberRoute: () => {},
  deleteFiberRoute: () => {},
});

const toAppCamera = (row: any) => ({
  id: row.id,
  name: row.name,
  x: Number(row.x || 0),
  y: Number(row.y || 0),
  type: row.type,
  status: row.status,
  installationStatus: row.installation_status,
  wiringUTP: row.wiring_utp,
  wallMountingInstalled: row.wall_mounting,
  domeCameraInstalled: row.install_camera,
  rotation: Number(row.rotation || 0),

  wiringUTPProgress: Number(row.wiring_utp_progress || 0),
wallMountingProgress: Number(row.wall_mounting_progress || 0),
domeCameraProgress: Number(row.dome_camera_progress || 0),
  
  photo1: row.photo1 || "",
  photo2: row.photo2 || "",
  photo3: row.photo3 || "",
  photo4: row.photo4 || "",
});

const toDbCamera = (camera: any) => ({
  id: camera.id,
  name: camera.name,
  x: camera.x,
  y: camera.y,
  type: camera.type,
  status: camera.status,
  installation_status: camera.installationStatus,
  wiring_utp: camera.wiringUTP,
  wall_mounting: camera.wallMountingInstalled,
  install_camera: camera.domeCameraInstalled,
  rotation: camera.rotation || 0,

  wiring_utp_progress: camera.wiringUTPProgress || 0,
wall_mounting_progress: camera.wallMountingProgress || 0,
dome_camera_progress: camera.domeCameraProgress || 0,
  
  photo1: camera.photo1 || "",
  photo2: camera.photo2 || "",
  photo3: camera.photo3 || "",
  photo4: camera.photo4 || "",
  updated_at: new Date().toISOString(),
});

export const FloorPlanProvider = ({ children }: { children: React.ReactNode }) => {
  const [cameras, setCameras] = useState<any[]>([defaultCamera]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDbError, setHasDbError] = useState(false);

  const saveCamera = async (camera: any) => {
    const { error } = await supabase
      .from("cameras")
      .upsert(toDbCamera(camera), { onConflict: "id" });

    if (error) {
      console.error("Save camera error:", error);
      setHasDbError(true);
    }
  };

  useEffect(() => {
    const loadCameras = async () => {
      setIsLoading(true);

      const { data, error } = await supabase.from("cameras").select("*");

      if (error) {
        console.error("Load cameras error:", error);
        setHasDbError(true);
        setCameras([defaultCamera]);
      } else if (!data || data.length === 0) {
        setCameras([defaultCamera]);
        await saveCamera(defaultCamera);
      } else {
        setCameras(data.map(toAppCamera));
      }

      setIsLoading(false);
    };

    loadCameras();

    const channel = supabase
      .channel("cameras-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cameras" },
        (payload) => {
          const row = payload.new;
          if (!row) return;

          const updatedCamera = toAppCamera(row);

          setCameras((prev) => {
            const exists = prev.some((cam) => cam.id === updatedCamera.id);
            if (!exists) return [...prev, updatedCamera];

            return prev.map((cam) =>
              cam.id === updatedCamera.id ? updatedCamera : cam
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateCamera = (id: string, changes: any) => {
    setCameras((prev) =>
      prev.map((camera) => {
        if (camera.id !== id) return camera;

        const updated = {
          ...camera,
          ...changes,
        };

        saveCamera(updated);
        return updated;
      })
    );
  };

  const updateCameraPosition = (id: string, x: number, y: number) => {
    updateCamera(id, { x, y });
  };

  const updateCameraStatus = (id: string, status: string) => {
    updateCamera(id, { status });
  };

  const updateCameraRotation = (id: string, rotation: number) => {
    updateCamera(id, { rotation });
  };

  const updateCameraField = (id: string, field: string, value: any) => {
    updateCamera(id, { [field]: value });
  };

  const updateCameraPhotos = (id: string, photos: string[]) => {
    updateCamera(id, {
      photo1: photos[0] || "",
      photo2: photos[1] || "",
      photo3: photos[2] || "",
      photo4: photos[3] || "",
    });
  };

  const updateCameraInstallationStatus = (
    id: string,
    installationStatus: string
  ) => {
    updateCamera(id, { installationStatus });
  };

  return (
    <FloorPlanContext.Provider
      value={{
        cameras,
        racks: [],
        cabinets: [],
        fiberRoutes: [],
        activityLogs: [],
        isLoading,
        hasDbError,

        updateCameraPosition,
        updateCameraStatus,
        updateCameraRotation,
        updateCameraField,
        updateCameraPhotos,
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
