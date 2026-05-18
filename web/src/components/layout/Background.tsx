export function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "hsl(var(--bg-base))" }}
    >
      {/* Aurora gradients */}
      <div
        className="absolute -top-40 -left-40 h-[60vmin] w-[60vmin] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(217 91% 60% / 0.25), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-[70vmin] w-[70vmin] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(270 91% 65% / 0.22), transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 right-1/4 h-[40vmin] w-[40vmin] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(187 95% 50% / 0.16), transparent 70%)",
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(0 0% 100% / 0.04) 1px, transparent 1px), linear-gradient(to bottom, hsl(0 0% 100% / 0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      {/* Noise */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.025] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="bg-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#bg-noise)" />
      </svg>
    </div>
  )
}
