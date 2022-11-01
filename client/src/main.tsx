import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React, { useState } from "react";
import { trpc } from "@client/query/trpc";

export function AppWrapper() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api",
          //  optional
          headers() {
            return {
              // getAuthCookie(),
            };
          },
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <MantineProvider
            theme={{
              fontFamily: "Montserrat",
              colorScheme: "light",
              primaryColor: "orange",
            }}
            withGlobalStyles
            withNormalizeCSS
          >
            <App />
          </MantineProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
