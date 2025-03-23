import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface MobileCopyButtonProps {
  isCopied: boolean;
  onCopy: () => void;
}

export function MobileCopyButton({ isCopied, onCopy }: MobileCopyButtonProps) {
  return (
    <Button
      variant="default"
      onClick={onCopy}
      className="fixed bottom-6 right-6 px-4 py-2 rounded-full md:hidden flex items-center gap-2"
      title="Copy URL"
    >
      {isCopied ? (
        <>
          <Check className="h-5 w-5" />
          <span>copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-5 w-5" />
          <span>copy URL</span>
        </>
      )}
    </Button>
  );
}
