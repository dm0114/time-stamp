import { defineConfig } from "vite";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

// https://vitejs.dev/config
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		electron([
			{
				entry: "electron/main.ts",
			},
			{
				entry: "electron/preload.ts",
				onstart(options) {
					options.startup();
				},
			},
		]),
		renderer(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
