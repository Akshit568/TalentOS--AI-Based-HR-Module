import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import TopBar from '../../components/TopBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { s, inputClass, inputStyle, inputFocusStyle, btnPrimary } from '../../lib/theme';

const STEPS = ['Select Application', 'Bank Details', 'Review & Submit'];

function StepBar({ current }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-semibold transition-all"
                style={{
                  backgroundColor: done ? '#6366f1' : active ? 'rgba(99,102,241,0.1)' : 'var(--c-surface)',
                  borderColor: done ? '#6366f1' : active ? 'rgba(99,102,241,0.5)' : 'var(--c-border-strong)',
                  color: done ? '#fff' : active ? '#6366f1' : 'var(--c-tx4)',
                }}
              >
                {done ? <CheckCircle2 size={13} /> : i + 1}
              </div>
              <span
                className="text-[10px] font-medium whitespace-nowrap"
                style={{ color: active ? '#6366f1' : done ? 'var(--c-tx3)' : 'var(--c-tx4)' }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-16 h-px mx-3 mb-5 transition-colors"
                style={{ backgroundColor: i < current ? 'rgba(99,102,241,0.5)' : 'var(--c-border)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReviewRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.09em] shrink-0" style={s.tx4}>{label}</span>
      <span className={`text-[13px] text-right ${mono ? 'font-mono tracking-wider' : ''}`} style={s.tx1}>{value || '—'}</span>
    </div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedApp, setSelectedApp] = useState('');
  const [selectFocused, setSelectFocused] = useState(false);
  const [form, setForm] = useState({ bankAccountNumber: '', ifscCode: '', panNumber: '' });
  const [fieldFocus, setFieldFocus] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('applications')
      .select('id, status, jobs(title)')
      .eq('candidate_id', user.id)
      .eq('status', 'Onboarded')
      .then(({ data }) => setApps(data || []))
      .finally(() => setLoadingApps(false));
  }, [user?.id]);

  const goNext = () => {
    const errs = {};
    if (step === 0 && !selectedApp) errs.selectedApp = 'Select an application to continue';
    if (step === 1) {
      if (!form.bankAccountNumber.trim()) errs.bankAccountNumber = 'Bank account number is required';
      if (!form.ifscCode.trim()) errs.ifscCode = 'IFSC code is required';
      else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) errs.ifscCode = 'Invalid IFSC (e.g. SBIN0001234)';
      if (!form.panNumber.trim()) errs.panNumber = 'PAN number is required';
      else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.panNumber)) errs.panNumber = 'Invalid PAN (e.g. ABCDE1234F)';
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('onboarding_details').insert({
        application_id: selectedApp,
        bank_account_number: form.bankAccountNumber,
        ifsc_code: form.ifscCode,
        pan_number: form.panNumber,
      });
      if (error) throw error;
      setDone(true);
      toast.success('Onboarding complete!');
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const appData = apps.find((a) => a.id === selectedApp);

  const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.09em] mb-1.5';

  if (done) {
    return (
      <>
        <TopBar title="Onboarding" />
        <div className="flex flex-col items-center justify-center py-24 px-6 theme-transition" style={s.base}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '2px solid rgba(34,197,94,0.3)' }}
          >
            <CheckCircle2 size={28} style={{ color: '#16a34a' }} />
          </div>
          <h2 className="text-[20px] font-semibold mb-2" style={s.tx1}>Onboarding Complete!</h2>
          <p className="text-[13px] text-center max-w-sm" style={s.tx3}>
            Your details have been submitted. HR will reach out with next steps. Welcome to the team!
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Onboarding" />
      <div className="px-6 py-6 max-w-2xl theme-transition" style={s.base}>
        <div className="mb-8">
          <h2 className="text-[14px] font-semibold mb-1" style={s.tx1}>Complete Your Onboarding</h2>
          <p className="text-[12px]" style={s.tx3}>Provide your bank and tax details to complete the hiring process.</p>
        </div>

        <div className="flex justify-center mb-8"><StepBar current={step} /></div>

        <div className="rounded-xl p-6 theme-transition" style={s.surface}>
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[13.5px] font-semibold mb-1" style={s.tx1}>Select Application</h3>
                <p className="text-[12px]" style={s.tx3}>Choose the position you were onboarded for.</p>
              </div>
              {loadingApps ? (
                <div className="flex items-center gap-2 text-[12.5px] py-4" style={s.tx3}>
                  <LoadingSpinner size="sm" /> Loading…
                </div>
              ) : apps.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[13px]" style={s.tx3}>No onboarded applications found.</p>
                  <p className="text-[11.5px] mt-1" style={s.tx4}>HR must mark you as Onboarded before you can complete this step.</p>
                </div>
              ) : (
                <div>
                  <label className={labelCls} style={s.tx3}>Application</label>
                  <select
                    value={selectedApp}
                    onChange={(e) => setSelectedApp(e.target.value)}
                    onFocus={() => setSelectFocused(true)}
                    onBlur={() => setSelectFocused(false)}
                    className={`appearance-none ${inputClass}`}
                    style={{ ...inputStyle(errors.selectedApp), ...(selectFocused ? inputFocusStyle : {}) }}
                  >
                    <option value="">Select a position</option>
                    {apps.map((a) => <option key={a.id} value={a.id}>{a.jobs?.title || a.id}</option>)}
                  </select>
                  {errors.selectedApp && <p className="text-[11px] text-red-500 mt-1.5">{errors.selectedApp}</p>}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[13.5px] font-semibold mb-1" style={s.tx1}>Bank Details</h3>
                <p className="text-[12px]" style={s.tx3}>Used for payroll setup. All information is encrypted.</p>
              </div>
              {[
                { key: 'bankAccountNumber', label: 'Bank Account Number', ph: 'e.g. 123456789012' },
                { key: 'ifscCode',          label: 'IFSC Code',           ph: 'e.g. SBIN0001234' },
                { key: 'panNumber',         label: 'PAN Number',          ph: 'e.g. ABCDE1234F' },
              ].map(({ key, label, ph }) => (
                <div key={key}>
                  <label className={labelCls} style={s.tx3}>{label}</label>
                  <input
                    type="text"
                    placeholder={ph}
                    value={form[key]}
                    onChange={(e) => {
                      const v = (key === 'panNumber' || key === 'ifscCode') ? e.target.value.toUpperCase() : e.target.value;
                      setForm({ ...form, [key]: v });
                    }}
                    onFocus={() => setFieldFocus((f) => ({ ...f, [key]: true }))}
                    onBlur={() => setFieldFocus((f) => ({ ...f, [key]: false }))}
                    className={`${inputClass} font-mono tracking-wide`}
                    style={{ ...inputStyle(errors[key]), ...(fieldFocus[key] ? inputFocusStyle : {}) }}
                  />
                  {errors[key] && <p className="text-[11px] text-red-500 mt-1.5">{errors[key]}</p>}
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-4">
                <h3 className="text-[13.5px] font-semibold mb-1" style={s.tx1}>Review Your Details</h3>
                <p className="text-[12px]" style={s.tx3}>Please verify everything is correct before submitting.</p>
              </div>
              <ReviewRow label="Position"     value={appData?.jobs?.title || selectedApp} />
              <ReviewRow label="Bank Account" value={form.bankAccountNumber} mono />
              <ReviewRow label="IFSC Code"    value={form.ifscCode} mono />
              <ReviewRow label="PAN Number"   value={form.panNumber} mono />
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all theme-transition"
                style={{ border: '1px solid var(--c-border-strong)', color: 'var(--c-tx2)', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-raised)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button
              onClick={step < 2 ? goNext : handleSubmit}
              disabled={submitting}
              className={`flex-1 ${btnPrimary}`}
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              {step < 2
                ? <><span>Continue</span><ChevronRight size={14} /></>
                : submitting ? 'Submitting…' : 'Submit Onboarding'
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
