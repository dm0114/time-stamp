import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useAuth } from "@/shared/hooks/useAuth";
import { useTheme } from "@/app/providers/theme-provider";
import { Sun, Moon } from "lucide-react";

const Header = () => {
	const { user, signOut } = useAuth();
	const { theme, setTheme } = useTheme();

	return (
		<header className="border-b">
			<div className="flex h-16 items-center px-4">
				<div className="flex-1">
					<h1 className="text-xl font-semibold md:hidden">Work Time Stamp</h1>
				</div>

				<div className="flex items-center space-x-4">
					{/* 테마 토글 버튼 */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
					>
						{theme === "dark" ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						)}
						<span className="sr-only">테마 전환</span>
					</Button>

					{/* 사용자 메뉴 */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-8 w-8 rounded-full">
								<Avatar>
									<AvatarFallback>
										{user?.email?.charAt(0).toUpperCase() || "U"}
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">내 계정</p>
									<p className="text-xs leading-none text-muted-foreground">
										{user?.email}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<a href="/settings">설정</a>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => signOut()}>
								로그아웃
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
};

export default Header;
