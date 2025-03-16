import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useTimeRecords } from "@/shared/hooks/useTimeRecords";
import { useTasks } from "@/shared/hooks/useTasks";
import { calculateDuration, formatElapsedTime } from "@/shared/lib/utils";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { ko } from "date-fns/locale";

const ReportsPage = () => {
	const { timeRecords } = useTimeRecords();
	const { tasks } = useTasks();
	const [period, setPeriod] = useState<"day" | "week" | "month">("day");

	// 기간 계산
	const today = new Date();
	const periods = {
		day: {
			start: subDays(today, 7),
			end: today,
			label: "최근 7일",
		},
		week: {
			start: startOfWeek(subDays(today, 28), { locale: ko }),
			end: today,
			label: "최근 4주",
		},
		month: {
			start: startOfMonth(subDays(today, 90)),
			end: today,
			label: "최근 3개월",
		},
	};

	const currentPeriod = periods[period];

	// 선택한 기간의 레코드 필터링
	const filteredRecords = timeRecords.filter((record) => {
		const recordDate = new Date(record.start_time);
		return recordDate >= currentPeriod.start && recordDate <= currentPeriod.end;
	});

	// 태스크별 소요 시간 계산
	const taskTimeSummary = filteredRecords.reduce(
		(acc, record) => {
			const taskId = record.task_id;
			if (!acc[taskId]) {
				acc[taskId] = 0;
			}

			acc[taskId] += calculateDuration(record.start_time, record.end_time);
			return acc;
		},
		{} as Record<string, number>,
	);

	// 태스크별 시간 데이터 생성
	const taskTimeData = Object.entries(taskTimeSummary)
		.map(([taskId, duration]) => {
			const task = tasks.find((t) => t.id === taskId);
			return {
				taskId,
				title: task?.title || "삭제된 태스크",
				duration,
			};
		})
		.sort((a, b) => b.duration - a.duration);

	// 총 기록 시간
	const totalDuration = Object.values(taskTimeSummary).reduce(
		(a, b) => a + b,
		0,
	);

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold tracking-tight">보고서</h1>

			<Tabs defaultValue="summary" className="space-y-4">
				<TabsList>
					<TabsTrigger value="summary">요약</TabsTrigger>
					<TabsTrigger value="tasks">태스크별</TabsTrigger>
					<TabsTrigger value="timeline">타임라인</TabsTrigger>
				</TabsList>

				<div className="flex justify-end space-x-2">
					<TabsList>
						<TabsTrigger
							value="day"
							onClick={() => setPeriod("day")}
							data-state={period === "day" ? "active" : ""}
						>
							일간
						</TabsTrigger>
						<TabsTrigger
							value="week"
							onClick={() => setPeriod("week")}
							data-state={period === "week" ? "active" : ""}
						>
							주간
						</TabsTrigger>
						<TabsTrigger
							value="month"
							onClick={() => setPeriod("month")}
							data-state={period === "month" ? "active" : ""}
						>
							월간
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="summary" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>시간 요약</CardTitle>
							<CardDescription>{currentPeriod.label}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex justify-between border-b pb-2">
									<span className="font-medium">총 작업 시간</span>
									<span className="font-bold">
										{formatElapsedTime(totalDuration)}
									</span>
								</div>
								<div className="flex justify-between border-b pb-2">
									<span className="font-medium">작업 세션</span>
									<span>{filteredRecords.length}회</span>
								</div>
								<div className="flex justify-between border-b pb-2">
									<span className="font-medium">평균 세션 시간</span>
									<span>
										{filteredRecords.length > 0
											? formatElapsedTime(
													totalDuration / filteredRecords.length,
												)
											: "0:00:00"}
									</span>
								</div>
								<div className="flex justify-between pb-2">
									<span className="font-medium">활동 일수</span>
									<span>
										{
											new Set(
												filteredRecords.map((r) =>
													format(new Date(r.start_time), "yyyy-MM-dd"),
												),
											).size
										}
										일
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>상위 태스크</CardTitle>
							<CardDescription>가장 많은 시간을 사용한 태스크</CardDescription>
						</CardHeader>
						<CardContent>
							{taskTimeData.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									선택한 기간에 기록된 데이터가 없습니다.
								</p>
							) : (
								<div className="space-y-4">
									{taskTimeData.slice(0, 5).map((item) => (
										<div key={item.taskId} className="space-y-2">
											<div className="flex justify-between">
												<span className="font-medium">{item.title}</span>
												<span>{formatElapsedTime(item.duration)}</span>
											</div>
											<div className="h-2 w-full rounded-full bg-secondary">
												<div
													className="h-2 rounded-full bg-primary"
													style={{
														width: `${Math.min(100, (item.duration / totalDuration) * 100)}%`,
													}}
												/>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="tasks" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>태스크별 시간</CardTitle>
							<CardDescription>{currentPeriod.label}</CardDescription>
						</CardHeader>
						<CardContent>
							{taskTimeData.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									선택한 기간에 기록된 데이터가 없습니다.
								</p>
							) : (
								<div className="space-y-4">
									{taskTimeData.map((item) => (
										<div key={item.taskId} className="space-y-2">
											<div className="flex justify-between">
												<span className="font-medium">{item.title}</span>
												<span>{formatElapsedTime(item.duration)}</span>
											</div>
											<div className="h-2 w-full rounded-full bg-secondary">
												<div
													className="h-2 rounded-full bg-primary"
													style={{
														width: `${Math.min(100, (item.duration / totalDuration) * 100)}%`,
													}}
												/>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="timeline" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>일간 타임라인</CardTitle>
							<CardDescription>{currentPeriod.label}</CardDescription>
						</CardHeader>
						<CardContent>
							{filteredRecords.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									선택한 기간에 기록된 데이터가 없습니다.
								</p>
							) : (
								<div className="space-y-6">
									{/* 날짜별로 그룹화하여 타임라인 표시 */}
									{Object.entries(
										filteredRecords.reduce(
											(acc, record) => {
												const day = format(
													new Date(record.start_time),
													"yyyy-MM-dd",
												);
												if (!acc[day]) {
													acc[day] = [];
												}
												acc[day].push(record);
												return acc;
											},
											{} as Record<string, TimeRecord[]>,
										),
									)
										.sort(
											(a, b) =>
												new Date(b[0]).getTime() - new Date(a[0]).getTime(),
										)
										.map(([date, records]) => {
											// 해당 날짜의 총 작업 시간 계산
											const dayTotal = records.reduce(
												(total, record) =>
													total +
													calculateDuration(record.start_time, record.end_time),
												0,
											);

											return (
												<div key={date} className="space-y-2">
													<div className="flex items-center justify-between">
														<h3 className="font-semibold">
															{format(new Date(date), "PPP (eee)", {
																locale: ko,
															})}
														</h3>
														<span className="text-sm font-medium">
															{formatElapsedTime(dayTotal)}
														</span>
													</div>

													<div className="space-y-2 pl-4">
														{records
															.sort(
																(a, b) =>
																	new Date(b.start_time).getTime() -
																	new Date(a.start_time).getTime(),
															)
															.map((record) => {
																const task = tasks.find(
																	(t) => t.id === record.task_id,
																);
																const startTime = new Date(record.start_time);
																const duration = calculateDuration(
																	record.start_time,
																	record.end_time,
																);

																return (
																	<div
																		key={record.id}
																		className="flex items-center space-x-2 text-sm"
																	>
																		<div className="h-2 w-2 rounded-full bg-primary" />
																		<div className="flex-1">
																			<div className="flex justify-between">
																				<span className="font-medium">
																					{task?.title || "삭제된 태스크"}
																				</span>
																				<span>
																					{formatElapsedTime(duration)}
																				</span>
																			</div>
																			<div className="text-xs text-muted-foreground">
																				{format(startTime, "p", { locale: ko })}{" "}
																				시작
																			</div>
																		</div>
																	</div>
																);
															})}
													</div>
												</div>
											);
										})}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default ReportsPage;
