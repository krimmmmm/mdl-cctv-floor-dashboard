import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { Request, Response } from "express";

export type TrpcContext = {
  req: Request;
  res: Response;
};

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
