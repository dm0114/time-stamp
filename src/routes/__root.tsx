import {
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
} from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/components/Dashboard";
import TasksPage from "@/components/tasks/TasksPage";
import ReportsPage from "@/components/reports/ReportsPage";
import SettingsPage from "@/components/settings/SettingsPage";
import Login from "@/components/auth/Login";
import NotFound from "@/components/NotFound";
import LoadingPage from "@/components/LoadingPage";

// 루트 라우트
export const rootRoute = createRootRoute({
	component: () => {
		const { user, isLoading } = useAuth();

		if (isLoading) {
			return <LoadingPage />;
		}

		// 인증되지 않은 경우 로그인 화면 렌더링
		if (!user) {
			return <Login />;
		}

		return <Outlet />;
	},
});

// 레이아웃 라우트
export const layoutRoute = createRoute({
	getParentRoute: () => rootRoute,
	id: "layout",
	component: Layout,
});

// 대시보드 라우트
export const indexRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "/",
	component: Dashboard,
});

// 태스크 라우트
export const tasksRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "/tasks",
	component: TasksPage,
});

// 보고서 라우트
export const reportsRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "/reports",
	component: ReportsPage,
});

// 설정 라우트
export const settingsRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "/settings",
	component: SettingsPage,
});

// 404 라우트
export const notFoundRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "*",
	component: NotFound,
});

// 라우터 생성 및 내보내기
const routeTree = rootRoute.addChildren([
	layoutRoute.addChildren([
		indexRoute,
		tasksRoute,
		reportsRoute,
		settingsRoute,
	]),
	notFoundRoute,
]);

export const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	context: {
		queryClient,
	},
});

// 타입 선언
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
