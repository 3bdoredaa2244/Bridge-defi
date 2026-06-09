import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TxStatus } from "@/types/transaction";

const CONFIG: Record<
  TxStatus,
  { label: string; variant: "success" | "warning" | "destructive"; Icon: typeof Clock }
> = {
  pending: { label: "Pending", variant: "warning", Icon: Clock },
  confirmed: { label: "Confirmed", variant: "success", Icon: CheckCircle2 },
  failed: { label: "Failed", variant: "destructive", Icon: XCircle },
};

export function StatusBadge({ status }: { status: TxStatus }) {
  const { label, variant, Icon } = CONFIG[status];
  return (
    <Badge variant={variant}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
