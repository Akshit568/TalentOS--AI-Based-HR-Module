// Shared inline style helpers for themed components.
// Avoids repeating CSS var strings across every page.

export const s = {
  base:    { backgroundColor: 'var(--c-base)' },
  surface: { backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-border)' },
  raised:  { backgroundColor: 'var(--c-raised)', border: '1px solid var(--c-border)' },
  tx1:     { color: 'var(--c-tx1)' },
  tx2:     { color: 'var(--c-tx2)' },
  tx3:     { color: 'var(--c-tx3)' },
  tx4:     { color: 'var(--c-tx4)' },
  border:  { border: '1px solid var(--c-border)' },
  divider: { borderBottom: '1px solid var(--c-border)' },
};

export const inputStyle = (hasError) => ({
  backgroundColor: 'var(--c-raised)',
  border: `1px solid ${hasError ? 'rgba(239,68,68,0.6)' : 'var(--c-border-strong)'}`,
  color: 'var(--c-tx1)',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
});

export const inputFocusStyle = {
  borderColor: 'rgba(99,102,241,0.6)',
  boxShadow: '0 0 0 3px rgba(99,102,241,0.08)',
};

export const inputClass = 'rounded-lg px-3.5 py-2.5 text-[13px] w-full placeholder:text-[var(--c-tx4)] transition-all duration-150';

export const btnPrimary = 'flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all duration-150 shadow-md shadow-indigo-500/15';

export const btnSecondary = (extra = '') =>
  `flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all duration-150 ${extra}`;

export const tableHeadTh = 'px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em]';
export const tableTr     = 'border-b last:border-0 transition-colors';
export const tableTd     = 'px-5 py-4 text-[13px]';
