export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div
      className="group relative rounded-xl p-5 flex flex-col gap-3.5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 theme-transition"
      style={{
        backgroundColor: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--c-border-strong)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--c-border)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: 'var(--c-tx3)' }}
        >
          {label}
        </span>
        {Icon && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--c-raised)', border: '1px solid var(--c-border)' }}
          >
            <Icon size={13} style={{ color: 'var(--c-tx3)' }} />
          </div>
        )}
      </div>
      <span
        className="text-[30px] font-semibold tabular-nums leading-none tracking-tight"
        style={{ color: 'var(--c-tx1)' }}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}
