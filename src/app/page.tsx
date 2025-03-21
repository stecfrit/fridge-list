import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <main className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">fridge list</h1>
          <p className="text-muted-foreground">
            create and manage your household shopping lists with QR codes
          </p>
        </div>

        <div className="flex justify-center">
          <Link href="/create-list">
            <Button size="lg" className="w-full sm:w-auto">
              create new list
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
