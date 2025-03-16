import { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useTimeRecords } from "@/shared/hooks/useTimeRecords";
import { useTasks } from "@/shared/hooks/useTasks";
import { formatElapsedTime } from "@/shared/lib/utils";
import { Pause } from "lucide-react";

const ActiveTimer = () => {
	const { activeRecord, stopTimeRecord } = useTimeRecords();
	const { tasks } = useTasks();
	const [elapsedTime, setElapsedTime] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const activeTask = activeRecord
		? tasks.find((t) => t.id === activeRecord.task_id)
		: null;

	useEffect(() => {
		if (!activeRecord) return;

		// 경과 시간 계산 및 업데이트
		const updateElapsedTime = () => {
			const startTime = new Date(activeRecord.start_time).getTime();
			const currentTime = Date.now();
			setElapsedTime(currentTime - startTime);
		};

		// 초기 계산
		updateElapsedTime();

		// 1초마다 업데이트
		const intervalId = setInterval(updateElapsedTime, 1000);

		return () => clearInterval(intervalId);
	}, [activeRecord]);

	// 타이머 중지
	const handleStop = async () => {
		if (!activeRecord) return;

		setIsLoading(true);
		await stopTimeRecord(activeRecord.id);
		setIsLoading(false);
	};

	if (!activeRecord || !activeTask) return null;

	return (
		<Card className="bg-primary text-primary-foreground">
			<CardContent className="flex items-center justify-between p-4">
				<div>
					<h3 className="text-lg font-medium">
						현재 작업 중: {activeTask.title}
					</h3>
					<p className="text-2xl font-bold">{formatElapsedTime(elapsedTime)}</p>
				</div>

				<Button
					variant="secondary"
					size="sm"
					onClick={handleStop}
					disabled={isLoading}
				>
					<Pause className="mr-2 h-4 w-4" />
					중지
				</Button>
			</CardContent>
		</Card>
	);
};

export default ActiveTimer;
