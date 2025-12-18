export async function Sidebar() {
  return (
    <>
      <h2>Sidebar</h2>
      <p>Sidebar right here!!</p>
    </>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="fixed left-0 flex flex-col w-[70px] lg:w-60 h-full bg-background border-r border-[#2D2E35 z-50]">
      <h2>Sidebar is loading</h2>
    </div>
  );
}
