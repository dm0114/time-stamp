import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { useSettings } from "@/shared/hooks/useSettings";
import { useTheme } from "@/app/providers/theme-provider";
import type { UserSettings } from "@/types";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const SettingsPage = () => {
	const { settings, isLoading, updateSettings } = useSettings();
	const { theme, setTheme } = useTheme();

	const [localSettings, setLocalSettings] = useState<Partial<UserSettings>>({
		theme: "system",
		show_in_menu_bar: true,
	});

	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	// 설정이 로드되면 로컬 상태 업데이트
	useEffect(() => {
		if (settings) {
			setLocalSettings({
				theme: settings.theme,
				show_in_menu_bar: settings.show_in_menu_bar,
			});
		}
	}, [settings]);

	// 테마 변경
	const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
		setLocalSettings({
			...localSettings,
			theme: newTheme,
		});
		setTheme(newTheme);
	};

	// 메뉴바 설정 변경
	const handleMenuBarChange = (enabled: boolean) => {
		setLocalSettings({
			...localSettings,
			show_in_menu_bar: enabled,
		});
	};

	// 설정 저장
	const saveSettings = async () => {
		setSaving(true);
		try {
			await updateSettings(localSettings);
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch (error) {
			console.error("설정 저장 오류:", error);
		} finally {
			setSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center p-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4">설정 로딩 중...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">설정</h1>
				<p className="text-muted-foreground">
					애플리케이션의 설정을 관리합니다.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>테마</CardTitle>
					<CardDescription>앱의 디스플레이 모드를 선택하세요.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="theme-light">라이트 모드</Label>
						<input
							id="theme-light"
							type="radio"
							name="theme"
							checked={localSettings.theme === "light"}
							onChange={() => handleThemeChange("light")}
							className="h-4 w-4 text-primary border-primary"
						/>
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor="theme-dark">다크 모드</Label>
						<input
							id="theme-dark"
							type="radio"
							name="theme"
							checked={localSettings.theme === "dark"}
							onChange={() => handleThemeChange("dark")}
							className="h-4 w-4 text-primary border-primary"
						/>
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor="theme-system">시스템 기본값</Label>
						<input
							id="theme-system"
							type="radio"
							name="theme"
							checked={localSettings.theme === "system"}
							onChange={() => handleThemeChange("system")}
							className="h-4 w-4 text-primary border-primary"
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>시스템 설정</CardTitle>
					<CardDescription>앱 동작 방식을 설정합니다.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label htmlFor="menubar">메뉴바에 표시</Label>
							<p className="text-sm text-muted-foreground">
								macOS에서 메뉴바에 앱 아이콘을 표시합니다.
							</p>
						</div>
						<Switch
							id="menubar"
							checked={localSettings.show_in_menu_bar}
							onCheckedChange={handleMenuBarChange}
						/>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					<div>
						{saved && (
							<div className="flex items-center text-green-600 dark:text-green-500">
								<CheckCircle2 className="mr-1 h-4 w-4" />
								<span className="text-sm">저장됨</span>
							</div>
						)}
					</div>
					<Button onClick={saveSettings} disabled={saving || saved}>
						{saving ? "저장 중..." : "설정 저장"}
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>계정 정보</CardTitle>
					<CardDescription>사용 중인 계정 정보입니다.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					<div className="space-y-1">
						<p className="text-sm font-medium">요금제</p>
						<p className="text-sm text-muted-foreground">
							{settings?.is_premium ? "프리미엄 이용자" : "무료 이용자"}
						</p>
					</div>
					{!settings?.is_premium && (
						<div className="mt-4 rounded-md bg-muted p-4">
							<div className="flex">
								<AlertCircle className="h-5 w-5 text-muted-foreground" />
								<div className="ml-3">
									<h3 className="text-sm font-medium">무료 요금제 사용 중</h3>
									<div className="mt-2 text-sm text-muted-foreground">
										<p>프리미엄으로 업그레이드하여 추가 기능을 이용하세요:</p>
										<ul className="mt-2 list-disc pl-5 text-sm">
											<li>클라우드 동기화</li>
											<li>고급 보고서</li>
											<li>데이터 내보내기</li>
											<li>무제한 태스크 및 기록</li>
										</ul>
									</div>
									<div className="mt-4">
										<Button variant="outline" size="sm">
											프리미엄으로 업그레이드
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>정보</CardTitle>
					<CardDescription>앱 정보 및 저작권</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					<p className="text-sm text-muted-foreground">
						Work Time Stamp v0.1.0
					</p>
					<p className="text-sm text-muted-foreground">
						&copy; 2023 Your Company. All rights reserved.
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default SettingsPage;
