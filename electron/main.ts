import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } from "electron";
import path from "node:path";
import Store from "electron-store";

// 저장소 설정
const store = new Store();

// 윈도우 상태 관리
process.env.DIST = path.join(__dirname, "../dist");
process.env.PUBLIC = app.isPackaged
	? process.env.DIST
	: path.join(process.env.DIST, "../public");

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1024,
		height: 768,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
		icon: path.join(process.env.PUBLIC, "app-icon.png"),
	});

	// HTML 로드하기
	if (process.env.VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
		mainWindow.webContents.openDevTools(); // 개발 중에만 개발자 도구 열기
	} else {
		mainWindow.loadFile(path.join(process.env.DIST, "index.html"));
	}

	// 창이 닫힐 때 이벤트
	mainWindow.on("close", (event) => {
		// macOS에서는 창 닫기를 Dock에 최소화로 처리
		if (process.platform === "darwin") {
			event.preventDefault();
			mainWindow?.hide();
			return;
		}
	});
}

// 트레이 아이콘 생성 (macOS 메뉴바 통합)
function createTray() {
	const icon = nativeImage.createFromPath(
		path.join(process.env.PUBLIC, "app-icon.png"),
	);
	tray = new Tray(icon.resize({ width: 16, height: 16 }));

	const updateContextMenu = () => {
		const isRecording = store.get("isRecording", false);
		const currentTask = store.get("currentTask", null);

		const contextMenu = Menu.buildFromTemplate([
			{ label: "Work Time Stamp", enabled: false },
			{ type: "separator" },
			{
				label: isRecording
					? `⏸ 중지: ${currentTask?.title || ""}`
					: "▶️ 작업 시작",
				click: () => {
					mainWindow?.webContents.send(
						isRecording ? "stop-recording" : "start-recording",
					);
				},
			},
			{ type: "separator" },
			{
				label: "앱 열기",
				click: () => {
					mainWindow?.show();
				},
			},
			{
				label: "종료",
				click: () => {
					app.quit();
				},
			},
		]);

		tray?.setContextMenu(contextMenu);

		if (isRecording) {
			tray?.setTitle(`⏺ ${currentTask?.title || ""}`);
		} else {
			tray?.setTitle("");
		}
	};

	// 초기 메뉴 설정
	updateContextMenu();

	// 주기적으로 메뉴 업데이트 (1초마다)
	setInterval(updateContextMenu, 1000);

	tray.on("click", () => {
		if (process.platform === "darwin") {
			tray?.popUpContextMenu();
		} else {
			mainWindow?.show();
		}
	});
}

// 앱 준비 완료
app.whenReady().then(() => {
	createWindow();

	// macOS에서만 트레이 아이콘 생성
	if (process.platform === "darwin") {
		createTray();
	}

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		} else {
			mainWindow?.show();
		}
	});
});

// 모든 창이 닫혔을 때 앱 종료 (macOS 제외)
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// IPC 이벤트 핸들러
ipcMain.handle("show-window", () => {
	mainWindow?.show();
});

ipcMain.handle("show-notification", (_, title, body) => {
	new Notification({ title, body }).show();
});

ipcMain.on("set-recording-status", (_, isRecording, currentTask) => {
	store.set("isRecording", isRecording);
	store.set("currentTask", currentTask);
});

// 로컬 환경설정 저장/로드 핸들러
ipcMain.handle("get-store-value", (_, key) => {
	return store.get(key);
});

ipcMain.handle("set-store-value", (_, key, value) => {
	store.set(key, value);
});
