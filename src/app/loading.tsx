import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h2 className="text-xl font-medium">Please wait</h2>
        <p className="text-sm text-muted-foreground">
          Please wait while we load your content
        </p>
      </div>
    </div>
  );
}
