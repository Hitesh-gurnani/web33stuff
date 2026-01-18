"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, CircleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JSX } from "react";

export default function NotFound(): JSX.Element {
  const router = useRouter();

  return (
    <div className="bg-white">
      <div className="container flex items-center min-h-screen px-6 py-12 mx-auto">
        <div className="flex flex-col items-center max-w-sm mx-auto text-center">
          <div className="p-3 text-sm text-primary rounded-full bg-primary/10">
            <CircleAlert className="w-6 h-6" />
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-gray-800 md:text-3xl">
            Page not found
          </h1>
          <p className="mt-4 text-gray-500">
            The page you are looking for doesn&apos;t exist. Here are some
            helpful links:
          </p>

          <div className="flex items-center w-full mt-6 gap-x-3 shrink-0 sm:w-auto">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2 items-center"
            >
              <ChevronLeft className="w-4 h-4" /> Go back
            </Button>

            <Link href="/">
              <Button>Take me home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
