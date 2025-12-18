import React from "react";

import { Logo } from "./logo";
import { Actions } from "./actions";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full h-[50px] z-50 bg-[#18181b] border-b border-[#2f2f35] px-4 flex justify-between items-center">
      <Logo />
      <Actions />
    </nav>
  );
}
