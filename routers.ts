import { z } from "zod";
import { router, publicProcedure } from "./trpc.js";
import {
  getAllCameraStatus,
  upsertCameraStatus,
  getAllRackStatus,
  upsertRackStatus,
  getAllCabinetStatus,
  upsertCabinetStatus,
  getRecentActivityLog,
  insertActivityLog,
  getAllFiberRoutes,
  upsertFiberRoute,
  deleteFiberRoute,
} from "./db.js";

const installationStatusEnum = z.enum(["not_started", "in_progress", "completed"]);

export const appRouter = router({
  // ===== Camera Procedures =====
  camera: router({
    getAll: publicProcedure.query(async () => {
      return getAllCameraStatus();
    }),

    upsert: publicProcedure
      .input(
        z.object({
          cameraId: z.string(),
          status: z.string(),
          installationStatus: installationStatusEnum,
          wiringUTP: z.boolean(),
          wallMountingInstalled: z.boolean(),
          domeCameraInstalled: z.boolean(),
          x: z.number(),
          y: z.number(),
          rotation: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await upsertCameraStatus(input);
        return { success: true };
      }),
  }),

  // ===== Rack Procedures =====
  rack: router({
    getAll: publicProcedure.query(async () => {
      return getAllRackStatus();
    }),

    upsert: publicProcedure
      .input(
        z.object({
          rackId: z.string(),
          status: z.string(),
          installationStatus: installationStatusEnum,
          acPower: z.boolean(),
          utp: z.boolean(),
          poeSwitch: z.boolean(),
          fiberOptic: z.boolean(),
          ready: z.boolean(),
          x: z.number(),
          y: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await upsertRackStatus(input);
        return { success: true };
      }),
  }),

  // ===== Cabinet Procedures =====
  cabinet: router({
    getAll: publicProcedure.query(async () => {
      return getAllCabinetStatus();
    }),

    upsert: publicProcedure
      .input(
        z.object({
          cabinetId: z.string(),
          status: z.string(),
          installationStatus: installationStatusEnum,
          installCabinet: z.boolean(),
          acPower: z.boolean(),
          utp: z.boolean(),
          poeSwitch: z.boolean(),
          fiberOptic: z.boolean(),
          ready: z.boolean(),
          x: z.number(),
          y: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await upsertCabinetStatus(input);
        return { success: true };
      }),
  }),

  // ===== Fiber Route Procedures =====
  fiber: router({
    getAll: publicProcedure.query(async () => {
      return getAllFiberRoutes();
    }),

    upsert: publicProcedure
      .input(
        z.object({
          routeId: z.string(),
          name: z.string(),
          points: z.string(), // JSON string of [{x,y},...]
          status: z.enum(["active", "inactive"]).optional(),
          color: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await upsertFiberRoute({
          routeId: input.routeId,
          name: input.name,
          points: input.points,
          status: input.status ?? "active",
          color: input.color ?? "#EF4444",
        });
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ routeId: z.string() }))
      .mutation(async ({ input }) => {
        await deleteFiberRoute(input.routeId);
        return { success: true };
      }),
  }),

  // ===== Activity Log Procedures =====
  activityLog: router({
    getRecent: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return getRecentActivityLog(input.limit ?? 50);
      }),

    insert: publicProcedure
      .input(
        z.object({
          equipmentId: z.string(),
          equipmentName: z.string(),
          equipmentType: z.enum(["camera", "rack", "cabinet"]),
          changeType: z.enum(["status", "position", "rotation", "installation_step"]),
          action: z.string(),
          oldValue: z.string().optional(),
          newValue: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await insertActivityLog(input);
        return { success: true };
      }),
  }),
});

// ===== Fiber Route Procedures =====
// Note: appRouter is extended via module augmentation pattern
// Adding fiber procedures inline

export type AppRouter = typeof appRouter;
