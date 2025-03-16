import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { toast } from "sonner";
import type { TimeRecord } from "@/types";
import { useEffect } from "react";

// taskId가 제공되면 특정 태스크의 시간 기록만 조회
export function useTimeRecords(taskId?: string) {
	const queryClient = useQueryClient();

	// 시간 기록 목록 조회
	const {
		data: timeRecords = [],
		isLoading,
		isError,
		refetch,
	} = useQuery<TimeRecord[]>({
		queryKey: ["timeRecords", taskId],
		queryFn: async () => {
			let query = supabase
				.from("time_records")
				.select("*")
				.order("start_time", { ascending: false });

			if (taskId) {
				query = query.eq("task_id", taskId);
			}

			const { data, error } = await query;

			if (error) {
				throw error;
			}

			return data || [];
		},
		enabled: taskId !== undefined,
	});

	// Electron 메뉴바 상태 동기화
	const activeRecord = timeRecords.find((record) => !record.end_time);

	useEffect(() => {
		if (activeRecord && window.electron) {
			// 현재 활성 태스크 정보 가져오기
			const getActiveTask = async () => {
				const { data: tasks } = await supabase
					.from("tasks")
					.select("*")
					.eq("id", activeRecord.task_id)
					.limit(1);

				const activeTask = tasks?.[0];

				// Electron에 기록 상태 전달
				window.electron.setRecordingStatus(true, activeTask);
			};

			getActiveTask();
		} else if (window.electron) {
			window.electron.setRecordingStatus(false, null);
		}
	}, [activeRecord]);

	// 시간 기록 시작
	const startTimeRecordMutation = useMutation({
		mutationFn: async (taskId: string) => {
			const { data, error } = await supabase
				.from("time_records")
				.insert([
					{
						task_id: taskId,
						start_time: new Date().toISOString(),
					},
				])
				.select();

			if (error) {
				throw error;
			}

			return data?.[0];
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["timeRecords"] });
			toast.success("태스크 시간 기록이 시작되었습니다");

			// 알림 표시
			if (window.electron) {
				window.electron.showNotification(
					"시간 기록 시작",
					"태스크 시간 기록이 시작되었습니다",
				);
			}
		},
		onError: (error: Error) => {
			toast.error(`시간 기록 시작 중 오류: ${error.message}`);
		},
	});

	// 시간 기록 종료
	const stopTimeRecordMutation = useMutation({
		mutationFn: async (recordId: string) => {
			const { data, error } = await supabase
				.from("time_records")
				.update({
					end_time: new Date().toISOString(),
				})
				.eq("id", recordId)
				.select();

			if (error) {
				throw error;
			}

			return data?.[0];
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["timeRecords"] });
			toast.success("태스크 시간 기록이 종료되었습니다");

			// 알림 표시
			if (window.electron) {
				window.electron.showNotification(
					"시간 기록 종료",
					"태스크 시간 기록이 종료되었습니다",
				);
			}
		},
		onError: (error: Error) => {
			toast.error(`시간 기록 종료 중 오류: ${error.message}`);
		},
	});

	// 시간 기록 삭제
	const deleteTimeRecordMutation = useMutation({
		mutationFn: async (recordId: string) => {
			const { error } = await supabase
				.from("time_records")
				.delete()
				.eq("id", recordId);

			if (error) {
				throw error;
			}

			return recordId;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["timeRecords"] });
			toast.success("시간 기록이 성공적으로 삭제되었습니다");
		},
		onError: (error: Error) => {
			toast.error(`시간 기록 삭제 중 오류: ${error.message}`);
		},
	});

	return {
		timeRecords,
		activeRecord,
		isLoading,
		isError,
		refetch,
		startTimeRecord: startTimeRecordMutation.mutate,
		stopTimeRecord: stopTimeRecordMutation.mutate,
		deleteTimeRecord: deleteTimeRecordMutation.mutate,
		startTimeRecordAsync: startTimeRecordMutation.mutateAsync,
		stopTimeRecordAsync: stopTimeRecordMutation.mutateAsync,
		deleteTimeRecordAsync: deleteTimeRecordMutation.mutateAsync,
	};
}
