import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Camera,
  Rack,
  Cabinet,
  FiberRoute,
  ActivityLog,
  CameraStatus,
  RackStatus,
  CabinetStatus,
  InstallationStatus,
  INITIAL_CAMERAS,
  INITIAL_RACKS,
  INITIAL_CABINETS,
  INITIAL_FIBER_ROUTES,
} from '@/lib/floorPlanData';
import { trpc } from '@/lib/trpc';
import type { CameraStatusRow, RackStatusRow, CabinetStatusRow, ActivityLogRow } from '../../../drizzle/schema';

interface FloorPlanContextType {
  cameras: Camera[];
  racks: Rack[];
  cabinets: Cabinet[];
  fiberRoutes: FiberRoute[];
  activityLogs: ActivityLog[];
  isLoading: boolean;
  hasDbError: boolean;
  updateCameraStatus: (id: string, status: CameraStatus) => void;
  updateCameraField: (id: string, field: keyof Omit<Camera, 'id' | 'type' | 'x' | 'y' | 'name'>, value: boolean) => void;
  updateCameraPosition: (id: string, x: number, y: number) => void;
  updateCameraRotation: (id: string, rotation: number) => void;
  updateCameraInstallationStatus: (id: string, status: InstallationStatus) => void;
  updateRackStatus: (id: string, status: RackStatus) => void;
  updateRackField: (id: string, field: keyof Omit<Rack, 'id' | 'type' | 'x' | 'y' | 'name'>, value: boolean) => void;
  updateRackPosition: (id: string, x: number, y: number) => void;
  updateRackInstallationStatus: (id: string, status: InstallationStatus) => void;
  updateCabinetStatus: (id: string, status: CabinetStatus) => void;
  updateCabinetField: (id: string, field: keyof Omit<Cabinet, 'id' | 'x' | 'y' | 'name'>, value: boolean) => void;
  updateCabinetPosition: (id: string, x: number, y: number) => void;
  updateCabinetInstallationStatus: (id: string, status: InstallationStatus) => void;
  updateFiberRouteStatus: (id: string, status: 'idle' | 'active') => void;
  addFiberRoute: (route: FiberRoute) => void;
  deleteFiberRoute: (id: string) => void;
  addActivityLog: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

const FloorPlanContext = createContext<FloorPlanContextType | undefined>(undefined);

export const FloorPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [racks, setRacks] = useState<Rack[]>(INITIAL_RACKS);
  const [cabinets, setCabinets] = useState<Cabinet[]>(INITIAL_CABINETS);
  const [fiberRoutes, setFiberRoutes] = useState<FiberRoute[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // tRPC queries to load data from database
  const { data: dbCameras, error: cameraError } = trpc.camera.getAll.useQuery();
  const { data: dbRacks, error: rackError } = trpc.rack.getAll.useQuery();
  const { data: dbCabinets, error: cabinetError } = trpc.cabinet.getAll.useQuery();
  const { data: dbActivityLogs } = trpc.activityLog.getRecent.useQuery({ limit: 100 });
  const { data: dbFiberRoutes } = trpc.fiber.getAll.useQuery();

  // If any query fails, still show the dashboard with initial data (graceful degradation)
  const hasDbError = !!(cameraError || rackError || cabinetError);

  // tRPC mutations
  const upsertCamera = trpc.camera.upsert.useMutation();
  const upsertRack = trpc.rack.upsert.useMutation();
  const upsertCabinet = trpc.cabinet.upsert.useMutation();
  const insertActivity = trpc.activityLog.insert.useMutation();
  const upsertFiber = trpc.fiber.upsert.useMutation();
  const deleteFiberMutation = trpc.fiber.delete.useMutation();

  // Merge DB data with initial data when loaded
  useEffect(() => {
    // If DB errors, stop loading and use initial data
    if (hasDbError) {
      setIsLoading(false);
      return;
    }
    if (dbCameras !== undefined && dbRacks !== undefined && dbCabinets !== undefined) {
      // Merge camera data: start from initial, override with DB values
      if (dbCameras.length > 0) {
        setCameras((prev) =>
          prev.map((cam) => {
            const dbCam = dbCameras.find((d: CameraStatusRow) => d.cameraId === cam.id);
            if (dbCam) {
              return {
                ...cam,
                status: dbCam.status as CameraStatus,
                installationStatus: dbCam.installationStatus as InstallationStatus,
                wiringUTP: dbCam.wiringUTP,
                wallMountingInstalled: dbCam.wallMountingInstalled,
                domeCameraInstalled: dbCam.domeCameraInstalled,
                x: dbCam.x,
                y: dbCam.y,
                rotation: dbCam.rotation,
              };
            }
            return cam;
          })
        );
      }

      // Merge rack data
      if (dbRacks.length > 0) {
        setRacks((prev) =>
          prev.map((rack) => {
            const dbRack = dbRacks.find((d: RackStatusRow) => d.rackId === rack.id);
            if (dbRack) {
              return {
                ...rack,
                status: dbRack.status as RackStatus,
                installationStatus: dbRack.installationStatus as InstallationStatus,
                acPower: dbRack.acPower,
                utp: dbRack.utp,
                poeSwitch: dbRack.poeSwitch,
                fiberOptic: dbRack.fiberOptic,
                ready: dbRack.ready,
                x: dbRack.x,
                y: dbRack.y,
              };
            }
            return rack;
          })
        );
      }

      // Merge cabinet data
      if (dbCabinets.length > 0) {
        setCabinets((prev) =>
          prev.map((cab) => {
            const dbCab = dbCabinets.find((d: CabinetStatusRow) => d.cabinetId === cab.id);
            if (dbCab) {
              return {
                ...cab,
                status: dbCab.status as CabinetStatus,
                installationStatus: dbCab.installationStatus as InstallationStatus,
                installCabinet: dbCab.installCabinet,
                acPower: dbCab.acPower,
                utp: dbCab.utp,
                poeSwitch: dbCab.poeSwitch,
                fiberOptic: dbCab.fiberOptic,
                ready: dbCab.ready,
                x: dbCab.x,
                y: dbCab.y,
              };
            }
            return cab;
          })
        );
      }

      setIsLoading(false);
    }
  }, [dbCameras, dbRacks, dbCabinets, hasDbError]);

  // Load fiber routes from DB (replace all - DB is source of truth)
  useEffect(() => {
    if (dbFiberRoutes !== undefined) {
      if (dbFiberRoutes.length > 0) {
        const mapped: FiberRoute[] = dbFiberRoutes.map((r: { routeId: string; name: string; points: string; status: string; color: string }) => ({
          id: r.routeId,
          name: r.name,
          points: JSON.parse(r.points) as Array<{ x: number; y: number }>,
          status: (r.status === 'active' ? 'active' : 'idle') as 'active' | 'idle',
          color: r.color,
        }));
        setFiberRoutes(mapped);
      } else {
        // No fiber routes in DB yet - start with empty (user draws their own)
        setFiberRoutes([]);
      }
    }
  }, [dbFiberRoutes]);

  // Load activity logs from DB
  useEffect(() => {
    if (dbActivityLogs && dbActivityLogs.length > 0) {
      const mapped: ActivityLog[] = dbActivityLogs.map((log: ActivityLogRow) => ({
        id: `db_${log.id}`,
        timestamp: new Date(log.createdAt).getTime(),
        userId: 'system',
        action: log.action,
        equipmentId: log.equipmentId,
        equipmentName: log.equipmentName,
        equipmentType: log.equipmentType,
        changeType: log.changeType,
        oldValue: log.oldValue ?? undefined,
        newValue: log.newValue ?? undefined,
      }));
      setActivityLogs(mapped);
    }
  }, [dbActivityLogs]);

  // Helper: sync camera to DB
  const syncCameraToDb = useCallback((cam: Camera) => {
    upsertCamera.mutate({
      cameraId: cam.id,
      status: cam.status,
      installationStatus: cam.installationStatus,
      wiringUTP: cam.wiringUTP,
      wallMountingInstalled: cam.wallMountingInstalled,
      domeCameraInstalled: cam.domeCameraInstalled,
      x: cam.x,
      y: cam.y,
      rotation: cam.rotation,
    });
  }, [upsertCamera]);

  // Helper: sync rack to DB
  const syncRackToDb = useCallback((rack: Rack) => {
    upsertRack.mutate({
      rackId: rack.id,
      status: rack.status,
      installationStatus: rack.installationStatus,
      acPower: rack.acPower,
      utp: rack.utp,
      poeSwitch: rack.poeSwitch,
      fiberOptic: rack.fiberOptic,
      ready: rack.ready,
      x: rack.x,
      y: rack.y,
    });
  }, [upsertRack]);

  // Helper: sync cabinet to DB
  const syncCabinetToDb = useCallback((cab: Cabinet) => {
    upsertCabinet.mutate({
      cabinetId: cab.id,
      status: cab.status,
      installationStatus: cab.installationStatus,
      installCabinet: cab.installCabinet,
      acPower: cab.acPower,
      utp: cab.utp,
      poeSwitch: cab.poeSwitch,
      fiberOptic: cab.fiberOptic,
      ready: cab.ready,
      x: cab.x,
      y: cab.y,
    });
  }, [upsertCabinet]);

  const updateCameraStatus = useCallback((id: string, status: CameraStatus) => {
    setCameras((prev) => {
      const updated = prev.map((cam) => cam.id === id ? { ...cam, status } : cam);
      const cam = updated.find((c) => c.id === id);
      if (cam) syncCameraToDb(cam);
      return updated;
    });
  }, [syncCameraToDb]);

  const updateCameraField = useCallback(
    (id: string, field: keyof Omit<Camera, 'id' | 'type' | 'x' | 'y' | 'name'>, value: boolean) => {
      setCameras((prev) => {
        const updated = prev.map((cam) => cam.id === id ? { ...cam, [field]: value } : cam);
        const cam = updated.find((c) => c.id === id);
        if (cam) syncCameraToDb(cam);
        return updated;
      });
    },
    [syncCameraToDb]
  );

  const updateCameraPosition = useCallback((id: string, x: number, y: number) => {
    setCameras((prev) => {
      const updated = prev.map((cam) => cam.id === id ? { ...cam, x, y } : cam);
      const cam = updated.find((c) => c.id === id);
      if (cam) syncCameraToDb(cam);
      return updated;
    });
  }, [syncCameraToDb]);

  const updateCameraRotation = useCallback((id: string, rotation: number) => {
    setCameras((prev) => {
      const updated = prev.map((cam) => cam.id === id ? { ...cam, rotation } : cam);
      const cam = updated.find((c) => c.id === id);
      if (cam) syncCameraToDb(cam);
      return updated;
    });
  }, [syncCameraToDb]);

  const updateCameraInstallationStatus = useCallback((id: string, status: InstallationStatus) => {
    setCameras((prev) => {
      const updated = prev.map((cam) => cam.id === id ? { ...cam, installationStatus: status } : cam);
      const cam = updated.find((c) => c.id === id);
      if (cam) syncCameraToDb(cam);
      return updated;
    });
  }, [syncCameraToDb]);

  const updateRackStatus = useCallback((id: string, status: RackStatus) => {
    setRacks((prev) => {
      const updated = prev.map((rack) => rack.id === id ? { ...rack, status } : rack);
      const rack = updated.find((r) => r.id === id);
      if (rack) syncRackToDb(rack);
      return updated;
    });
  }, [syncRackToDb]);

  const updateRackField = useCallback(
    (id: string, field: keyof Omit<Rack, 'id' | 'type' | 'x' | 'y' | 'name'>, value: boolean) => {
      setRacks((prev) => {
        const updated = prev.map((rack) => rack.id === id ? { ...rack, [field]: value } : rack);
        const rack = updated.find((r) => r.id === id);
        if (rack) syncRackToDb(rack);
        return updated;
      });
    },
    [syncRackToDb]
  );

  const updateRackPosition = useCallback((id: string, x: number, y: number) => {
    setRacks((prev) => {
      const updated = prev.map((rack) => rack.id === id ? { ...rack, x, y } : rack);
      const rack = updated.find((r) => r.id === id);
      if (rack) syncRackToDb(rack);
      return updated;
    });
  }, [syncRackToDb]);

  const updateRackInstallationStatus = useCallback((id: string, status: InstallationStatus) => {
    setRacks((prev) => {
      const updated = prev.map((rack) => rack.id === id ? { ...rack, installationStatus: status } : rack);
      const rack = updated.find((r) => r.id === id);
      if (rack) syncRackToDb(rack);
      return updated;
    });
  }, [syncRackToDb]);

  const updateCabinetStatus = useCallback((id: string, status: CabinetStatus) => {
    setCabinets((prev) => {
      const updated = prev.map((cab) => cab.id === id ? { ...cab, status } : cab);
      const cab = updated.find((c) => c.id === id);
      if (cab) syncCabinetToDb(cab);
      return updated;
    });
  }, [syncCabinetToDb]);

  const updateCabinetField = useCallback(
    (id: string, field: keyof Omit<Cabinet, 'id' | 'x' | 'y' | 'name'>, value: boolean) => {
      setCabinets((prev) => {
        const updated = prev.map((cab) => cab.id === id ? { ...cab, [field]: value } : cab);
        const cab = updated.find((c) => c.id === id);
        if (cab) syncCabinetToDb(cab);
        return updated;
      });
    },
    [syncCabinetToDb]
  );

  const updateCabinetPosition = useCallback((id: string, x: number, y: number) => {
    setCabinets((prev) => {
      const updated = prev.map((cab) => cab.id === id ? { ...cab, x, y } : cab);
      const cab = updated.find((c) => c.id === id);
      if (cab) syncCabinetToDb(cab);
      return updated;
    });
  }, [syncCabinetToDb]);

  const updateCabinetInstallationStatus = useCallback((id: string, status: InstallationStatus) => {
    setCabinets((prev) => {
      const updated = prev.map((cab) => cab.id === id ? { ...cab, installationStatus: status } : cab);
      const cab = updated.find((c) => c.id === id);
      if (cab) syncCabinetToDb(cab);
      return updated;
    });
  }, [syncCabinetToDb]);

  const updateFiberRouteStatus = useCallback((id: string, status: 'idle' | 'active') => {
    setFiberRoutes((prev) =>
      prev.map((route) =>
        route.id === id ? { ...route, status } : route
      )
    );
  }, []);

  const addFiberRoute = useCallback((route: FiberRoute) => {
    setFiberRoutes((prev) => [...prev, route]);
    upsertFiber.mutate({
      routeId: route.id,
      name: route.name,
      points: JSON.stringify(route.points),
      status: route.status === 'active' ? 'active' : 'inactive',
      color: route.color ?? '#EF4444',
    });
  }, [upsertFiber]);

  const deleteFiberRoute = useCallback((id: string) => {
    setFiberRoutes((prev) => prev.filter((r) => r.id !== id));
    deleteFiberMutation.mutate({ routeId: id });
  }, [deleteFiberMutation]);

  const addActivityLog = useCallback((activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLog = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setActivityLogs((prev) => [newActivity, ...prev]);

    // Persist to database
    insertActivity.mutate({
      equipmentId: activity.equipmentId,
      equipmentName: activity.equipmentName,
      equipmentType: activity.equipmentType,
      changeType: activity.changeType,
      action: activity.action,
      oldValue: activity.oldValue !== undefined ? String(activity.oldValue) : undefined,
      newValue: activity.newValue !== undefined ? String(activity.newValue) : undefined,
    });
  }, [insertActivity]);

  const value: FloorPlanContextType = {
    cameras,
    racks,
    cabinets,
    fiberRoutes,
    activityLogs,
    isLoading,
    hasDbError,
    updateCameraStatus,
    updateCameraField,
    updateCameraPosition,
    updateCameraRotation,
    updateCameraInstallationStatus,
    updateRackStatus,
    updateRackField,
    updateRackPosition,
    updateRackInstallationStatus,
    updateCabinetStatus,
    updateCabinetField,
    updateCabinetPosition,
    updateCabinetInstallationStatus,
    updateFiberRouteStatus,
    addFiberRoute,
    deleteFiberRoute,
    addActivityLog,
  };

  return (
    <FloorPlanContext.Provider value={value}>
      {children}
    </FloorPlanContext.Provider>
  );
};

export const useFloorPlan = () => {
  const context = useContext(FloorPlanContext);
  if (!context) {
    throw new Error('useFloorPlan must be used within FloorPlanProvider');
  }
  return context;
};
