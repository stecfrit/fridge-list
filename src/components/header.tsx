import Link from "next/link";
import { Scroll } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Scroll className="h-6 w-6" />
          <span>fridge list</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
