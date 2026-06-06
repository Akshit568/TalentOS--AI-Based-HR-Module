import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Zap, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { inputClass, inputStyle, inputFocusStyle } from '../lib/theme';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [errors, setErrors] = useState({});
  const [fieldFocus, setFieldFocus] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (!form.role) e.role = 'Select a role';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created! Sign in to continue.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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

        <div className="relative">
          <h2 className="text-[34px] font-semibold leading-[1.15] tracking-tight" style={{ color: 'var(--c-tx1)' }}>
            Join TalentOS.<br />Build the future<br />of hiring.
          </h2>
          <p className="text-[13px] leading-relaxed mt-3 max-w-[280px]" style={{ color: 'var(--c-tx4)' }}>
            Create your account and start using AI tools to find, screen, and onboard top talent.
          </p>
          <div className="mt-8 space-y-3">
            {['AI resume screening & ranking', 'Automated candidate shortlisting', 'Seamless digital onboarding'].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'rgba(99,102,241,0.5)' }} />
                <span className="text-[12.5px]" style={{ color: 'var(--c-tx4)' }}>{f}</span>
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
            <h1 className="text-[23px] font-semibold tracking-tight leading-tight mb-1.5" style={{ color: 'var(--c-tx1)' }}>Create account</h1>
            <p className="text-[13px]" style={{ color: 'var(--c-tx4)' }}>Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {[
              { key: 'name',  label: 'Full Name', type: 'text',  ph: 'Jane Smith' },
              { key: 'email', label: 'Email',     type: 'email', ph: 'you@company.com' },
            ].map(({ key, label, type, ph }) => (
              <div key={key}>
                <label className={labelCls} style={{ color: 'var(--c-tx3)' }}>{label}</label>
                <input
                  type={type} placeholder={ph} value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  onFocus={() => setFieldFocus((f) => ({ ...f, [key]: true }))}
                  onBlur={() => setFieldFocus((f) => ({ ...f, [key]: false }))}
                  className={inputClass}
                  style={{ ...inputStyle(errors[key]), ...(fieldFocus[key] ? inputFocusStyle : {}) }}
                />
                {errors[key] && <p className="text-[11px] text-red-500 mt-1.5">{errors[key]}</p>}
              </div>
            ))}

            <div>
              <label className={labelCls} style={{ color: 'var(--c-tx3)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
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

            <div>
              <label className={labelCls} style={{ color: 'var(--c-tx3)' }}>Role</label>
              <div className="relative">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  onFocus={() => setFieldFocus((f) => ({ ...f, role: true }))}
                  onBlur={() => setFieldFocus((f) => ({ ...f, role: false }))}
                  className={`appearance-none ${inputClass} pr-9`}
                  style={{ ...inputStyle(errors.role), ...(fieldFocus.role ? inputFocusStyle : {}), color: form.role ? 'var(--c-tx1)' : 'var(--c-tx4)' }}
                >
                  <option value="" disabled>Select your role</option>
                  {['HR', 'Candidate', 'Interviewer'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-tx4)' }} />
              </div>
              {errors.role && <p className="text-[11px] text-red-500 mt-1.5">{errors.role}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full mt-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all duration-150 shadow-lg shadow-indigo-500/15"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-[12.5px] mt-6 text-center" style={{ color: 'var(--c-tx4)' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-500 hover:text-indigo-400 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
