"use client";

import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen justify-center items-center flex-col">
      <h2 className="text-destructive text-xl md:text-3xl mb-5">
        Something went wrong!
      </h2>

      <div className="flex items-center w-full mt-6 gap-x-3 shrink-0 sm:w-auto">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2 items-center"
        >
          <ChevronLeft className="w-4 h-4" /> Go back
        </Button>

        <Button variant="destructive" onClick={() => reset()}>
          Try again!
        </Button>
      </div>
    </div>
  );
}
