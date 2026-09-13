export function AuthLogo() {
  return (
    <div className="flex items-center gap-3 text-white">
      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/40 bg-white/10 shadow-[0_8px_18px_rgba(255,255,255,0.15)]">
        <span className="absolute left-1.5 top-1.5 h-4 w-4 rounded-full bg-white" />
        <span className="absolute right-1.5 bottom-1.5 h-4 w-4 rounded-full bg-[#72d1ff]" />
      </div>
      <span className="text-[1.7rem] font-semibold tracking-[-0.05em] text-white">Coinbit</span>
    </div>
  );
}
