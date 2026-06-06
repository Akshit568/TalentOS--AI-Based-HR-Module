import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-[58px] px-6 backdrop-blur-xl theme-transition"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--c-base) 85%, transparent)',
        borderBottom: '1px solid var(--c-border)',
      }}
    >
      <h1 className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--c-tx1)' }}>
        {title}
      </h1>
      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all duration-150"
        style={{ color: 'var(--c-tx4)' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-tx4)'}
      >
        <LogOut size={13} />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </header>
  );
}
