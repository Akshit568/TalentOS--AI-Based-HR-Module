import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, CheckCircle, Clock, ArrowRight, Layers } from 'lucide-react';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import ScoreBar from '../../components/ScoreBar';
import StatusBadge from '../../components/StatusBadge';
import SkillTag from '../../components/SkillTag';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { supabase } from '../../lib/supabase';
import { s, tableHeadTh, tableTr, tableTd } from '../../lib/theme';

export default function Dashboard() {
  const [stats, setStats] = useState({ jobs: 0, total: 0, shortlisted: 0, pending: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [{ count: jobCount }, { data: apps }, { data: jobs }] = await Promise.all([
          supabase.from('jobs').select('id', { count: 'exact', head: true }),
          supabase
            .from('applications')
            .select('id, candidate_name, ai_score, status, job_id, jobs(id, title)')
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('jobs')
            .select('id, title, required_skills, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
        ]);
        const appList = apps || [];
        setStats({
          jobs:        jobCount || 0,
          total:       appList.length,
          shortlisted: appList.filter((a) => a.status === 'Shortlisted').length,
          pending:     appList.filter((a) => a.status === 'Applied').length,
        });
        setRecentApps(appList);
        setActiveJobs(jobs || []);
      } catch { /* silently ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="px-6 py-6 space-y-6 theme-transition" style={s.base}>

        {/* Stats row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Jobs Posted"        value={loading ? '…' : stats.jobs}        icon={Briefcase} />
          <StatCard label="Total Applications" value={loading ? '…' : stats.total}       icon={Users} />
          <StatCard label="Shortlisted"        value={loading ? '…' : stats.shortlisted} icon={CheckCircle} />
          <StatCard label="Pending Review"     value={loading ? '…' : stats.pending}     icon={Clock} />
        </div>

        {/* Two-column layout: recent apps + active jobs */}
        <div className="flex gap-5 items-start">

          {/* Recent Applications — flex-1 */}
          <div className="flex-1 min-w-0 rounded-xl overflow-hidden theme-transition" style={s.surface}>
            <div className="flex items-center justify-between px-5 py-4" style={s.divider}>
              <h2 className="text-[13px] font-semibold" style={s.tx1}>Recent Applications</h2>
              <button
                onClick={() => navigate('/hr/jobs')}
                className="flex items-center gap-1 text-[11.5px] transition-opacity"
                style={{ color: '#6366f1' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                View jobs <ArrowRight size={11} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16"><LoadingSpinner /></div>
            ) : recentApps.length === 0 ? (
              <EmptyState icon={Users} title="No applications yet" description="Applications will appear here once candidates apply." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                      {['Candidate', 'Job Title', 'Score', 'Status', 'Action'].map((h) => (
                        <th key={h} className={tableHeadTh} style={s.tx3}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentApps.map((app) => (
                      <tr
                        key={app.id}
                        className={tableTr}
                        style={{ borderColor: 'var(--c-border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-raised)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className={tableTd} style={s.tx1}>{app.candidate_name || 'Candidate'}</td>
                        <td className={tableTd} style={s.tx3}>{app.jobs?.title || '—'}</td>
                        <td className="px-5 py-4 min-w-[120px]"><ScoreBar score={app.ai_score || 0} /></td>
                        <td className={tableTd}><StatusBadge status={app.status} /></td>
                        <td className={tableTd}>
                          <button
                            onClick={() => navigate(`/hr/jobs/${app.jobs?.id || app.job_id}/applications`)}
                            className="flex items-center gap-1 text-[11.5px] transition-opacity"
                            style={{ color: '#6366f1' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            View <ArrowRight size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Jobs side panel — fixed 280px */}
          <div className="w-[280px] shrink-0 rounded-xl overflow-hidden theme-transition" style={s.surface}>
            <div className="flex items-center justify-between px-5 py-4" style={s.divider}>
              <h2 className="text-[13px] font-semibold" style={s.tx1}>Active Jobs</h2>
              <button
                onClick={() => navigate('/hr/jobs')}
                className="text-[11px] transition-opacity"
                style={{ color: '#6366f1' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                See all
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
            ) : activeJobs.length === 0 ? (
              <EmptyState icon={Briefcase} title="No jobs posted" description="Post your first job to get started." />
            ) : (
              <ul>
                {activeJobs.map((job, i) => (
                  <li
                    key={job.id}
                    className="px-5 py-3.5 cursor-pointer transition-colors"
                    style={{ borderTop: i > 0 ? '1px solid var(--c-border)' : 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-raised)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => navigate(`/hr/jobs/${job.id}/applications`)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-[12.5px] font-medium leading-snug" style={s.tx1}>{job.title}</p>
                      <ArrowRight size={11} style={s.tx4} className="mt-0.5 shrink-0" />
                    </div>
                    {job.required_skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.required_skills.slice(0, 2).map((sk) => (
                          <SkillTag key={sk} label={sk} />
                        ))}
                        {job.required_skills.length > 2 && (
                          <span className="text-[10px] py-[3px]" style={s.tx4}>
                            +{job.required_skills.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] mt-1.5" style={s.tx4}>
                      {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="px-5 py-3" style={{ borderTop: '1px solid var(--c-border)' }}>
              <button
                onClick={() => navigate('/hr/jobs')}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium transition-all"
                style={{
                  color: '#6366f1',
                  backgroundColor: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.15)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.06)'}
              >
                <Layers size={12} /> Manage Jobs
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
