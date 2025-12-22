import React from "react";

import { Logo } from "./logo";
import { Search } from "./search";
import { Actions } from "./actions";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full h-[50px] z-50 bg-[#18181b]/95 backdrop-blur-sm border-b border-[#2f2f35] shadow-lg">
      <div className="h-full px-4 flex justify-between items-center max-w-[1920px] mx-auto">
        <Logo />
        <Search />
        <Actions />
      </div>
    </nav>
  );
}
