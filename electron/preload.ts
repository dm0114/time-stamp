import { contextBridge, ipcRenderer } from "electron";

// 렌더러 프로세스에 노출할 API
contextBridge.exposeInMainWorld("electron", {
	// 창 관리
	showWindow: () => ipcRenderer.invoke("show-window"),

	// 알림
	showNotification: (title: string, body: string) =>
		ipcRenderer.invoke("show-notification", title, body),

	// 기록 상태 설정
	setRecordingStatus: (isRecording: boolean, currentTask: any) =>
		ipcRenderer.send("set-recording-status", isRecording, currentTask),

	// 이벤트 리스너
	onStartRecording: (callback: () => void) =>
		ipcRenderer.on("start-recording", () => callback()),

	onStopRecording: (callback: () => void) =>
		ipcRenderer.on("stop-recording", () => callback()),

	// 로컬 저장소 관리
	getStoreValue: (key: string) => ipcRenderer.invoke("get-store-value", key),
	setStoreValue: (key: string, value: any) =>
		ipcRenderer.invoke("set-store-value", key, value),
});
