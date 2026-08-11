import { Loader2 } from "lucide-react";

export default function PublicLoading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Memuat...</p>
    </div>
  );
}
