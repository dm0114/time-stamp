import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useTasks } from "@/shared/hooks/useTasks";
import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import TaskItem from "./task-item";
import TaskDialog from "./task-dialog";
import type { Task } from "@/shared/types";

interface TaskListProps {
	limit?: number;
	showViewAll?: boolean;
}

const TaskList = ({ limit, showViewAll = false }: TaskListProps) => {
	const { tasks, isLoading, refetch } = useTasks();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);

	const handleEdit = (task: Task) => {
		setSelectedTask(task);
		setIsDialogOpen(true);
	};

	const handleAddNew = () => {
		setSelectedTask(null);
		setIsDialogOpen(true);
	};

	// 태스크 제한
	const displayedTasks = limit ? tasks.slice(0, limit) : tasks;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>태스크</CardTitle>
					<CardDescription>작업 목록을 관리하세요</CardDescription>
				</div>
				<Button size="sm" onClick={handleAddNew}>
					<Plus className="mr-2 h-4 w-4" />새 태스크
				</Button>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex justify-center p-4">로딩 중...</div>
				) : tasks.length === 0 ? (
					<div className="flex flex-col items-center justify-center p-8 text-center">
						<p className="mb-4 text-muted-foreground">아직 태스크가 없습니다</p>
						<Button onClick={handleAddNew}>
							<Plus className="mr-2 h-4 w-4" />첫 태스크 만들기
						</Button>
					</div>
				) : (
					<div className="space-y-4">
						{displayedTasks.map((task) => (
							<TaskItem
								key={task.id}
								task={task}
								onEdit={() => handleEdit(task)}
							/>
						))}
					</div>
				)}
			</CardContent>

			{showViewAll && tasks.length > (limit || 0) && (
				<CardFooter>
					<Button variant="outline" className="w-full" asChild>
						<Link to="/tasks">모든 태스크 보기</Link>
					</Button>
				</CardFooter>
			)}

			{/* 태스크 추가/편집 다이얼로그 */}
			<TaskDialog
				open={isDialogOpen}
				setOpen={setIsDialogOpen}
				task={selectedTask}
				onComplete={refetch}
			/>
		</Card>
	);
};

export default TaskList;
