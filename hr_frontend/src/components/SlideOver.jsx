import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function SlideOver({ open, onClose, title, children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative ml-auto flex h-full w-full max-w-md flex-col shadow-2xl animate-slide-right theme-transition"
        style={{
          backgroundColor: 'var(--c-surface)',
          borderLeft: '1px solid var(--c-border)',
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--c-border)' }}
        >
          <h2 className="text-[13px] font-semibold" style={{ color: 'var(--c-tx1)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--c-tx4)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--c-raised)';
              e.currentTarget.style.color = 'var(--c-tx1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--c-tx4)';
            }}
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
