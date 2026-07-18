export default function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-forest/70">
      <div className="w-10 h-10 border-[3px] border-forest/20 border-t-gold rounded-full animate-spin" />
      <p className="font-mono text-sm">{label}</p>
    </div>
  );
}
