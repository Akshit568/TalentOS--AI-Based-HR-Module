import { useEffect, useState } from 'react';
import { Briefcase, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import TopBar from '../../components/TopBar';
import SkillTag from '../../components/SkillTag';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { s, btnPrimary } from '../../lib/theme';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState({});
  const [applied, setApplied] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      supabase.from('jobs').select('*').order('created_at', { ascending: false }),
      supabase.from('applications').select('job_id').eq('candidate_id', user.id),
    ]).then(([{ data: jobsData }, { data: appsData }]) => {
      setJobs(jobsData || []);
      setApplied(new Set((appsData || []).map((a) => a.job_id)));
    }).catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleApply = async (job) => {
    setApplying((s) => ({ ...s, [job.id]: true }));
    try {
      const aiScore = Math.floor(Math.random() * 40) + 50;
      const { error } = await supabase.from('applications').insert({
        job_id: job.id,
        candidate_id: user.id,
        candidate_name: user.name || user.email,
        candidate_email: user.email,
        ai_score: aiScore,
        status: 'Applied',
      });
      if (error) throw error;
      setApplied((s) => new Set([...s, job.id]));
      toast.success(`Applied to ${job.title}!`);
    } catch (err) {
      if (err.code === '23505') {
        toast.error('You already applied to this job');
        setApplied((s) => new Set([...s, job.id]));
      } else {
        toast.error(err.message || 'Failed to apply');
      }
    } finally {
      setApplying((prev) => { const n = { ...prev }; delete n[job.id]; return n; });
    }
  };

  return (
    <>
      <TopBar title="Browse Jobs" />
      <div className="px-6 py-6 theme-transition" style={s.base}>
        <div className="mb-6">
          <h2 className="text-[14px] font-semibold" style={s.tx1}>Open Positions</h2>
          <p className="text-[10px] mt-0.5 uppercase tracking-wider" style={s.tx4}>
            {jobs.length} opening{jobs.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" /></div>
        ) : jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No open positions" description="Check back later for new job openings." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobs.map((job) => {
              const isApplied = applied.has(job.id);
              const isApplying = applying[job.id];
              return (
                <div
                  key={job.id}
                  className="rounded-xl p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 theme-transition"
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
                    <h3 className="text-[13.5px] font-semibold mb-1 leading-snug" style={s.tx1}>{job.title}</h3>
                    <p className="text-[12px] line-clamp-3 leading-relaxed" style={s.tx3}>{job.description}</p>
                  </div>

                  {job.required_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.required_skills.slice(0, 4).map((sk) => <SkillTag key={sk} label={sk} />)}
                      {job.required_skills.length > 4 && (
                        <span className="text-[10px] py-1" style={{ color: 'var(--c-tx4)' }}>
                          +{job.required_skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => !isApplied && handleApply(job)}
                    disabled={isApplied || isApplying}
                    className="mt-auto flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-medium transition-all duration-150"
                    style={isApplied ? {
                      backgroundColor: 'rgba(34,197,94,0.08)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      color: '#16a34a',
                      cursor: 'default',
                    } : {
                      backgroundColor: '#6366f1',
                      color: '#fff',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(99,102,241,0.2)',
                    }}
                    onMouseEnter={(e) => { if (!isApplied) e.currentTarget.style.backgroundColor = '#818cf8'; }}
                    onMouseLeave={(e) => { if (!isApplied) e.currentTarget.style.backgroundColor = '#6366f1'; }}
                  >
                    {isApplying && <Loader2 size={12} className="animate-spin" />}
                    {isApplied ? 'Applied' : isApplying ? 'Applying…' : 'Apply Now'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
