import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#0e0e10] border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      {/* Left: Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src="/logo.svg" alt="logo" className="w-8 h-8" />
        <h1 className="text-xl font-bold text-white">StreamVerse</h1>
      </div>

      {/* Middle: Search bar */}
      <div className="hidden md:flex flex-1 justify-center px-8">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm kênh, game, hoặc streamer..."
            className="w-full bg-[#18181b] text-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Right: Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="text-gray-300 hover:text-white hover:bg-[#1f1f23]"
          onClick={() => navigate("/auth")}
        >
          Đăng nhập
        </Button>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white px-5"
          onClick={() => navigate("/auth")}
        >
          Đăng ký
        </Button>
      </div>
    </header>
  );
}
