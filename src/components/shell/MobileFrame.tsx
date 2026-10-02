/** Phone-shaped frame on desktop, edge-to-edge on mobile. */
export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center md:py-6">
      <div className="ambient" aria-hidden />
      <div
        id="phone-frame"
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-ink-900 md:h-[min(920px,calc(100dvh-48px))] md:w-[420px] md:rounded-[46px] md:shadow-frame"
      >
        <div className="frame-glow" aria-hidden />
        {children}
        <div id="frame-portal" className="pointer-events-none absolute inset-0 z-50" />
      </div>
    </div>
  );
}
