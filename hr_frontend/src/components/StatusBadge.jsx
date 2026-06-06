const STATUS = {
  Applied:     { dot: 'rgba(99,102,241,0.7)',   bg: 'rgba(99,102,241,0.08)',  text: '#6366f1', border: 'rgba(99,102,241,0.18)' },
  Shortlisted: { dot: 'rgba(245,158,11,0.7)',   bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.18)' },
  Onboarded:   { dot: 'rgba(34,197,94,0.7)',    bg: 'rgba(34,197,94,0.08)',  text: '#16a34a', border: 'rgba(34,197,94,0.18)'  },
  Rejected:    { dot: 'rgba(239,68,68,0.7)',    bg: 'rgba(239,68,68,0.08)',  text: '#dc2626', border: 'rgba(239,68,68,0.18)'  },
  Created:     { dot: 'rgba(59,130,246,0.7)',   bg: 'rgba(59,130,246,0.08)', text: '#2563eb', border: 'rgba(59,130,246,0.18)' },
  Skipped:     { dot: 'rgba(161,161,170,0.5)',  bg: 'rgba(161,161,170,0.07)',text: 'var(--c-tx3)', border: 'var(--c-border)' },
  Failed:      { dot: 'rgba(239,68,68,0.7)',    bg: 'rgba(239,68,68,0.08)',  text: '#dc2626', border: 'rgba(239,68,68,0.18)'  },
};

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { dot: 'var(--c-tx4)', bg: 'var(--c-raised)', text: 'var(--c-tx3)', border: 'var(--c-border)' };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md text-[11px] font-medium"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {status}
    </span>
  );
}
