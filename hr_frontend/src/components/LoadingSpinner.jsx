export default function LoadingSpinner({ size = 'md' }) {
  const d = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';
  return (
    <div
      className={`${d} rounded-full animate-spin border-2`}
      style={{
        borderColor: 'var(--c-border-strong)',
        borderTopColor: '#6366f1',
      }}
    />
  );
}
