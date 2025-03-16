import React from "react";
import ReactDOM from "react-dom";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { queryClient } from "@/shared/lib/query";
import { router } from "@/routes/__root";
import "@/index.css";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="system" storageKey="work-timestamp-theme">
				<RouterProvider router={router} />
				<Toaster />
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
