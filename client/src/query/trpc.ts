import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@server/routers/main.router";
import { createTRPCReact } from "@trpc/react-query";
import { Context } from "@server/context";
export const trpc = createTRPCReact<AppRouter>({
  // config({ ctx }:{ctx:Context}) {
  //     return { ctx };
  //   }
});
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/",
    }),
  ],
});
