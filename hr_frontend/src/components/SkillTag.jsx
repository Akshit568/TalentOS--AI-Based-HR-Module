import { X } from 'lucide-react';

export default function SkillTag({ label, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-[3px] rounded-md text-[11px] font-medium transition-colors theme-transition"
      style={{
        backgroundColor: 'var(--c-raised)',
        border: '1px solid var(--c-border)',
        color: 'var(--c-tx2)',
      }}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center justify-center w-3.5 h-3.5 rounded-sm transition-colors"
          style={{ color: 'var(--c-tx4)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--c-tx2)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-tx4)'}
        >
          <X size={9} />
        </button>
      )}
    </span>
  );
}
