import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import type { UserSettings } from "@/types";

export function useSettings() {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	// 설정 조회
	const {
		data: settings,
		isLoading,
		isError,
	} = useQuery<UserSettings | null>({
		queryKey: ["settings"],
		queryFn: async () => {
			if (!user) return null;

			const { data, error } = await supabase
				.from("user_settings")
				.select("*")
				.eq("user_id", user.id)
				.single();

			if (error && error.code !== "PGRST116") {
				// PGRST116는 데이터 없음 오류
				throw error;
			}

			if (!data) {
				// 설정이 없으면 기본값 생성
				const defaultSettings: Partial<UserSettings> = {
					user_id: user.id,
					is_premium: false,
					theme: "system",
					show_in_menu_bar: true,
				};

				const { data: newSettings, error: createError } = await supabase
					.from("user_settings")
					.insert([defaultSettings])
					.select()
					.single();

				if (createError) throw createError;
				return newSettings;
			}

			return data;
		},
		enabled: !!user,
	});

	// 설정 업데이트
	const updateSettingsMutation = useMutation({
		mutationFn: async (updates: Partial<UserSettings>) => {
			if (!user) throw new Error("사용자 인증이 필요합니다");

			const { data, error } = await supabase
				.from("user_settings")
				.update(updates)
				.eq("user_id", user.id)
				.select();

			if (error) {
				throw error;
			}

			return data?.[0];
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings"] });
			toast.success("설정이 성공적으로 저장되었습니다");
		},
		onError: (error: Error) => {
			toast.error(`설정 저장 중 오류: ${error.message}`);
		},
	});

	return {
		settings,
		isLoading,
		isError,
		updateSettings: updateSettingsMutation.mutate,
		updateSettingsAsync: updateSettingsMutation.mutateAsync,
	};
}
