"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { CameraOff, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

function extractRoomCode(raw: string): string | null {
  try {
    if (raw.includes("room=")) {
      const url = new URL(raw, window.location.origin);
      const room = url.searchParams.get("room");
      if (room) return room.toUpperCase();
    }
  } catch {}
  const clean = raw.trim().toUpperCase().replace(/^(TARA|KAIN)-?/, "").replace(/[^A-Z0-9]/g, "");
  return clean.length >= 3 ? `TARA-${clean}` : null;
}

export default function QRScannerModal({ isOpen, onClose, onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;
    setError(null);

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        const detected = extractRoomCode(result.data);
        if (detected) {
          scanner.stop();
          onScan(detected);
          onClose();
        }
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 10,
      }
    );

    scanner.start().catch(() => {
      setError("Camera permission denied or camera unavailable.");
    });

    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="enamel-plate flex w-full max-w-[340px] flex-col items-center gap-3 p-5 text-center shadow-2xl"
      >
        <div className="flex w-full items-center justify-between border-b border-plate-border/60 pb-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-espresso/70">
            SCAN JEEPNEY TICKET QR
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-espresso/60 hover:bg-espresso/10 hover:text-espresso"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-plate-border bg-espresso">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center p-4 text-milk">
              <CameraOff size={32} className="mb-2 text-crimson" />
              <p className="font-mono text-xs">{error}</p>
            </div>
          ) : (
            <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          )}
        </div>

        <p className="font-mono text-xs text-espresso/80">
          Point camera at the host's QR code to hop on automatically
        </p>
      </div>
    </div>
  );
}
