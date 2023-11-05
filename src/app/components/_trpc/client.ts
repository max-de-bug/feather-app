import { AppRouter } from "@/trpc";
import { createTRPCReact } from "@tanstack/react-query";

export const trpc = createTRPCReact<AppRouter>({});
