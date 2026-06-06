import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import TopBar from '../../components/TopBar';
import FileDropzone from '../../components/FileDropzone';
import { s, btnPrimary } from '../../lib/theme';

export default function UploadVideo() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleUpload = async () => {
    if (!files.length) { toast.error('Select a video file'); return; }
    setUploading(true);
    setProgress(0);
    try {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 80));
        setProgress(i);
      }
      setDone(true);
      toast.success('Video submitted!');
    } catch {
      toast.error('Upload failed');
      setProgress(0);
    } finally { setUploading(false); }
  };

  if (done) {
    return (
      <>
        <TopBar title="Upload Video Interview" />
        <div className="flex flex-col items-center justify-center py-24 px-6 theme-transition" style={s.base}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '2px solid rgba(34,197,94,0.3)' }}
          >
            <CheckCircle2 size={28} style={{ color: '#16a34a' }} />
          </div>
          <h2 className="text-[20px] font-semibold mb-2" style={s.tx1}>Video Submitted!</h2>
          <p className="text-[13px] text-center max-w-sm mb-6" style={s.tx3}>
            Your video interview has been received. The hiring team will review it shortly.
          </p>
          <button onClick={() => navigate('/candidate/applications')} className={btnPrimary}>
            <ArrowLeft size={13} /> Back to Applications
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Upload Video Interview" />
      <div className="px-6 py-6 max-w-xl space-y-5 theme-transition" style={s.base}>
        <button
          onClick={() => navigate('/candidate/applications')}
          className="flex items-center gap-1.5 text-[12.5px] transition-colors"
          style={{ color: 'var(--c-tx4)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--c-tx1)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-tx4)'}
        >
          <ArrowLeft size={13} /> Applications
        </button>

        <div className="rounded-xl p-6 space-y-5 theme-transition" style={s.surface}>
          <div>
            <h2 className="text-[13.5px] font-semibold mb-1" style={s.tx1}>Video Interview</h2>
            <p className="text-[12px]" style={s.tx3}>Upload a short video (max 5 min) introducing yourself and why you're a great fit.</p>
          </div>

          <FileDropzone
            accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,.mp4,.mov,.webm,.avi"
            multiple={false} files={files} onChange={setFiles}
            label="Drop your video here or click to browse"
            hint="Supports MP4, MOV, WEBM, AVI — max 200MB"
          />

          {uploading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px]" style={s.tx4}>Uploading…</span>
                <span className="text-[11.5px] tabular-nums" style={{ color: '#6366f1' }}>{progress}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--c-raised)' }}>
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{ width: `${progress}%`, backgroundColor: '#6366f1' }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/candidate/applications')}
              className="flex-1 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all theme-transition"
              style={{ border: '1px solid var(--c-border-strong)', color: 'var(--c-tx2)', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-raised)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload} disabled={uploading || !files.length}
              className={`flex-1 ${btnPrimary}`}
            >
              {uploading ? <><Loader2 size={13} className="animate-spin" /> Uploading…</> : 'Submit Video'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
