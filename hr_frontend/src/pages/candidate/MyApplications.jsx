import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Video, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import TopBar from '../../components/TopBar';
import ScoreBar from '../../components/ScoreBar';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { s, tableHeadTh, tableTr, tableTd, btnPrimary } from '../../lib/theme';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('applications')
      .select('*, jobs(title)')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { toast.error('Failed to load applications'); return; }
        setApps(data || []);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <>
      <TopBar title="My Applications" />
      <div className="px-6 py-6 theme-transition" style={s.base}>
        <div className="mb-6">
          <h2 className="text-[14px] font-semibold" style={s.tx1}>Applications</h2>
          <p className="text-[10px] mt-0.5 uppercase tracking-wider" style={s.tx4}>
            {apps.length} application{apps.length !== 1 ? 's' : ''} tracked
          </p>
        </div>

        <div className="rounded-xl overflow-hidden theme-transition" style={s.surface}>
          {loading ? (
            <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
          ) : apps.length === 0 ? (
            <EmptyState
              icon={List}
              title="No applications yet"
              description="Browse open jobs and apply to positions that interest you."
              action={
                <button onClick={() => navigate('/candidate/browse')} className={btnPrimary}>
                  Browse Jobs
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                    {['Job Title', 'Applied Date', 'AI Score', 'Status', 'Actions'].map((h) => (
                      <th key={h} className={tableHeadTh} style={s.tx3}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app) => (
                    <tr
                      key={app.id}
                      className={tableTr}
                      style={{ borderColor: 'var(--c-border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-raised)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className={`${tableTd} font-medium`} style={s.tx1}>
                        {app.jobs?.title || 'Position'}
                      </td>
                      <td className={tableTd + ' tabular-nums'} style={s.tx4}>
                        {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 min-w-[120px]"><ScoreBar score={app.ai_score || 0} /></td>
                      <td className={tableTd}><StatusBadge status={app.status} /></td>
                      <td className={tableTd}>
                        <div className="flex items-center gap-2">
                          {(app.status === 'Applied' || app.status === 'Shortlisted') && (
                            <button
                              onClick={() => navigate(`/candidate/upload-video/${app.id}`)}
                              className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-md text-[11.5px] font-medium transition-all"
                              style={{
                                backgroundColor: 'rgba(99,102,241,0.08)',
                                border: '1px solid rgba(99,102,241,0.2)',
                                color: '#6366f1',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.15)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.08)'}
                            >
                              <Video size={11} /> Upload Video
                            </button>
                          )}
                          {app.status === 'Onboarded' && (
                            <button
                              onClick={() => navigate('/candidate/onboarding')}
                              className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-md text-[11.5px] font-medium transition-all"
                              style={{
                                backgroundColor: 'rgba(34,197,94,0.08)',
                                border: '1px solid rgba(34,197,94,0.2)',
                                color: '#16a34a',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.15)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.08)'}
                            >
                              <ArrowRight size={11} /> Complete Onboarding
                            </button>
                          )}
                          {app.status === 'Rejected' && (
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
