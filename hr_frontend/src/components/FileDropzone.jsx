import { useRef, useState } from 'react';
import { Upload, File, X } from 'lucide-react';

export default function FileDropzone({ accept, multiple = false, files, onChange, label, hint }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    onChange(multiple ? dropped : [dropped[0]]);
  };

  return (
    <div className="space-y-2.5">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all duration-200 theme-transition"
        style={{
          borderColor: dragging ? '#6366f1' : 'var(--c-border-strong)',
          backgroundColor: dragging ? 'rgba(99,102,241,0.05)' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!dragging) e.currentTarget.style.backgroundColor = 'var(--c-raised)';
        }}
        onMouseLeave={(e) => {
          if (!dragging) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{
            backgroundColor: dragging ? 'rgba(99,102,241,0.12)' : 'var(--c-raised)',
            border: '1px solid var(--c-border)',
          }}
        >
          <Upload size={17} style={{ color: dragging ? '#6366f1' : 'var(--c-tx3)' }} />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium" style={{ color: 'var(--c-tx2)' }}>
            {label || 'Drop files here or click to browse'}
          </p>
          {hint && (
            <p className="text-[11px] mt-1" style={{ color: 'var(--c-tx4)' }}>{hint}</p>
          )}
        </div>
        <input
          ref={inputRef} type="file" className="sr-only" accept={accept} multiple={multiple}
          onChange={(e) => {
            const sel = Array.from(e.target.files);
            onChange(multiple ? sel : [sel[0]]);
            e.target.value = '';
          }}
        />
      </div>

      {files?.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-3 py-2 rounded-lg theme-transition"
              style={{
                backgroundColor: 'var(--c-raised)',
                border: '1px solid var(--c-border)',
              }}
            >
              <File size={13} className="text-indigo-400/70 shrink-0" />
              <span className="flex-1 text-[12.5px] truncate" style={{ color: 'var(--c-tx2)' }}>
                {file.name}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--c-tx4)' }}>
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="transition-colors"
                style={{ color: 'var(--c-tx4)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-tx4)'}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
