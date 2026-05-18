import { ErrorState } from "@/components/ErrorState"
import { toast } from "sonner"

export default function ErrorPreview() {
  return (
    <div className="py-10">
      <ErrorState
        title="Failed to load proxy list"
        message="Network request to GitHub raw.githubusercontent.com failed with status 503. We retried 3 times. Check Logs for details, then try again."
        onRetry={() => toast.success("Retrying…")}
      />
    </div>
  )
}
