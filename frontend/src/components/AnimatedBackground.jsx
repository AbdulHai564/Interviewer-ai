export default function AnimatedBackground({ dense = false }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.16),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_100%_100%,rgba(56,189,248,0.07),transparent_70%)]" />

      <div className="grid-backdrop absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_5%,transparent_72%)]" />

      <div
        className={
          dense
            ? 'absolute left-[8%] top-[-18rem] h-[30rem] w-[30rem] rounded-full bg-violet-600/10 blur-[130px]'
            : 'absolute left-[4%] top-[-16rem] h-[34rem] w-[34rem] animate-aurora rounded-full bg-violet-600/15 blur-[130px]'
        }
      />
      <div
        className={
          dense
            ? 'absolute bottom-[-20rem] right-[6%] h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-[130px]'
            : 'absolute bottom-[-18rem] right-[4%] h-[32rem] w-[32rem] animate-aurora rounded-full bg-sky-500/10 blur-[130px] [animation-delay:-6s]'
        }
      />
      <div className="absolute left-1/2 top-1/3 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-indigo-500/[0.06] blur-[120px]" />

      <div className="noise-backdrop absolute inset-0 opacity-[0.022]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}
