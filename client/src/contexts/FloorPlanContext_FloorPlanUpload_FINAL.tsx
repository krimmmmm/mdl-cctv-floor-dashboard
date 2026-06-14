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
  onlineProgress: 0,
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
  ups: false,
  ready: false,
  acPowerProgress: 0,
  utpProgress: 0,
  poeSwitchProgress: 0,
  fiberOpticProgress: 0,
  upsProgress: 0,
  readyProgress: 0,
  photo1: "",
  photo2: "",
  photo3: "",
  photo4: "",
};

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
  ups: false,
  ready: false,
  installCabinetProgress: 0,
  acPowerProgress: 0,
  utpProgress: 0,
  poeSwitchProgress: 0,
  fiberOpticProgress: 0,
  upsProgress: 0,
  readyProgress: 0,
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
  workPlans: {},
  activityLogs: [],
  floorPlanUrl: "/floor_plan_2dcc9a6b.webp",
  isLoading: false,
  hasDbError: false,
  uploadFloorPlan: async () => false,

  setCameraCountByType: () => {},
  setRackCountByType: () => {},
  setCabinetCount: () => {},

  updateCameraPosition: () => {},
  updateCameraStatus: () => {},
  updateCameraRotation: () => {},
  updateCameraField: () => {},
  updateCameraPhotos: () => {},
  updateCameraInstallationStatus: () => {},
  deleteCamera: () => {},

  updateRackPosition: () => {},
  updateRackStatus: () => {},
  updateRackField: () => {},
  updateRackInstallationStatus: () => {},
  updateRackPhotos: () => {},
  deleteRack: () => {},

  updateCabinetPosition: () => {},
  updateCabinetStatus: () => {},
  updateCabinetField: () => {},
  updateCabinetInstallationStatus: () => {},
  updateCabinetPhotos: () => {},
  deleteCabinet: () => {},

  addActivityLog: () => {},
  addFiberRoute: () => {},
  updateFiberRoute: () => {},
  deleteFiberRoute: () => {},

  updateWorkPlan: () => {},
  deleteWorkPlan: () => {},
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
  
  onlineProgress: Number(
  row.online_progress || 0
),
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
    online_progress:
  camera.onlineProgress || 0,
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
  ups: Boolean(row.ups),
  ready: Boolean(row.ready),
  acPowerProgress: Number(row.ac_power_progress || 0),
  utpProgress: Number(row.utp_progress || 0),
  poeSwitchProgress: Number(row.poe_switch_progress || 0),
  fiberOpticProgress: Number(row.fiber_optic_progress || 0),
  upsProgress: Number(row.ups_progress || 0),
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
  ups: rack.ups || false,
  ready: rack.ready || false,
  ac_power_progress: rack.acPowerProgress || 0,
  utp_progress: rack.utpProgress || 0,
  poe_switch_progress: rack.poeSwitchProgress || 0,
  fiber_optic_progress: rack.fiberOpticProgress || 0,
  ups_progress: rack.upsProgress || 0,
  ready_progress: rack.readyProgress || 0,
  photo1: rack.photo1 || "",
  photo2: rack.photo2 || "",
  photo3: rack.photo3 || "",
  photo4: rack.photo4 || "",
  updated_at: new Date().toISOString(),
});

const toAppCabinet = (row: any) => ({
  id: row.id,
  name: row.name,
  x: Number(row.x || 0),
  y: Number(row.y || 0),
  type: row.type || "type1",
  status: row.status || "offline",
  installationStatus: row.installation_status || "not_started",
  isUrgent: Boolean(row.is_urgent),
  installCabinet: Boolean(row.install_cabinet),
  acPower: Boolean(row.ac_power),
  utp: Boolean(row.utp),
  poeSwitch: Boolean(row.poe_switch),
  fiberOptic: Boolean(row.fiber_optic),
  ups: Boolean(row.ups),
  ready: Boolean(row.ready),
  installCabinetProgress: Number(row.install_cabinet_progress || 0),
  acPowerProgress: Number(row.ac_power_progress || 0),
  utpProgress: Number(row.utp_progress || 0),
  poeSwitchProgress: Number(row.poe_switch_progress || 0),
  fiberOpticProgress: Number(row.fiber_optic_progress || 0),
  upsProgress: Number(row.ups_progress || 0),
  readyProgress: Number(row.ready_progress || 0),
  photo1: row.photo1 || "",
  photo2: row.photo2 || "",
  photo3: row.photo3 || "",
  photo4: row.photo4 || "",
});

const toDbCabinet = (cabinet: any) => ({
  id: cabinet.id,
  name: cabinet.name,
  x: cabinet.x,
  y: cabinet.y,
  type: cabinet.type,
  status: cabinet.status,
  installation_status: cabinet.installationStatus || "not_started",
  is_urgent: cabinet.isUrgent || false,
  install_cabinet: cabinet.installCabinet || false,
  ac_power: cabinet.acPower || false,
  utp: cabinet.utp || false,
  poe_switch: cabinet.poeSwitch || false,
  fiber_optic: cabinet.fiberOptic || false,
  ups: cabinet.ups || false,
  ready: cabinet.ready || false,
  install_cabinet_progress: cabinet.installCabinetProgress || 0,
  ac_power_progress: cabinet.acPowerProgress || 0,
  utp_progress: cabinet.utpProgress || 0,
  poe_switch_progress: cabinet.poeSwitchProgress || 0,
  fiber_optic_progress: cabinet.fiberOpticProgress || 0,
  ups_progress: cabinet.upsProgress || 0,
  ready_progress: cabinet.readyProgress || 0,
  photo1: cabinet.photo1 || "",
  photo2: cabinet.photo2 || "",
  photo3: cabinet.photo3 || "",
  photo4: cabinet.photo4 || "",
  updated_at: new Date().toISOString(),
});

const normalizeFiberPoints = (points: any) => {
  if (Array.isArray(points)) return points;

  if (typeof points === "string") {
    try {
      const parsed = JSON.parse(points);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const toAppFiberRoute = (row: any) => ({
  id: row.id,
  name: row.name || row.label || "Fiber Route",
  points: normalizeFiberPoints(row.points),
  status: row.status || "active",
  color: row.color || "#ef4444",
  label: row.label || row.name || "Fiber Route",
  progress: Number(row.progress || 0),
  progressDirection: row.progress_direction || "start",
  photo1: row.photo1 || "",
  photo2: row.photo2 || "",
  photo3: row.photo3 || "",
  photo4: row.photo4 || "",
});

const toDbFiberRoute = (route: any) => ({
  id: route.id,
  points: route.points || [],
  color: route.color || "#ef4444",
  label: route.label || route.name || "Fiber Route",
  status: route.status || "active",
  progress: route.progress || 0,
  progress_direction: route.progressDirection || "start",
  photo1: route.photo1 || "",
  photo2: route.photo2 || "",
  photo3: route.photo3 || "",
  photo4: route.photo4 || "",
  updated_at: new Date().toISOString(),
});

const toAppWorkPlan = (row: any) => ({
  dbId: row.id,
  equipmentId: row.equipment_id || "",
  equipmentName: row.equipment_name || "",
  date: row.work_date || row.plan_start || "",
  planStart: row.plan_start || row.work_date || "",
  finishDate: row.plan_finish || "",
  supervisorName: row.supervisor_name || "",
  supervisorPhone: row.supervisor_phone || "",
  startTime: row.start_time || "",
  endTime: row.end_time || "",
  workDetail: row.work_detail || "",
  isWorking: Boolean(row.is_onsite),
});

const toDbWorkPlan = (plan: any) => ({
  work_date: plan.date || plan.planStart || null,
  equipment_id: plan.equipmentId || "",
  equipment_name: plan.equipmentName || "",
  plan_start: plan.planStart || plan.date || null,
  plan_finish: plan.finishDate || null,
  supervisor_name: plan.supervisorName || "",
  supervisor_phone: plan.supervisorPhone || "",
  start_time: plan.startTime || "",
  end_time: plan.endTime || "",
  work_detail: plan.workDetail || "",
  is_onsite: Boolean(plan.isWorking),
  updated_at: new Date().toISOString(),
});

export const FloorPlanProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cameras, setCameras] = useState<any[]>([defaultCamera]);
  const [racks, setRacks] = useState<any[]>([]);
  const [cabinets, setCabinets] = useState<any[]>([]);
  const [fiberRoutes, setFiberRoutes] = useState<any[]>([]);
  const [workPlans, setWorkPlans] = useState<Record<string, any>>({});
  const [floorPlanUrl, setFloorPlanUrl] = useState("/floor_plan_2dcc9a6b.webp");
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

  const saveCabinet = async (cabinet: any) => {
    const { error } = await supabase
      .from("cabinets")
      .upsert(toDbCabinet(cabinet), { onConflict: "id" });

    if (error) {
      console.error("Save cabinet error:", error);
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

      const { data: cabinetData, error: cabinetError } = await supabase
        .from("cabinets")
        .select("*");

      if (cabinetError) {
        console.error("Load cabinets error:", cabinetError);
        setCabinets([]);
      } else {
        setCabinets((cabinetData || []).map(toAppCabinet));
      }

      const { data: fiberData, error: fiberError } = await supabase
        .from("fiber_routes")
        .select("*");

      if (fiberError) {
        console.error("Load fiber routes error:", fiberError);
        setFiberRoutes([]);
      } else {
        setFiberRoutes((fiberData || []).map(toAppFiberRoute));
      }



      const { data: floorPlanSetting, error: floorPlanError } = await supabase
        .from("floor_plan_settings")
        .select("floor_plan_url")
        .eq("id", "main")
        .maybeSingle();

      if (floorPlanError) {
        console.error("Load floor plan setting error:", floorPlanError);
      } else if (floorPlanSetting?.floor_plan_url) {
        setFloorPlanUrl(floorPlanSetting.floor_plan_url);
      }

      const { data: workPlanData, error: workPlanError } = await supabase
        .from("work_plans")
        .select("*");

      if (workPlanError) {
        console.error("Load work plans error:", workPlanError);
        setWorkPlans({});
      } else {
        const plans: Record<string, any> = {};
        (workPlanData || []).forEach((row: any) => {
          const plan = toAppWorkPlan(row);
          if (plan.equipmentId) {
            plans[plan.equipmentId] = plan;
          }
        });
        setWorkPlans(plans);
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

    const cabinetChannel = supabase
      .channel("cabinets-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cabinets" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const deletedId = payload.old?.id;
            setCabinets((prev) =>
              prev.filter((cabinet) => cabinet.id !== deletedId)
            );
            return;
          }

          const row = payload.new;
          if (!row) return;

          const updatedCabinet = toAppCabinet(row);

          setCabinets((prev) => {
            const exists = prev.some(
              (cabinet) => cabinet.id === updatedCabinet.id
            );

            if (!exists) return [...prev, updatedCabinet];

            return prev.map((cabinet) =>
              cabinet.id === updatedCabinet.id ? updatedCabinet : cabinet
            );
          });
        }
      )
      .subscribe();

    const fiberChannel = supabase
      .channel("fiber-routes-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fiber_routes" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const deletedId = payload.old?.id;

            setFiberRoutes((prev) =>
              prev.filter((route) => route.id !== deletedId)
            );

            return;
          }

          const row = payload.new;
          if (!row) return;

          const updatedRoute = toAppFiberRoute(row);

          setFiberRoutes((prev) => {
            const exists = prev.some((route) => route.id === updatedRoute.id);

            if (!exists) return [...prev, updatedRoute];

            return prev.map((route) => {
              if (route.id !== updatedRoute.id) return route;

              const safePoints =
                updatedRoute.points && updatedRoute.points.length > 0
                  ? updatedRoute.points
                  : route.points || [];

              // Merge instead of replacing the whole route object.
              // This prevents the route line from disappearing after photo upload
              // when realtime payload returns partial/empty points.
              return {
                ...route,
                ...updatedRoute,
                points: safePoints,
              };
            });
          });
        }
      )
      .subscribe();



    const workPlanChannel = supabase
      .channel("work-plans-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "work_plans" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const deletedEquipmentId = payload.old?.equipment_id;
            if (!deletedEquipmentId) return;
            setWorkPlans((prev) => {
              const next = { ...prev };
              delete next[deletedEquipmentId];
              return next;
            });
            return;
          }

          const row = payload.new;
          if (!row) return;

          const updatedPlan = toAppWorkPlan(row);
          if (!updatedPlan.equipmentId) return;

          setWorkPlans((prev) => ({
            ...prev,
            [updatedPlan.equipmentId]: updatedPlan,
          }));
        }
      )
      .subscribe();

    const floorPlanSettingChannel = supabase
      .channel("floor-plan-settings-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "floor_plan_settings" },
        (payload) => {
          const row = payload.new as any;
          if (row?.id === "main" && row.floor_plan_url) {
            setFloorPlanUrl(row.floor_plan_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cameraChannel);
      supabase.removeChannel(rackChannel);
      supabase.removeChannel(cabinetChannel);
      supabase.removeChannel(fiberChannel);
      supabase.removeChannel(workPlanChannel);
      supabase.removeChannel(floorPlanSettingChannel);
    };
  }, []);

  const uploadFloorPlan = async (file: File) => {
    if (!file) return false;

    const fileName = file.name || "";
    const isWebpFile =
      file.type === "image/webp" || fileName.toLowerCase().endsWith(".webp");

    if (!isWebpFile) {
      alert("รองรับเฉพาะไฟล์ .webp เท่านั้น");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ไฟล์ Floor Plan ต้องมีขนาดไม่เกิน 5 MB");
      return false;
    }

    const storagePath = "main/current-floor-plan.webp";

    const { error: uploadError } = await supabase.storage
      .from("floorplan")
      .upload(storagePath, file, {
        cacheControl: "0",
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload floor plan error:", uploadError);
      setHasDbError(true);
      alert(uploadError.message);
      return false;
    }

    const { data: publicUrlData } = supabase.storage
      .from("floorplan")
      .getPublicUrl(storagePath);

    const nextUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

    const { error: settingError } = await supabase
      .from("floor_plan_settings")
      .upsert(
        {
          id: "main",
          floor_plan_url: nextUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (settingError) {
      console.error("Save floor plan setting error:", settingError);
      setHasDbError(true);
      alert(settingError.message);
      return false;
    }

    setFloorPlanUrl(nextUrl);
    return true;
  };

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

  const updateCabinet = (id: string, changes: any) => {
    setCabinets((prev) =>
      prev.map((cabinet) => {
        if (cabinet.id !== id) return cabinet;
        const updated = { ...cabinet, ...changes };
        saveCabinet(updated);
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

  const updateCabinetPosition = (id: string, x: number, y: number) => {
    updateCabinet(id, { x, y });
  };

  const updateCabinetStatus = (id: string, status: string) => {
    updateCabinet(id, { status });
  };

  const updateCabinetField = (id: string, field: string, value: any) => {
    updateCabinet(id, { [field]: value });
  };

  const updateCabinetInstallationStatus = (
    id: string,
    installationStatus: string
  ) => {
    updateCabinet(id, { installationStatus });
  };

  const updateCabinetPhotos = (id: string, photos: string[]) => {
    updateCabinet(id, {
      photo1: photos[0] || "",
      photo2: photos[1] || "",
      photo3: photos[2] || "",
      photo4: photos[3] || "",
    });
  };

  const addFiberRoute = async (route: any) => {
    const newRoute = {
      ...route,
      id: route.id || `fiber-${Date.now()}`,
      name: route.name || route.label || `Fiber Route ${fiberRoutes.length + 1}`,
      label: route.label || route.name || `Fiber Route ${fiberRoutes.length + 1}`,
      color: "#ef4444",
      status: route.status || "active",
      points: route.points || [],
      progress: route.progress || 0,
      progressDirection: route.progressDirection || "start",
      photo1: route.photo1 || "",
      photo2: route.photo2 || "",
      photo3: route.photo3 || "",
      photo4: route.photo4 || "",
    };

    setFiberRoutes((prev) => [...prev, newRoute]);

    const { error } = await supabase.from("fiber_routes").insert(
      toDbFiberRoute(newRoute)
    );

    if (error) {
      console.error("Save fiber route error:", error);
      alert(error.message);
    }
  };

  const updateFiberRoute = async (id: string, changes: any) => {
    const currentRoute = fiberRoutes.find((route) => route.id === id);

    // Preserve the route geometry every time we update photos/progress/direction.
    // Without this, some realtime/update paths can temporarily replace the route
    // with an object that has empty points, causing the drawn line to disappear
    // until refresh/login reloads the full data from Supabase.
    const preservedPoints =
      changes.points && Array.isArray(changes.points) && changes.points.length > 0
        ? changes.points
        : currentRoute?.points || [];

    const safeChanges = {
      ...changes,
      points: preservedPoints,
    };

    const dbChanges: any = { ...safeChanges };

    if ("progressDirection" in dbChanges) {
      dbChanges.progress_direction = dbChanges.progressDirection;
      delete dbChanges.progressDirection;
    }

    dbChanges.updated_at = new Date().toISOString();

    setFiberRoutes((prev) =>
      prev.map((route) =>
        route.id === id
          ? {
              ...route,
              ...safeChanges,
              points: preservedPoints.length > 0 ? preservedPoints : route.points || [],
            }
          : route
      )
    );

    const { error } = await supabase
      .from("fiber_routes")
      .update(dbChanges)
      .eq("id", id);

    if (error) {
      console.error("Update fiber route error:", error);
      alert(error.message);

      // Reload current data if update fails, so UI does not stay in a broken state.
      const { data } = await supabase.from("fiber_routes").select("*");
      if (data) setFiberRoutes((data || []).map(toAppFiberRoute));
    }
  };

  const deleteFiberRoute = async (id: string) => {
    setFiberRoutes((prev) => prev.filter((route) => route.id !== id));

    const { error } = await supabase
      .from("fiber_routes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete fiber route error:", error);
      alert(error.message);
    }
  };


  const updateWorkPlan = async (equipmentId: string, changes: any) => {
    if (!equipmentId) return;

    const current = workPlans[equipmentId] || {};
    const updated = {
      ...current,
      equipmentId,
      ...changes,
    };

    if (updated.date && !updated.planStart) {
      updated.planStart = updated.date;
    }

    setWorkPlans((prev) => ({
      ...prev,
      [equipmentId]: updated,
    }));

    const dbPayload = toDbWorkPlan(updated);

    if (current.dbId) {
      const { error } = await supabase
        .from("work_plans")
        .update(dbPayload)
        .eq("id", current.dbId);

      if (error) {
        console.error("Update work plan error:", error);
        alert(error.message);
      }

      return;
    }

    const { data: existingRows, error: findError } = await supabase
      .from("work_plans")
      .select("id, updated_at")
      .eq("equipment_id", equipmentId)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (findError) {
      console.error("Find work plan error:", findError);
      alert(findError.message);
      return;
    }

    const existing = Array.isArray(existingRows) ? existingRows[0] : null;

    if (existing?.id) {
      const { error } = await supabase
        .from("work_plans")
        .update(dbPayload)
        .eq("id", existing.id);

      if (error) {
        console.error("Update work plan error:", error);
        alert(error.message);
        return;
      }

      setWorkPlans((prev) => ({
        ...prev,
        [equipmentId]: { ...updated, dbId: existing.id },
      }));

      return;
    }

    const { data: inserted, error } = await supabase
      .from("work_plans")
      .insert(dbPayload)
      .select("id")
      .single();

    if (error) {
      console.error("Insert work plan error:", error);
      alert(error.message);
      return;
    }

    if (inserted?.id) {
      setWorkPlans((prev) => ({
        ...prev,
        [equipmentId]: { ...updated, dbId: inserted.id },
      }));
    }
  };

  const deleteWorkPlan = async (equipmentId: string) => {
    const plan = workPlans[equipmentId];

    setWorkPlans((prev) => {
      const next = { ...prev };
      delete next[equipmentId];
      return next;
    });

    if (!plan?.dbId) return;

    const { error } = await supabase
      .from("work_plans")
      .delete()
      .eq("id", plan.dbId);

    if (error) {
      console.error("Delete work plan error:", error);
      alert(error.message);
    }
  };

  const deleteCamera = async (id: string) => {
    const { error } = await supabase
      .from("cameras")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete camera error:", error);
      setHasDbError(true);
      alert(error.message);
      return false;
    }

    setCameras((prev) =>
      prev.filter((camera) => camera.id !== id)
    );

    return true;
  };

  const deleteRack = async (id: string) => {
    const { error } = await supabase
      .from("racks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete rack error:", error);
      setHasDbError(true);
      alert(error.message);
      return false;
    }

    setRacks((prev) =>
      prev.filter((rack) => rack.id !== id)
    );

    return true;
  };

  const deleteCabinet = async (id: string) => {
    const { error } = await supabase
      .from("cabinets")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete cabinet error:", error);
      setHasDbError(true);
      alert(error.message);
      return false;
    }

    setCabinets((prev) =>
      prev.filter((cabinet) => cabinet.id !== id)
    );

    return true;
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
              ? 420 + ((runningNumber - 1) % 8) * 45
              : 760 + ((runningNumber - 1) % 8) * 45,
          y:
            cameraType === "type1"
              ? 280 + Math.floor((runningNumber - 1) / 8) * 45
              : 480 + Math.floor((runningNumber - 1) / 8) * 45,
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
          x:
            rackType === "type1"
              ? 260 + ((runningNumber - 1) % 6) * 80
              : 760 + ((runningNumber - 1) % 6) * 80,
          y:
            rackType === "type1"
              ? 180 + Math.floor((runningNumber - 1) / 6) * 80
              : 480 + Math.floor((runningNumber - 1) / 6) * 80,
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

  const setCabinetCount = async (targetCount: number) => {
    const safeTarget = Math.max(0, targetCount);
    const currentCount = cabinets.length;

    if (safeTarget > currentCount) {
      const addAmount = safeTarget - currentCount;

      for (let i = 1; i <= addAmount; i++) {
        const runningNumber = currentCount + i;

        const newCabinet = {
          ...defaultCabinet,
          id: `cabinet-${Date.now()}-${i}`,
          name: `Cabinet ${String(runningNumber).padStart(2, "0")}`,
          x:
            880 + ((runningNumber - 1) % 5) * 90,
          y:
            220 + Math.floor((runningNumber - 1) / 5) * 90,
        };

        const success = await saveCabinet(newCabinet);

        if (success) {
          setCabinets((prev) => {
            const exists = prev.some((cabinet) => cabinet.id === newCabinet.id);
            if (exists) return prev;
            return [...prev, newCabinet];
          });
        }
      }
    }

    if (safeTarget < currentCount) {
      const deleteAmount = currentCount - safeTarget;

      const cabinetsToDelete = [...cabinets]
        .sort((a, b) => b.name.localeCompare(a.name))
        .slice(0, deleteAmount);

      for (const cabinet of cabinetsToDelete) {
        const { error } = await supabase
          .from("cabinets")
          .delete()
          .eq("id", cabinet.id);

        if (error) {
          console.error("Delete cabinet error:", error);
          alert(error.message);
          continue;
        }

        setCabinets((prev) => prev.filter((item) => item.id !== cabinet.id));
      }
    }
  };

  return (
    <FloorPlanContext.Provider
      value={{
        cameras,
        racks,
        cabinets,
        fiberRoutes,
        workPlans,
        activityLogs: [],
        isLoading,
        hasDbError,
      floorPlanUrl,
      uploadFloorPlan,

        updateCameraPosition,
        updateCameraStatus,
        updateCameraRotation,
        updateCameraField,
        updateCameraPhotos,
        updateCameraInstallationStatus,
        deleteCamera,

        setCameraCountByType,
        setRackCountByType,
        setCabinetCount,

        updateRackPosition,
        updateRackStatus,
        updateRackField,
        updateRackInstallationStatus,
        updateRackPhotos,
        deleteRack,

        updateCabinetPosition,
        updateCabinetStatus,
        updateCabinetField,
        updateCabinetInstallationStatus,
        updateCabinetPhotos,
        deleteCabinet,

        addActivityLog: () => {},
        addFiberRoute,
        updateFiberRoute,
        deleteFiberRoute,

        updateWorkPlan,
        deleteWorkPlan,
      }}
    >
      {children}
    </FloorPlanContext.Provider>
  );
};

export const useFloorPlan = () => useContext(FloorPlanContext);