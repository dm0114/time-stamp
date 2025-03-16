import { useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isRegister, setIsRegister] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { signIn, signUp } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			if (isRegister) {
				await signUp({ email, password });
			} else {
				await signIn({ email, password });
			}
		} catch (error) {
			console.error("Auth error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl text-center">
						Work Time Stamp
					</CardTitle>
					<CardDescription className="text-center">
						{isRegister ? "새 계정 만들기" : "계정에 로그인하세요"}
					</CardDescription>
				</CardHeader>

				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="email" className="text-sm font-medium">
								이메일
							</label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium">
								비밀번호
							</label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
					</CardContent>

					<CardFooter className="flex flex-col space-y-4">
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "처리 중..." : isRegister ? "가입하기" : "로그인"}
						</Button>

						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsRegister(!isRegister)}
							className="w-full"
						>
							{isRegister
								? "이미 계정이 있으신가요? 로그인"
								: "계정이 없으신가요? 가입하기"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default Login;
