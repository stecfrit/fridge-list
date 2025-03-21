import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Fridge List</h1>
          <p className="text-muted-foreground">
            Create and manage your household shopping lists with QR codes
          </p>
        </div>

        <div className="flex justify-center">
          <Link href="/create-list">
            <Button size="lg" className="w-full sm:w-auto">
              Create New List
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
