export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {Icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 theme-transition"
          style={{
            backgroundColor: 'var(--c-raised)',
            border: '1px solid var(--c-border)',
          }}
        >
          <Icon size={16} style={{ color: 'var(--c-tx4)' }} />
        </div>
      )}
      <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--c-tx3)' }}>{title}</p>
      {description && (
        <p className="text-[11.5px] max-w-xs leading-relaxed" style={{ color: 'var(--c-tx4)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
