import { useState } from "react";
import { Play, Pause, MoreVertical, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useTimeRecords } from "@/shared/hooks/useTimeRecords";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Badge } from "@/shared/ui/badge";
import type { Task } from "@/shared/types";
import { useTasks } from "@/shared/hooks/useTasks";
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

interface TaskItemProps {
	task: Task;
	onEdit: () => void;
}

const TaskItem = ({ task, onEdit }: TaskItemProps) => {
	const { deleteTask } = useTasks();
	const { timeRecords, activeRecord, startTimeRecord, stopTimeRecord } =
		useTimeRecords();
	const [loading, setLoading] = useState(false);
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);

	// 이 태스크에 활성화된 타이머가 있는지 확인
	const isActive = activeRecord && activeRecord.task_id === task.id;

	const handleStart = async () => {
		setLoading(true);
		await startTimeRecord(task.id);
		setLoading(false);
	};

	const handleStop = async () => {
		if (!activeRecord) return;
		setLoading(true);
		await stopTimeRecord(activeRecord.id);
		setLoading(false);
	};

	const handleDelete = async () => {
		await deleteTask(task.id);
		setShowDeleteAlert(false);
	};

	// 상태에 따른 배지 스타일
	const getBadgeVariant = () => {
		switch (task.status) {
			case "todo":
				return "outline";
			case "in-progress":
				return "default";
			case "completed":
				return "secondary";
			default:
				return "outline";
		}
	};

	// 상태 텍스트
	const getStatusText = () => {
		switch (task.status) {
			case "todo":
				return "할 일";
			case "in-progress":
				return "진행 중";
			case "completed":
				return "완료됨";
			default:
				return task.status;
		}
	};

	return (
		<>
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<h3 className="font-medium">{task.title}</h3>
								<Badge variant={getBadgeVariant()}>{getStatusText()}</Badge>
							</div>
							{task.description && (
								<p className="text-sm text-muted-foreground">
									{task.description}
								</p>
							)}
							<p className="text-xs text-muted-foreground">
								{formatDistanceToNow(new Date(task.created_at), {
									addSuffix: true,
									locale: ko,
								})}
							</p>
						</div>

						<div className="flex items-center space-x-2">
							<Button
								variant={isActive ? "destructive" : "default"}
								size="sm"
								onClick={isActive ? handleStop : handleStart}
								disabled={loading}
							>
								{isActive ? (
									<>
										<Pause className="mr-1 h-4 w-4" />
										중지
									</>
								) : (
									<>
										<Play className="mr-1 h-4 w-4" />
										시작
									</>
								)}
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm">
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={onEdit}>
										<Edit className="mr-2 h-4 w-4" />
										편집
									</DropdownMenuItem>
									<DropdownMenuItem
										className="text-destructive"
										onClick={() => setShowDeleteAlert(true)}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										삭제
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 삭제 확인 다이얼로그 */}
			<AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
						<AlertDialogDescription>
							이 작업은 되돌릴 수 없습니다. 이 태스크와 관련된 모든 시간 기록이
							삭제됩니다.
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

export default TaskItem;
