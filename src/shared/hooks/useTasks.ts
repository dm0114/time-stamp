import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { toast } from "sonner";
import type { Task } from "@/shared/types";

export function useTasks() {
	const queryClient = useQueryClient();

	// 태스크 목록 조회
	const {
		data: tasks = [],
		isLoading,
		isError,
		refetch,
	} = useQuery<Task[]>({
		queryKey: ["tasks"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("tasks")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) {
				throw error;
			}

			return data || [];
		},
	});

	// 태스크 생성
	const createTaskMutation = useMutation({
		mutationFn: async (taskData: Partial<Task>) => {
			const { data, error } = await supabase
				.from("tasks")
				.insert([taskData])
				.select();

			if (error) {
				throw error;
			}

			return data?.[0];
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("새 태스크가 성공적으로 생성되었습니다");
		},
		onError: (error: Error) => {
			toast.error(`태스크 생성 중 오류: ${error.message}`);
		},
	});

	// 태스크 업데이트
	const updateTaskMutation = useMutation({
		mutationFn: async ({ id, ...updates }: { id: string } & Partial<Task>) => {
			const { data, error } = await supabase
				.from("tasks")
				.update(updates)
				.eq("id", id)
				.select();

			if (error) {
				throw error;
			}

			return data?.[0];
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("태스크가 성공적으로 업데이트되었습니다");
		},
		onError: (error: Error) => {
			toast.error(`태스크 업데이트 중 오류: ${error.message}`);
		},
	});

	// 태스크 삭제
	const deleteTaskMutation = useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from("tasks").delete().eq("id", id);

			if (error) {
				throw error;
			}

			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("태스크가 성공적으로 삭제되었습니다");
		},
		onError: (error: Error) => {
			toast.error(`태스크 삭제 중 오류: ${error.message}`);
		},
	});

	return {
		tasks,
		isLoading,
		isError,
		refetch,
		createTask: createTaskMutation.mutate,
		updateTask: updateTaskMutation.mutate,
		deleteTask: deleteTaskMutation.mutate,
		createTaskAsync: createTaskMutation.mutateAsync,
		updateTaskAsync: updateTaskMutation.mutateAsync,
		deleteTaskAsync: deleteTaskMutation.mutateAsync,
	};
}
