import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useTimeRecords } from "@/shared/hooks/useTimeRecords";
import { useTasks } from "@/shared/hooks/useTasks";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { calculateDuration, formatElapsedTime } from "@/shared/lib/utils";
import { Trash2, MoreVertical } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type { TimeRecord } from "@/types";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

interface TimeRecordListProps {
	taskId?: string;
	limit?: number;
}

const TimeRecordList = ({ taskId, limit }: TimeRecordListProps) => {
	const { timeRecords, isLoading, deleteTimeRecord } = useTimeRecords(taskId);
	const { tasks } = useTasks();
	const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null);
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);

	// 레코드 수 제한
	const displayRecords = limit ? timeRecords.slice(0, limit) : timeRecords;

	// 태스크 이름 가져오기
	const getTaskName = (taskId: string) => {
		const task = tasks.find((t) => t.id === taskId);
		return task?.title || "삭제된 태스크";
	};

	// 삭제 처리
	const handleDelete = async () => {
		if (selectedRecord) {
			await deleteTimeRecord(selectedRecord.id);
			setShowDeleteAlert(false);
			setSelectedRecord(null);
		}
	};

	// 삭제 다이얼로그 열기
	const openDeleteDialog = (record: TimeRecord) => {
		setSelectedRecord(record);
		setShowDeleteAlert(true);
	};

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>시간 기록</CardTitle>
					<CardDescription>작업 시간 기록 내역</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex justify-center py-4">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
						</div>
					) : timeRecords.length === 0 ? (
						<div className="py-4 text-center">
							<p className="text-muted-foreground">기록된 시간이 없습니다.</p>
						</div>
					) : (
						<div className="space-y-4">
							{displayRecords.map((record) => {
								const duration = calculateDuration(
									record.start_time,
									record.end_time,
								);
								const startTime = new Date(record.start_time);

								return (
									<div
										key={record.id}
										className="flex items-center justify-between border-b pb-2 last:border-0"
									>
										<div className="space-y-1">
											<div className="font-medium">
												{getTaskName(record.task_id)}
											</div>
											<div className="flex space-x-2 text-xs text-muted-foreground">
												<span>{format(startTime, "PPP", { locale: ko })}</span>
												<span>{format(startTime, "p", { locale: ko })}</span>
											</div>
										</div>

										<div className="flex items-center space-x-2">
											<span className="font-medium">
												{formatElapsedTime(duration)}
											</span>

											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														className="text-destructive"
														onClick={() => openDeleteDialog(record)}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														삭제
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</div>
								);
							})}

							{limit && timeRecords.length > limit && (
								<Button variant="outline" className="w-full">
									모든 기록 보기
								</Button>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* 삭제 확인 다이얼로그 */}
			<AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
						<AlertDialogDescription>
							이 시간 기록을 삭제하면 복구할 수 없습니다.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>취소</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground"
						>
							삭제
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default TimeRecordList;
