import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";

import { cn } from "@/lib/utils";

const font = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function Logo() {
  return (
    <Link href="/">
      <div className="flex items-center gap-x-3 hover:opacity-80 transition-opacity duration-200">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#9147ff] rounded-lg opacity-20 blur-sm" />
          <Image 
            src="/streamix.svg" 
            alt="Streamix" 
            height={28} 
            width={28}
            className="relative z-10"
          />
        </div>
        <div className={cn(font.className, "hidden lg:block")}>
          <p className="text-lg font-bold text-white tracking-tight">
            Streamix
          </p>
        </div>
      </div>
    </Link>
  );
}
