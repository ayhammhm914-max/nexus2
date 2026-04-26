import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { queryClient } from "./lib/queryClient";
import { router } from "./routes";
import { initializeSentry } from "./lib/sentry";
import "./index.css";

initializeSentry();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
