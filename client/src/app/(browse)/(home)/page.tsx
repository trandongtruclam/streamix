import React, { Suspense } from "react";
import { Metadata } from "next";

import { Results, ResultsSkeleton } from "./_components/results";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <div className="h-full p-6 lg:p-8">
      <Suspense fallback={<ResultsSkeleton />}>
        <Results />
      </Suspense>
    </div>
  );
}
