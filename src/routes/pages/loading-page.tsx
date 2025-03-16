import { Loader2 } from "lucide-react";

const LoadingPage = () => {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="flex flex-col items-center space-y-4">
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
				<h2 className="text-lg font-medium">로딩 중...</h2>
			</div>
		</div>
	);
};

export default LoadingPage;
