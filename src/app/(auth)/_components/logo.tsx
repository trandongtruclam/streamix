import Image from "next/image";
import { Inter } from "next/font/google";

import { cn } from "@/lib/utils";

const font = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function Logo() {
  return (
    <div className="flex flex-col items-center gap-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-[#9147ff] rounded-2xl opacity-30 blur-xl scale-150" />
        <div className="relative bg-[#18181b] rounded-2xl p-4 border border-[#35353b]">
          <Image src="/streamix.svg" alt="Streamix" height={64} width={64} />
        </div>
      </div>
      <div className={cn("flex flex-col items-center", font.className)}>
        <h1 className="text-2xl font-bold text-white">Streamix</h1>
        <p className="text-sm text-[#adadb8]">Join millions of viewers today</p>
      </div>
    </div>
  );
}
