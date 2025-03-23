import { QRCodeSVG } from "qrcode.react";

interface QRCodeProps {
  url: string;
}

export function QRCode({ url }: QRCodeProps) {
  return (
    <div className="flex justify-center">
      <div className="p-4 rounded-lg">
        <QRCodeSVG value={url} size={200} />
        <p className="mt-2 text-sm text-muted-foreground">
          scan to access this list
        </p>
      </div>
    </div>
  );
}
