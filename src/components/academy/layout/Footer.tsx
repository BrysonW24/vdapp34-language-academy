import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative z-[1] mx-[18px] mb-[18px] mt-8 rounded-[18px] border border-[rgba(44,49,59,0.08)] bg-[rgba(255,252,247,0.78)] backdrop-blur-[16px] py-5">
      <div className="container flex flex-col items-center gap-3 text-center text-sm text-editorial-muted sm:flex-row sm:justify-between sm:text-left">
        <p className="font-serif">Language Academy</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.14em] text-editorial-muted">Built by</span>
          <span className="grid h-5 w-5 place-items-center overflow-hidden rounded-md border border-black/5 bg-white shadow-sm">
            <Image src="/brand/vivacity-logo-classic.png" alt="Vivacity.ai" width={16} height={16} />
          </span>
          <span className="text-[11px] font-semibold text-editorial-ink">Vivacity.ai</span>
        </div>
      </div>
    </footer>
  )
}
