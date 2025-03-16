export interface User {
	id: string;
	email: string;
}

export interface Task {
	id: string;
	user_id: string;
	title: string;
	description: string | null;
	status: "todo" | "in-progress" | "completed";
	created_at: string;
	updated_at: string;
}

export interface TimeRecord {
	id: string;
	task_id: string;
	user_id: string;
	start_time: string;
	end_time: string | null;
	notes: string | null;
	created_at: string;
}

export interface UserSettings {
	user_id: string;
	is_premium: boolean;
	theme: "light" | "dark" | "system";
	show_in_menu_bar: boolean;
}

// 자주 사용되는 애플리케이션 상태 타입
export interface AppState {
	activeTaskId: string | null;
	activeRecordId: string | null;
	isRecording: boolean;
}

// Electron 창 API 타입
export interface ElectronAPI {
	showWindow: () => Promise<void>;
	showNotification: (title: string, body: string) => Promise<void>;
	setRecordingStatus: (isRecording: boolean, currentTask: any) => void;
	onStartRecording: (callback: () => void) => void;
	onStopRecording: (callback: () => void) => void;
	getStoreValue: <T>(key: string) => Promise<T>;
	setStoreValue: <T>(key: string, value: T) => Promise<void>;
}

// 전역 Window 객체에 ElectronAPI 타입 추가
declare global {
	interface Window {
		electron: ElectronAPI;
	}
}
