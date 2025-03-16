import { useState, useEffect } from "react";
import { useTasks } from "@/shared/hooks/useTasks";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import type { Task } from "@/shared/types";

interface TaskDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	task: Task | null;
	onComplete: () => void;
}

const TaskDialog = ({ open, setOpen, task, onComplete }: TaskDialogProps) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState<"todo" | "in-progress" | "completed">(
		"todo",
	);
	const [loading, setLoading] = useState(false);

	const { createTask, updateTask } = useTasks();

	useEffect(() => {
		if (task) {
			setTitle(task.title);
			setDescription(task.description || "");
			setStatus(task.status);
		} else {
			// 새 태스크인 경우 초기화
			setTitle("");
			setDescription("");
			setStatus("todo");
		}
	}, [task, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) return;

		setLoading(true);

		try {
			const taskData = {
				title,
				description: description || null,
				status,
			};

			if (task) {
				await updateTask({ id: task.id, ...taskData });
			} else {
				await createTask(taskData);
			}

			onComplete();
			setOpen(false);
		} catch (error) {
			console.error("태스크 저장 오류:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{task ? "태스크 편집" : "새 태스크 생성"}</DialogTitle>
						<DialogDescription>
							태스크 정보를 입력하고 저장하세요
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label htmlFor="title" className="text-sm font-medium">
								제목
							</label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="태스크 제목"
								required
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="description" className="text-sm font-medium">
								설명
							</label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="태스크에 대한 설명 (선택사항)"
								rows={3}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="status" className="text-sm font-medium">
								상태
							</label>
							<Select
								value={status}
								onValueChange={(value) =>
									setStatus(value as "todo" | "in-progress" | "completed")
								}
							>
								<SelectTrigger id="status">
									<SelectValue placeholder="상태 선택" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="todo">할 일</SelectItem>
									<SelectItem value="in-progress">진행 중</SelectItem>
									<SelectItem value="completed">완료됨</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							취소
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "저장 중..." : "저장"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default TaskDialog;
