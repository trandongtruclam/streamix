import React from "react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#0e0e10]">
      <div className="flex flex-col items-center space-y-6 text-center px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-[#9147ff] rounded-full opacity-20 blur-3xl scale-150" />
          <div className="relative bg-[#18181b] rounded-2xl p-6 border border-[#35353b]">
            <Image src="/streamix.svg" alt="Streamix" height={80} width={80} />
          </div>
        </div>
        <div>
          <h1 className="text-7xl font-bold text-[#9147ff] mb-2">404</h1>
          <p className="text-xl text-white font-medium mb-2">Page Not Found</p>
          <p className="text-[#adadb8] max-w-md">
            We couldn&apos;t find the page you were looking for. It might have been moved or deleted.
          </p>
        </div>
        <Button 
          asChild
          className="bg-[#9147ff] hover:bg-[#772ce8] text-white font-semibold px-6"
        >
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
