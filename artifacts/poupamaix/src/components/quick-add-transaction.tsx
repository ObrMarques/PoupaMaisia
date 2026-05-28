import { useState } from "react";
import { TransactionDialog } from "@/components/transaction-dialog";

interface QuickAddTransactionProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialType?: "expense" | "income";
  initialWalletId?: number | null;
  lockWallet?: boolean;
}

export function QuickAddTransaction({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  initialType,
  initialWalletId,
  lockWallet = false,
}: QuickAddTransactionProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);

  const open = isControlled ? controlledOpen! : internalOpen;
  const setOpen = (v: boolean) => {
    if (isControlled) controlledOnOpenChange?.(v);
    else setInternalOpen(v);
  };

  return (
    <>
      {children && (
        <div onClick={() => setOpen(true)} style={{ display: "contents" }}>
          {children}
        </div>
      )}
      <TransactionDialog
        open={open}
        onOpenChange={setOpen}
        initialType={initialType}
        initialWalletId={initialWalletId}
        lockWallet={lockWallet}
      />
    </>
  );
}
