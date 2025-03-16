import { Link } from "@tanstack/react-router";
import { Button } from "@/shared/ui/button";

const NotFound = () => {
	return (
		<div className="flex h-screen flex-col items-center justify-center">
			<h1 className="text-4xl font-bold">404</h1>
			<p className="mb-6 mt-2 text-xl">페이지를 찾을 수 없습니다</p>
			<Button asChild>
				<Link to="/">대시보드로 돌아가기</Link>
			</Button>
		</div>
	);
};

export default NotFound;
