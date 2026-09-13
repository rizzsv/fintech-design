export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0b59d3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.12),transparent_30%)]" />
      <div className="absolute inset-y-0 left-[-8%] w-[58%] bg-[#0b59d3]" />
      <div className="absolute inset-y-0 right-[-12%] w-[52%] bg-[#f3f3f3]" />
      <div className="absolute right-[-14%] top-[-8%] h-[120%] w-[28%] rotate-[-18deg] bg-[#0b59d3]" />
      <div className="absolute bottom-[-16%] left-[14%] h-48 w-48 rounded-full bg-[#0c4bb8]/20 blur-3xl" />
      <div className="absolute top-[12%] right-[8%] h-28 w-28 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
}
