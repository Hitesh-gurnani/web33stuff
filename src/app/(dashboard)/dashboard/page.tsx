export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 dark:bg-muted/30 aspect-video rounded-xl border border-border/50 dark:border-border/30" />
        <div className="bg-muted/50 dark:bg-muted/30 aspect-video rounded-xl border border-border/50 dark:border-border/30" />
        <div className="bg-muted/50 dark:bg-muted/30 aspect-video rounded-xl border border-border/50 dark:border-border/30" />
      </div>
      <div className="bg-muted/50 dark:bg-muted/30 min-h-[100vh] flex-1 rounded-xl md:min-h-min border border-border/50 dark:border-border/30" />
    </div>
  );
}
