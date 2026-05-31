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
  isUrgent: false,
  wiringUTPProgress: 0,
  wallMountingProgress: 0,
  domeCameraProgress: 0,
  photo1: "",
  photo2: "",
  photo3: "",
  photo4: "",
};

const defaultRack = {
  id: "rack-01",
  name: "Rack 01",
  x: 700,
  y: 400,
  type: "type1",
  status: "offline",
  installationStatus: "not_started",
  isUrgent: false,
  acPower: false,
  utp: false,
  poeSwitch: false,
  fiberOptic: false,
  ready: false,
  acPowerProgress: 0,
  utpProgress: 0,
  poeSwitchProgress: 0,
  fiberOpticProgress: 0,
  readyProgress: 0,
  photo1: "",
  photo2: "",
  photo3: "",
  photo4: "",
};

```tsx
const defaultCabinet = {
  id: "cabinet-01",
  name: "Cabinet 01",
  x: 850,
  y: 420,

  type: "type1",

  status: "offline",
  installationStatus: "not_started",

  isUrgent: false,

  installCabinet: false,
  acPower: false,
  utp: false,
  poeSwitch: false,
  fiberOptic: false,
  ready: false,

  installCabinetProgress: 0,
  acPowerProgress: 0,
  utpProgress: 0,
  poeSwitchProgress: 0,
  fiberOpticProgress: 0,
  readyProgress: 0,

  photo1: "",
  photo2: "",
  photo3: "",
  photo4: "",
};
```


const FloorPlanContext = createContext<any>({
  cameras: [],
  racks: [],
  cabinets: [],
  fiberRoutes: [],
  activityLogs: [],
  isLoading: false,
  hasDbError: false,

  setCameraCountByType: () => {},
  setRackCountByType: () => {},

  updateCameraPosition: () => {},
  updateCameraStatus: () => {},
  updateCameraRotation: () => {},
  updateCameraField: () => {},
  updateCameraPhotos: () => {},
  updateCameraInstallationStatus: () => {},

  updateRackPosition: () => {},
  updateRackStatus: () => {},
  updateRackField: () => {},
  updateRackInstallationStatus: () => {},
  updateRackPhotos: () => {},

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
  type: row.type || "type1",
  status: row.status || "offline",
  installationStatus: row.installation_status || "not_started",
  wiringUTP: Boolean(row.wiring_utp),
  wallMountingInstalled: Boolean(row.wall_mounting),
  domeCameraInstalled: Boolean(row.install_camera),
  rotation: Number(row.rotation || 0),
  isUrgent: Boolean(row.is_urgent),
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
  is_urgent: camera.isUrgent || false,
  wiring_utp_progress: camera.wiringUTPProgress || 0,
  wall_mounting_progress: camera.wallMountingProgress || 0,
  dome_camera_progress: camera.domeCameraProgress || 0,
  photo1: camera.photo1 || "",
  photo2: camera.photo2 || "",
  photo3: camera.photo3 || "",
  photo4: camera.photo4 || "",
  updated_at: new Date().toISOString(),
});

const toAppRack = (row: any) => ({
  id: row.id,
  name: row.name,
  x: Number(row.x || 0),
  y: Number(row.y || 0),
  type: row.type || "type1",
  status: row.status || "offline",
  installationStatus: row.installation_status || "not_started",
  isUrgent: Boolean(row.is_urgent),

  acPower: Boolean(row.ac_power),
  utp: Boolean(row.utp),
  poeSwitch: Boolean(row.poe_switch),
  fiberOptic: Boolean(row.fiber_optic),
  ready: Boolean(row.ready),

  acPowerProgress: Number(row.ac_power_progress || 0),
  utpProgress: Number(row.utp_progress || 0),
  poeSwitchProgress: Number(row.poe_switch_progress || 0),
  fiberOpticProgress: Number(row.fiber_optic_progress || 0),
  readyProgress: Number(row.ready_progress || 0),

  photo1: row.photo1 || "",
  photo2: row.photo2 || "",
  photo3: row.photo3 || "",
  photo4: row.photo4 || "",
});

const toDbRack = (rack: any) => ({
  id: rack.id,
  name: rack.name,
  x: rack.x,
  y: rack.y,
  type: rack.type,
  status: rack.status,
  installation_status: rack.installationStatus || "not_started",
  is_urgent: rack.isUrgent || false,

  ac_power: rack.acPower || false,
  utp: rack.utp || false,
  poe_switch: rack.poeSwitch || false,
  fiber_optic: rack.fiberOptic || false,
  ready: rack.ready || false,

  ac_power_progress: rack.acPowerProgress || 0,
  utp_progress: rack.utpProgress || 0,
  poe_switch_progress: rack.poeSwitchProgress || 0,
  fiber_optic_progress: rack.fiberOpticProgress || 0,
  ready_progress: rack.readyProgress || 0,

  photo1: rack.photo1 || "",
  photo2: rack.photo2 || "",
  photo3: rack.photo3 || "",
  photo4: rack.photo4 || "",
  updated_at: new Date().toISOString(),
});

export const FloorPlanProvider = ({ children }: { children: React.ReactNode }) => {
  const [cameras, setCameras] = useState<any[]>([defaultCamera]);
  const [racks, setRacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDbError, setHasDbError] = useState(false);

  const saveCamera = async (camera: any) => {
    const { error } = await supabase
      .from("cameras")
      .upsert(toDbCamera(camera), { onConflict: "id" });

    if (error) {
      console.error("Save camera error:", error);
      setHasDbError(true);
      alert(error.message);
      return false;
    }

    return true;
  };

  const saveRack = async (rack: any) => {
    const { error } = await supabase
      .from("racks")
      .upsert(toDbRack(rack), { onConflict: "id" });

    if (error) {
      console.error("Save rack error:", error);
      setHasDbError(true);
      alert(error.message);
      return false;
    }

    return true;
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const { data: cameraData, error: cameraError } = await supabase
        .from("cameras")
        .select("*");

      if (cameraError) {
        console.error("Load cameras error:", cameraError);
        setHasDbError(true);
        setCameras([defaultCamera]);
      } else if (!cameraData || cameraData.length === 0) {
        setCameras([defaultCamera]);
        await saveCamera(defaultCamera);
      } else {
        setCameras(cameraData.map(toAppCamera));
      }

      const { data: rackData, error: rackError } = await supabase
        .from("racks")
        .select("*");

      if (rackError) {
        console.error("Load racks error:", rackError);
        setRacks([]);
      } else {
        setRacks((rackData || []).map(toAppRack));
      }

      setIsLoading(false);
    };

    loadData();

    const cameraChannel = supabase
      .channel("cameras-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cameras" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const deletedId = payload.old?.id;
            setCameras((prev) => prev.filter((cam) => cam.id !== deletedId));
            return;
          }

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

    const rackChannel = supabase
      .channel("racks-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "racks" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const deletedId = payload.old?.id;
            setRacks((prev) => prev.filter((rack) => rack.id !== deletedId));
            return;
          }

          const row = payload.new;
          if (!row) return;

          const updatedRack = toAppRack(row);

          setRacks((prev) => {
            const exists = prev.some((rack) => rack.id === updatedRack.id);
            if (!exists) return [...prev, updatedRack];

            return prev.map((rack) =>
              rack.id === updatedRack.id ? updatedRack : rack
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cameraChannel);
      supabase.removeChannel(rackChannel);
    };
  }, []);

  const updateCamera = (id: string, changes: any) => {
    setCameras((prev) =>
      prev.map((camera) => {
        if (camera.id !== id) return camera;
        const updated = { ...camera, ...changes };
        saveCamera(updated);
        return updated;
      })
    );
  };

  const updateRack = (id: string, changes: any) => {
    setRacks((prev) =>
      prev.map((rack) => {
        if (rack.id !== id) return rack;
        const updated = { ...rack, ...changes };
        saveRack(updated);
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

  const updateRackPosition = (id: string, x: number, y: number) => {
    updateRack(id, { x, y });
  };

  const updateRackStatus = (id: string, status: string) => {
    updateRack(id, { status });
  };

  const updateRackField = (id: string, field: string, value: any) => {
    updateRack(id, { [field]: value });
  };

  const updateRackInstallationStatus = (
    id: string,
    installationStatus: string
  ) => {
    updateRack(id, { installationStatus });
  };

  const updateRackPhotos = (id: string, photos: string[]) => {
    updateRack(id, {
      photo1: photos[0] || "",
      photo2: photos[1] || "",
      photo3: photos[2] || "",
      photo4: photos[3] || "",
    });
  };

  const setCameraCountByType = async (
    cameraType: string,
    targetCount: number
  ) => {
    const safeTarget = Math.max(0, targetCount);

    const camerasByType = cameras
      .filter((cam) => cam.type === cameraType)
      .sort((a, b) => a.name.localeCompare(b.name));

    const currentCount = camerasByType.length;

    if (safeTarget > currentCount) {
      const addAmount = safeTarget - currentCount;

      for (let i = 1; i <= addAmount; i++) {
        const runningNumber = currentCount + i;

        const newCamera = {
          ...defaultCamera,
          id: `${cameraType}-${Date.now()}-${i}`,
          type: cameraType,
          name:
            (cameraType === "type1" ? "Camera T1 " : "Camera T2 ") +
            String(runningNumber).padStart(2, "0"),
          x:
            cameraType === "type1"
              ? 420 + runningNumber * 20
              : 560 + runningNumber * 20,
          y:
            cameraType === "type1"
              ? 330 + runningNumber * 20
              : 520 + runningNumber * 20,
        };

        const success = await saveCamera(newCamera);

        if (success) {
          setCameras((prev) => {
            const exists = prev.some((cam) => cam.id === newCamera.id);
            if (exists) return prev;
            return [...prev, newCamera];
          });
        }
      }
    }

    if (safeTarget < currentCount) {
      const deleteAmount = currentCount - safeTarget;

      const camerasToDelete = [...camerasByType]
        .sort((a, b) => b.name.localeCompare(a.name))
        .slice(0, deleteAmount);

      for (const cam of camerasToDelete) {
        const { error } = await supabase
          .from("cameras")
          .delete()
          .eq("id", cam.id);

        if (error) {
          console.error("Delete camera error:", error);
          alert(error.message);
          continue;
        }

        setCameras((prev) => prev.filter((item) => item.id !== cam.id));
      }
    }
  };

  const setRackCountByType = async (rackType: string, targetCount: number) => {
    const safeTarget = Math.max(0, targetCount);

    const racksByType = racks
      .filter((rack) => rack.type === rackType)
      .sort((a, b) => a.name.localeCompare(b.name));

    const currentCount = racksByType.length;

    if (safeTarget > currentCount) {
      const addAmount = safeTarget - currentCount;

      for (let i = 1; i <= addAmount; i++) {
        const runningNumber = currentCount + i;

        const newRack = {
          ...defaultRack,
          id: `${rackType}-${Date.now()}-${i}`,
          type: rackType,
          name:
            (rackType === "type1" ? "Rack T1 " : "Rack T2 ") +
            String(runningNumber).padStart(2, "0"),
          x: rackType === "type1" ? 300 + runningNumber * 25 : 700 + runningNumber * 25,
          y: rackType === "type1" ? 250 + runningNumber * 25 : 500 + runningNumber * 25,
        };

        const success = await saveRack(newRack);

        if (success) {
          setRacks((prev) => {
            const exists = prev.some((rack) => rack.id === newRack.id);
            if (exists) return prev;
            return [...prev, newRack];
          });
        }
      }
    }

    if (safeTarget < currentCount) {
      const deleteAmount = currentCount - safeTarget;

      const racksToDelete = [...racksByType]
        .sort((a, b) => b.name.localeCompare(a.name))
        .slice(0, deleteAmount);

      for (const rack of racksToDelete) {
        const { error } = await supabase
          .from("racks")
          .delete()
          .eq("id", rack.id);

        if (error) {
          console.error("Delete rack error:", error);
          alert(error.message);
          continue;
        }

        setRacks((prev) => prev.filter((item) => item.id !== rack.id));
      }
    }
  };

  return (
    <FloorPlanContext.Provider
      value={{
        cameras,
        racks,
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

        setCameraCountByType,
        setRackCountByType,

        updateRackPosition,
        updateRackStatus,
        updateRackField,
        updateRackInstallationStatus,
        updateRackPhotos,

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
