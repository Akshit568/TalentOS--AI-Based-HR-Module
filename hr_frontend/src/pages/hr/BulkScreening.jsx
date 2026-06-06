import { useEffect, useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import TopBar from '../../components/TopBar';
import FileDropzone from '../../components/FileDropzone';
import ScoreBar from '../../components/ScoreBar';
import StatusBadge from '../../components/StatusBadge';
import SkillTag from '../../components/SkillTag';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { s, tableHeadTh, tableTr, tableTd, btnPrimary, inputClass, inputStyle, inputFocusStyle } from '../../lib/theme';

export default function BulkScreening() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectFocused, setSelectFocused] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    supabase.from('jobs').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setJobs(data || []))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoadingJobs(false));
  }, []);

  const jobData = jobs.find((j) => j.id === selectedJob);

  const handleUpload = async () => {
    if (!selectedJob) { toast.error('Select a job first'); return; }
    if (!files.length)  { toast.error('Add at least one resume'); return; }
    setUploading(true);
    try {
      const simulated = files.map((f) => ({
        filename: f.name,
        textLength: Math.floor(Math.random() * 3000) + 500,
        aiScore: Math.floor(Math.random() * 50) + 40,
        status: 'Created',
      }));
      const insertions = await Promise.all(
        simulated.map((r) =>
          supabase.from('applications').insert({
            job_id: selectedJob,
            candidate_id: user.id,
            candidate_name: `Applicant (${r.filename})`,
            candidate_email: '',
            ai_score: r.aiScore,
            status: 'Applied',
          }).then(() => r).catch(() => ({ ...r, status: 'Failed' }))
        )
      );
      setResults({ results: insertions });
      setFiles([]);
      toast.success('Bulk screening complete');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const summary = results ? {
    screened: (results.results || []).filter((r) => r.status === 'Created').length,
    skipped:  (results.results || []).filter((r) => r.status === 'Skipped').length,
    failed:   (results.results || []).filter((r) => r.status === 'Failed').length,
  } : null;

  const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.09em] mb-1.5';

  return (
    <>
      <TopBar title="Bulk Screening" />
      <div className="px-6 py-6 space-y-6 max-w-4xl theme-transition" style={s.base}>
        <div className="rounded-xl p-6 space-y-5 theme-transition" style={s.surface}>
          <div>
            <h2 className="text-[13.5px] font-semibold mb-1" style={s.tx1}>Configure Screening</h2>
            <p className="text-[12px]" style={s.tx3}>Select a job, upload resumes, and let AI rank candidates automatically.</p>
          </div>

          <div>
            <label className={labelCls} style={s.tx3}>Job Position</label>
            {loadingJobs ? (
              <div className="flex items-center gap-2 text-[12.5px] py-2" style={s.tx3}>
                <LoadingSpinner size="sm" /> Loading jobs…
              </div>
            ) : (
              <select
                value={selectedJob}
                onChange={(e) => { setSelectedJob(e.target.value); setResults(null); }}
                onFocus={() => setSelectFocused(true)}
                onBlur={() => setSelectFocused(false)}
                className={`appearance-none ${inputClass} max-w-md`}
                style={{ ...inputStyle(false), ...(selectFocused ? inputFocusStyle : {}) }}
              >
                <option value="">Select a job to screen for</option>
                {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            )}
          </div>

          {jobData?.required_skills?.length > 0 && (
            <div>
              <label className={labelCls} style={s.tx3}>Required Skills</label>
              <div className="flex flex-wrap gap-1.5">
                {jobData.required_skills.map((sk) => <SkillTag key={sk} label={sk} />)}
              </div>
            </div>
          )}

          <div>
            <label className={labelCls} style={s.tx3}>Resume Files</label>
            <FileDropzone
              accept=".pdf,.doc,.docx" multiple files={files} onChange={setFiles}
              label="Drop resume files here or click to browse"
              hint="Supports PDF, DOC, DOCX — AI scores will be simulated"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !selectedJob || !files.length}
            className={btnPrimary}
          >
            {uploading
              ? <><Loader2 size={13} className="animate-spin" /> Processing…</>
              : <><Upload size={13} /> Run Screening</>
            }
          </button>
        </div>

        {results && (
          <div className="space-y-4">
            <div
              className="flex items-center gap-4 px-5 py-3 rounded-xl theme-transition"
              style={s.surface}
            >
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={13} />
                <span className="text-[12.5px] font-medium">{summary.screened} screened</span>
              </div>
              <span style={s.tx4}>·</span>
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <RefreshCw size={12} />
                <span className="text-[12.5px] font-medium">{summary.skipped} skipped</span>
              </div>
              <span style={s.tx4}>·</span>
              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <AlertCircle size={12} />
                <span className="text-[12.5px] font-medium">{summary.failed} failed</span>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden theme-transition" style={s.surface}>
              <div className="px-5 py-4" style={s.divider}>
                <h3 className="text-[13.5px] font-semibold" style={s.tx1}>Screening Results</h3>
              </div>
              {!results.results?.length ? (
                <EmptyState icon={Upload} title="No results" description="Nothing was returned." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                        {['File', 'Text Length', 'AI Score', 'Status'].map((h) => (
                          <th key={h} className={tableHeadTh} style={s.tx3}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.results.map((r, i) => (
                        <tr
                          key={i}
                          className={tableTr}
                          style={{ borderColor: 'var(--c-border)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-raised)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td className={`${tableTd} max-w-[200px] truncate`} style={s.tx1}>{r.filename || `Resume ${i + 1}`}</td>
                          <td className={tableTd + ' tabular-nums'} style={s.tx3}>{r.textLength ? `${r.textLength} chars` : '—'}</td>
                          <td className="px-5 py-3.5 min-w-[120px]"><ScoreBar score={r.aiScore || 0} /></td>
                          <td className={tableTd}><StatusBadge status={r.status || 'Created'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
