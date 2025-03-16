import { Link, useRouter } from "@tanstack/react-router";
import { Clock, BarChart2, Settings, Layers } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const Sidebar = () => {
	const router = useRouter();
	const pathname = router.state.location.pathname;

	const navItems = [
		{ name: "대시보드", href: "/", icon: Clock },
		{ name: "태스크", href: "/tasks", icon: Layers },
		{ name: "보고서", href: "/reports", icon: BarChart2 },
		{ name: "설정", href: "/settings", icon: Settings },
	];

	return (
		<div className="hidden border-r md:block md:w-64">
			<div className="flex flex-col gap-2 p-4">
				<div className="flex h-14 items-center px-2 py-4">
					<h1 className="text-xl font-bold">Work Time Stamp</h1>
				</div>

				<nav className="grid gap-1 px-2 py-4">
					{navItems.map((item) => (
						<Button
							key={item.href}
							variant={pathname === item.href ? "default" : "ghost"}
							className={cn(
								"w-full justify-start",
								pathname === item.href
									? "bg-primary text-primary-foreground"
									: "",
							)}
							asChild
						>
							<Link to={item.href}>
								<item.icon className="mr-2 h-4 w-4" />
								{item.name}
							</Link>
						</Button>
					))}
				</nav>
			</div>
		</div>
	);
};

export default Sidebar;
