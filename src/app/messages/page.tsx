import { Suspense } from "react";
import MessagesContent from "@/components/MessagesContent";

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-[var(--color-text-muted)] font-[family-name:var(--font-family-gothic)]">
            Opening the castle gates...
          </p>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
