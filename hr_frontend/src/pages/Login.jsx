import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { inputClass, inputStyle, inputFocusStyle } from '../lib/theme';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [fieldFocus, setFieldFocus] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back${user?.name ? ', ' + user.name.split(' ')[0] : ''}!`);
      navigate(user?.role === 'HR' ? '/hr/dashboard' : '/candidate/browse');
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.09em] mb-1.5';

  return (
    <div className="min-h-screen flex theme-transition" style={{ backgroundColor: 'var(--c-base)' }}>
      {/* Left branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12 relative overflow-hidden theme-transition"
        style={{ backgroundColor: 'var(--c-surface)', borderRight: '1px solid var(--c-border)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.05), transparent)' }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.3), transparent)' }}
        />

        <div className="flex items-center gap-3 relative">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--c-tx1)' }}>TalentOS</span>
        </div>

        <div className="space-y-8 relative">
          <div>
            <h2 className="text-[34px] font-semibold leading-[1.15] tracking-tight" style={{ color: 'var(--c-tx1)' }}>
              Hire smarter.<br />Move faster.
            </h2>
            <p className="text-[13px] leading-relaxed mt-3 max-w-[280px]" style={{ color: 'var(--c-tx4)' }}>
              AI-powered screening and intelligent candidate ranking built for modern hiring teams.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[['10x', 'Faster screening'], ['94%', 'Match accuracy'], ['3hrs', 'Saved daily']].map(([n, l]) => (
              <div
                key={l}
                className="rounded-xl p-4 transition-all theme-transition"
                style={{ backgroundColor: 'var(--c-raised)', border: '1px solid var(--c-border)' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--c-border-strong)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--c-border)'}
              >
                <div className="text-[19px] font-bold text-indigo-500 mb-0.5 tracking-tight">{n}</div>
                <div className="text-[10px] font-medium leading-snug" style={{ color: 'var(--c-tx4)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] relative" style={{ color: 'var(--c-border-strong)' }}>© 2024 TalentOS</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[340px] animate-fade-up">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Zap size={12} className="text-white" fill="white" />
            </div>
            <span className="text-[14px] font-semibold" style={{ color: 'var(--c-tx1)' }}>TalentOS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-[23px] font-semibold tracking-tight leading-tight mb-1.5" style={{ color: 'var(--c-tx1)' }}>Sign in</h1>
            <p className="text-[13px]" style={{ color: 'var(--c-tx4)' }}>Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className={labelCls} style={{ color: 'var(--c-tx3)' }}>Email</label>
              <input
                type="email" placeholder="you@company.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFieldFocus((f) => ({ ...f, email: true }))}
                onBlur={() => setFieldFocus((f) => ({ ...f, email: false }))}
                className={inputClass}
                style={{ ...inputStyle(errors.email), ...(fieldFocus.email ? inputFocusStyle : {}) }}
              />
              {errors.email && <p className="text-[11px] text-red-500 mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className={labelCls} style={{ color: 'var(--c-tx3)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFieldFocus((f) => ({ ...f, password: true }))}
                  onBlur={() => setFieldFocus((f) => ({ ...f, password: false }))}
                  className={inputClass + ' pr-10'}
                  style={{ ...inputStyle(errors.password), ...(fieldFocus.password ? inputFocusStyle : {}) }}
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--c-tx4)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--c-tx2)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-tx4)'}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-500 mt-1.5">{errors.password}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full mt-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all duration-150 shadow-lg shadow-indigo-500/15"
            >
              {loading
                ? <><Loader2 size={13} className="animate-spin" /> Signing in…</>
                : <><span>Sign in</span><ArrowRight size={13} /></>
              }
            </button>
          </form>

          <p className="text-[12.5px] mt-6 text-center" style={{ color: 'var(--c-tx4)' }}>
            No account?{' '}
            <Link to="/register" className="text-indigo-500 hover:text-indigo-400 font-medium transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
