import { Suspense } from "react";
import MensajesContent from "@/components/MensajesContent";

export default function MensajesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-[var(--color-text-muted)] pixel-title text-[10px]">
            Abriendo las puertas del castillo...
          </p>
        </div>
      }
    >
      <MensajesContent />
    </Suspense>
  );
}
