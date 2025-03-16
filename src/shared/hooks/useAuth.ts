import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { toast } from "sonner";
import { useEffect } from "react";
import type { User } from "@/shared/types";

export function useAuth() {
	const queryClient = useQueryClient();

	// 현재 사용자 가져오기
	const {
		data: user,
		isLoading,
		isError,
		refetch,
	} = useQuery<User | null>({
		queryKey: ["auth", "user"],
		queryFn: async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			return user;
		},
	});

	// 인증 상태 변경 감지
	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async () => {
			await refetch();
		});

		// 컴포넌트 언마운트 시 구독 해제
		return () => {
			subscription.unsubscribe();
		};
	}, [refetch]);

	// 로그인 뮤테이션
	const signInMutation = useMutation({
		mutationFn: async ({
			email,
			password,
		}: { email: string; password: string }) => {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				throw error;
			}

			return true;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "로그인 중 오류가 발생했습니다.");
		},
	});

	// 회원가입 뮤테이션
	const signUpMutation = useMutation({
		mutationFn: async ({
			email,
			password,
		}: { email: string; password: string }) => {
			const { error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) {
				throw error;
			}

			return true;
		},
		onSuccess: () => {
			toast.success("회원가입 성공, 이메일 인증을 완료해주세요.");
		},
		onError: (error: Error) => {
			toast.error(error.message || "회원가입 중 오류가 발생했습니다.");
		},
	});

	// 로그아웃 뮤테이션
	const signOutMutation = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.auth.signOut();

			if (error) {
				throw error;
			}

			return true;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
			// 로그아웃 시 모든 쿼리 캐시 초기화
			queryClient.clear();
		},
		onError: (error: Error) => {
			toast.error(error.message || "로그아웃 중 오류가 발생했습니다.");
		},
	});

	return {
		user,
		isLoading,
		isError,
		signIn: signInMutation.mutate,
		signUp: signUpMutation.mutate,
		signOut: signOutMutation.mutate,
		signInAsync: signInMutation.mutateAsync,
		signUpAsync: signUpMutation.mutateAsync,
		signOutAsync: signOutMutation.mutateAsync,
	};
}
