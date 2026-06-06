import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import TopBar from '../../components/TopBar';
import ScoreBar from '../../components/ScoreBar';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { supabase } from '../../lib/supabase';
import { s, tableHeadTh, tableTr, tableTd } from '../../lib/theme';

const TABS = ['All', 'Applied', 'Shortlisted', 'Rejected', 'Onboarded'];

function ActionBtn({ label, onClick, loading, variant }) {
  const styles = {
    success: { bg: 'rgba(34,197,94,0.10)', text: '#16a34a', border: 'rgba(34,197,94,0.25)', hBg: 'rgba(34,197,94,0.18)' },
    danger:  { bg: 'rgba(239,68,68,0.10)', text: '#dc2626', border: 'rgba(239,68,68,0.25)', hBg: 'rgba(239,68,68,0.18)' },
    primary: { bg: 'rgba(99,102,241,0.10)', text: '#6366f1', border: 'rgba(99,102,241,0.25)', hBg: 'rgba(99,102,241,0.18)' },
  };
  const st = styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1 px-2.5 py-[5px] rounded-md text-[11.5px] font-medium transition-all disabled:opacity-50"
      style={{ backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}` }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = st.hBg}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = st.bg}
    >
      {loading && <Loader2 size={10} className="animate-spin" />}
      {label}
    </button>
  );
}

export default function ApplicationsForJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    (async () => {
      const [{ data: jobData }, { data: appData }] = await Promise.all([
        supabase.from('jobs').select('*').eq('id', jobId).single(),
        supabase.from('applications').select('*').eq('job_id', jobId).order('ai_score', { ascending: false }),
      ]);
      setJob(jobData);
      setApps(appData || []);
      setLoading(false);
    })();
  }, [jobId]);

  const updateStatus = async (id, status) => {
    setUpdating((u) => ({ ...u, [id]: status }));
    try {
      const { error } = await supabase.from('applications').update({ status }).eq('id', id);
      if (error) throw error;
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
      toast.success(`Marked as ${status}`);
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setUpdating((u) => { const n = { ...u }; delete n[id]; return n; });
    }
  };

  const filtered = tab === 'All' ? apps : apps.filter((a) => a.status === tab);

  return (
    <>
      <TopBar title={job?.title || 'Applications'} />
      <div className="px-6 py-6 space-y-5 theme-transition" style={s.base}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/hr/jobs')}
            className="flex items-center gap-1.5 text-[12.5px] transition-colors"
            style={{ color: 'var(--c-tx4)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--c-tx1)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-tx4)'}
          >
            <ArrowLeft size={13} /> Jobs
          </button>
          {job && (
            <div>
              <h2 className="text-[14px] font-semibold" style={s.tx1}>{job.title}</h2>
              <p className="text-[10px] uppercase tracking-wider" style={s.tx4}>{apps.length} total applications</p>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div
          className="flex items-center gap-0.5 rounded-lg p-1 w-fit overflow-x-auto no-scrollbar theme-transition"
          style={{ backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-border)' }}
        >
          {TABS.map((t) => {
            const count = t === 'All' ? apps.length : apps.filter((a) => a.status === t).length;
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11.5px] font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: active ? 'rgba(99,102,241,0.10)' : 'transparent',
                  color: active ? '#6366f1' : 'var(--c-tx3)',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--c-tx1)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--c-tx3)'; }}
              >
                {t}
                <span style={{ fontSize: 10, color: active ? 'rgba(99,102,241,0.6)' : 'var(--c-tx4)' }}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl overflow-hidden theme-transition" style={s.surface}>
          {loading ? (
            <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Users} title={`No ${tab === 'All' ? '' : tab.toLowerCase() + ' '}applications`} description="No applications match this filter." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                    {['#', 'Candidate', 'Resume', 'AI Score', 'Status', 'Actions'].map((h) => (
                      <th key={h} className={tableHeadTh} style={s.tx3}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app, i) => (
                    <tr
                      key={app.id}
                      className={tableTr}
                      style={{ borderColor: 'var(--c-border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-raised)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-5 py-4 text-[11px] font-mono" style={s.tx4}>{i + 1}</td>
                      <td className={tableTd}>
                        <p className="text-[13px] font-medium" style={s.tx1}>{app.candidate_name || 'Candidate'}</p>
                        <p className="text-[11.5px]" style={s.tx4}>{app.candidate_email || ''}</p>
                      </td>
                      <td className={tableTd}>
                        {app.resume_url ? (
                          <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11.5px] text-indigo-500 hover:text-indigo-400 transition-colors">
                            View <ExternalLink size={10} />
                          </a>
                        ) : <span className="text-[11.5px]" style={s.tx4}>—</span>}
                      </td>
                      <td className="px-5 py-4 min-w-[120px]"><ScoreBar score={app.ai_score || 0} /></td>
                      <td className={tableTd}><StatusBadge status={app.status} /></td>
                      <td className={tableTd}>
                        <div className="flex items-center gap-1.5">
                          {app.status === 'Applied' && (
                            <>
                              <ActionBtn label="Shortlist" onClick={() => updateStatus(app.id, 'Shortlisted')} loading={updating[app.id] === 'Shortlisted'} variant="success" />
                              <ActionBtn label="Reject"    onClick={() => updateStatus(app.id, 'Rejected')}    loading={updating[app.id] === 'Rejected'}    variant="danger" />
                            </>
                          )}
                          {app.status === 'Shortlisted' && (
                            <>
                              <ActionBtn label="Onboard" onClick={() => updateStatus(app.id, 'Onboarded')} loading={updating[app.id] === 'Onboarded'} variant="primary" />
                              <ActionBtn label="Reject"  onClick={() => updateStatus(app.id, 'Rejected')}  loading={updating[app.id] === 'Rejected'}  variant="danger" />
                            </>
                          )}
                          {(app.status === 'Rejected' || app.status === 'Onboarded') && (
                            <span className="text-[11.5px]" style={s.tx4}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
