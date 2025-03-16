import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatElapsedTime(milliseconds: number): string {
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	const formattedHours = String(hours).padStart(2, "0");
	const formattedMinutes = String(minutes % 60).padStart(2, "0");
	const formattedSeconds = String(seconds % 60).padStart(2, "0");

	return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export function calculateDuration(startTime: string, endTime?: string): number {
	const start = new Date(startTime).getTime();
	const end = endTime ? new Date(endTime).getTime() : Date.now();
	return end - start;
}
