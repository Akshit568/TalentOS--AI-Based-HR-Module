import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Zap, Sun, Moon, LogOut } from 'lucide-react';

export default function Sidebar({ links }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[232px] flex flex-col z-40 theme-transition"
      style={{
        backgroundColor: 'var(--c-surface)',
        borderRight: '1px solid var(--c-border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 h-[58px] shrink-0"
        style={{ borderBottom: '1px solid var(--c-border)' }}
      >
        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/25">
          <Zap size={13} className="text-white" fill="white" />
        </div>
        <span className="text-[14.5px] font-semibold tracking-tight" style={{ color: 'var(--c-tx1)' }}>
          TalentOS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto no-scrollbar">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2.5 mb-3"
          style={{ color: 'var(--c-tx4)' }}
        >
          {user?.role === 'HR' ? 'HR Tools' : 'My Portal'}
        </p>
        <div className="space-y-0.5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive ? 'bg-indigo-500/[0.11]' : ''
                }`
              }
              style={({ isActive }) =>
                isActive ? { color: '#6366f1' } : { color: 'var(--c-tx3)' }
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={14}
                    className="shrink-0 transition-colors"
                    style={isActive ? { color: '#6366f1' } : { color: 'var(--c-tx4)' }}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div
        className="px-3 pb-3 pt-2 shrink-0 space-y-1"
        style={{ borderTop: '1px solid var(--c-border)' }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium transition-all duration-150"
          style={{ color: 'var(--c-tx3)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--c-raised)';
            e.currentTarget.style.color = 'var(--c-tx2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--c-tx3)';
          }}
        >
          {theme === 'dark'
            ? <Sun size={14} style={{ color: 'var(--c-tx4)' }} />
            : <Moon size={14} style={{ color: 'var(--c-tx4)' }} />
          }
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        {/* User row */}
        <div
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg"
          style={{ borderTop: '1px solid var(--c-border)', paddingTop: '8px', marginTop: '4px' }}
        >
          <div className="w-7 h-7 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold" style={{ color: '#6366f1' }}>{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium truncate leading-tight" style={{ color: 'var(--c-tx2)' }}>
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[10px] truncate leading-tight mt-0.5" style={{ color: 'var(--c-tx4)' }}>
              {user?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-6 h-6 flex items-center justify-center rounded-md transition-all shrink-0"
            style={{ color: 'var(--c-tx4)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--c-tx4)';
            }}
            title="Sign out"
          >
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}
