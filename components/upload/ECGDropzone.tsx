'use client';

import { useState, useRef, useCallback } from 'react';
import { Activity, AlertCircle, CheckCircle, X, FileImage } from 'lucide-react';

interface ECGDropzoneProps {
  onUpload: (data: {
    savedName: string;
    originalName: string;
    type: string;
    size: number;
  }) => void;
}

const ALLOWED = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'application/pdf'];
const ALLOWED_EXT = ['.png', '.jpg', '.jpeg', '.bmp', '.pdf'];

export default function ECGDropzone({ onUpload }: ECGDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    const ext = file.name.toLowerCase().split('.').pop() || '';
    if (!ALLOWED_EXT.some((e) => e.includes(ext))) {
      setError(`Supported formats: ${ALLOWED_EXT.join(', ')}`);
      return;
    }

    setFileName(file.name);
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
    }
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onUpload({ savedName: data.savedName, originalName: data.originalName, type: 'ecg', size: file.size });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  return (
    <div>
      <div
        className={`upload-zone p-8 text-center cursor-pointer transition-all duration-300 ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED_EXT.join(',')}
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="spinner" />
            <p className="text-sm" style={{ color: '#94a3b8' }}>Uploading ECG…</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={preview}
              alt="ECG preview"
              className="max-h-32 rounded-lg object-contain"
              style={{ border: '1px solid rgba(0, 212, 255, 0.3)' }}
            />
            <p className="font-semibold text-sm" style={{ color: '#00d4ff' }}>{fileName}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>Click to replace</p>
          </div>
        ) : fileName && !error ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={40} style={{ color: '#00ff88' }} />
            <p className="font-semibold text-sm" style={{ color: '#00ff88' }}>{fileName}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
              style={{ background: 'rgba(255, 77, 109, 0.08)', border: '1px solid rgba(255, 77, 109, 0.3)' }}
            >
              <Activity size={28} style={{ color: '#ff4d6d' }} className="animate-pulse" />
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: '#e2e8f0' }}>
                Drop ECG image or PDF
              </p>
              <p className="text-sm" style={{ color: '#64748b' }}>
                PNG, JPG, BMP, PDF • Max 10MB
              </p>
            </div>
            <div className="flex gap-2">
              {['PNG', 'JPG', 'PDF'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: 'rgba(255, 77, 109, 0.1)', color: '#ff4d6d', border: '1px solid rgba(255, 77, 109, 0.2)' }}
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          className="flex items-center gap-2 mt-3 p-3 rounded-lg text-sm"
          style={{ background: 'rgba(255, 77, 109, 0.08)', border: '1px solid rgba(255, 77, 109, 0.3)', color: '#ff4d6d' }}
        >
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}
