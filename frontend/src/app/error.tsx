"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground text-sm">Что-то пошло не так</p>
      <button onClick={reset} className="text-sm underline">Попробовать снова</button>
    </div>
  );
}
