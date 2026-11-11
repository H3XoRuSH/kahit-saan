"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

interface Props {
  url: string;
  size?: number;
}

export default function JeepneyQRCode({ url, size = 210 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling({
        width: size,
        height: size,
        type: "svg",
        data: url,
        image: "/icons/main-menu-icon.png",
        dotsOptions: {
          color: "#1C160E",
          type: "rounded",
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#0F766E",
        },
        cornersDotOptions: {
          type: "dot",
          color: "#E59F00",
        },
        backgroundOptions: {
          color: "#FDFBF7",
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.28,
          margin: 3,
        },
      });
    } else {
      qrRef.current.update({ data: url, width: size, height: size });
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      qrRef.current.append(containerRef.current);
    }
  }, [url, size]);

  return <div ref={containerRef} className="flex items-center justify-center" />;
}
