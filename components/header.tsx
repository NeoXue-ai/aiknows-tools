import { Logo } from "@/components/logo";
import { HeaderNav } from "@/components/header-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="site-shell flex h-[72px] items-center gap-5 lg:h-20">
        <Logo />
        <HeaderNav />
      </div>
    </header>
  );
}
