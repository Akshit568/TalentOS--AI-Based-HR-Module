export default function ScoreBar({ score }) {
  const pct = Math.min(Math.max(score || 0, 0), 100);
  const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2.5 min-w-[100px]">
      <div
        className="flex-1 h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--c-raised)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 4px ${color}50` }}
        />
      </div>
      <span
        className="text-[11px] font-semibold tabular-nums w-6 text-right shrink-0"
        style={{ color }}
      >
        {pct}
      </span>
    </div>
  );
}
