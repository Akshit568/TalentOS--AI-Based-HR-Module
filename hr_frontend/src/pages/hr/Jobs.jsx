import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import TopBar from '../../components/TopBar';
import SlideOver from '../../components/SlideOver';
import SkillTag from '../../components/SkillTag';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { s, inputClass, inputStyle, inputFocusStyle, btnPrimary } from '../../lib/theme';

function JobCard({ job, onView }) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 theme-transition cursor-default"
      style={{
        backgroundColor: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--c-border-strong)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--c-border)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 theme-transition"
          style={{ backgroundColor: 'var(--c-raised)', border: '1px solid var(--c-border)' }}
        >
          <Briefcase size={14} style={{ color: 'var(--c-tx3)' }} />
        </div>
        <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--c-tx4)' }}>
          <Calendar size={10} />
          {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div>
        <h3 className="text-[13.5px] font-semibold mb-1 leading-snug" style={{ color: 'var(--c-tx1)' }}>
          {job.title}
        </h3>
        <p className="text-[12px] line-clamp-2 leading-relaxed" style={{ color: 'var(--c-tx3)' }}>
          {job.description}
        </p>
      </div>

      {job.required_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.required_skills.slice(0, 4).map((s) => <SkillTag key={s} label={s} />)}
          {job.required_skills.length > 4 && (
            <span className="text-[10px] py-1" style={{ color: 'var(--c-tx4)' }}>
              +{job.required_skills.length - 4} more
            </span>
          )}
        </div>
      )}

      <button
        onClick={() => onView(job.id)}
        className="mt-auto flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-medium transition-all theme-transition"
        style={{ border: '1px solid var(--c-border)', color: 'var(--c-tx2)', backgroundColor: 'transparent' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--c-raised)';
          e.currentTarget.style.borderColor = 'var(--c-border-strong)';
          e.currentTarget.style.color = 'var(--c-tx1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'var(--c-border)';
          e.currentTarget.style.color = 'var(--c-tx2)';
        }}
      >
        View Applications <ArrowRight size={11} />
      </button>
    </div>
  );
}

function ThemedInput({ value, onChange, placeholder, error, type = 'text', className = '' }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`${inputClass} ${className}`}
      style={{ ...inputStyle(error), ...(focused ? inputFocusStyle : {}) }}
    />
  );
}

function ThemedTextarea({ value, onChange, placeholder, error, rows = 5 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`${inputClass} resize-none`}
      style={{ ...inputStyle(error), ...(focused ? inputFocusStyle : {}) }}
    />
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', requiredSkills: [] });
  const [formErrors, setFormErrors] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [skillFocused, setSkillFocused] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (!error) setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addSkill = (raw) => {
    const v = (raw || skillInput).toString().trim();
    if (v && !form.requiredSkills.includes(v)) {
      setForm((f) => ({ ...f, requiredSkills: [...f.requiredSkills, v] }));
    }
    setSkillInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Job title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSubmitting(true);
    try {
      const { error } = await supabase.from('jobs').insert({
        title: form.title,
        description: form.description,
        required_skills: form.requiredSkills,
        created_by: user.id,
      });
      if (error) throw error;
      toast.success('Job posted!');
      setOpen(false);
      setForm({ title: '', description: '', requiredSkills: [] });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to post job');
    } finally { setSubmitting(false); }
  };

  const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.09em] mb-1.5';

  return (
    <>
      <TopBar title="Job Openings" />
      <div className="px-6 py-6 theme-transition" style={s.base}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[14px] font-semibold" style={s.tx1}>All Positions</h2>
            <p className="text-[10px] mt-0.5 uppercase tracking-wider" style={s.tx4}>
              {jobs.length} active opening{jobs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setOpen(true)} className={btnPrimary + ' gap-1.5'}>
            <Plus size={13} /> Post New Job
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" /></div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Create your first job opening to start receiving applications."
            action={
              <button onClick={() => setOpen(true)} className={btnPrimary}>
                <Plus size={13} /> Post a Job
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onView={(id) => navigate(`/hr/jobs/${id}/applications`)} />
            ))}
          </div>
        )}
      </div>

      <SlideOver open={open} onClose={() => setOpen(false)} title="Post New Job">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className={labelCls} style={s.tx3}>Job Title</label>
            <ThemedInput
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Senior Backend Engineer"
              error={formErrors.title}
            />
            {formErrors.title && <p className="text-[11px] text-red-500 mt-1.5">{formErrors.title}</p>}
          </div>

          <div>
            <label className={labelCls} style={s.tx3}>Description</label>
            <ThemedTextarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the role, responsibilities, and requirements…"
              error={formErrors.description}
            />
            {formErrors.description && <p className="text-[11px] text-red-500 mt-1.5">{formErrors.description}</p>}
          </div>

          <div>
            <label className={labelCls} style={s.tx3}>Required Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                onFocus={() => setSkillFocused(true)}
                onBlur={() => setSkillFocused(false)}
                className={`flex-1 ${inputClass}`}
                style={{ ...inputStyle(false), ...(skillFocused ? inputFocusStyle : {}) }}
              />
              <button
                type="button"
                onClick={() => addSkill()}
                className="px-3.5 py-2 rounded-lg text-[12.5px] font-medium transition-all theme-transition"
                style={{ backgroundColor: 'var(--c-raised)', border: '1px solid var(--c-border-strong)', color: 'var(--c-tx2)' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--c-tx4)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--c-border-strong)'}
              >
                Add
              </button>
            </div>
            {form.requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {form.requiredSkills.map((sk) => (
                  <SkillTag
                    key={sk} label={sk}
                    onRemove={() => setForm((f) => ({ ...f, requiredSkills: f.requiredSkills.filter((x) => x !== sk) }))}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all theme-transition"
              style={{ border: '1px solid var(--c-border-strong)', color: 'var(--c-tx2)', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-raised)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className={`flex-1 ${btnPrimary}`}>
              {submitting && <Loader2 size={13} className="animate-spin" />}
              {submitting ? 'Posting…' : 'Post Job'}
            </button>
          </div>
        </form>
      </SlideOver>
    </>
  );
}
