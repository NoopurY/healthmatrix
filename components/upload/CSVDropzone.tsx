'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';

interface CSVDropzoneProps {
  onUpload: (data: {
    savedName: string;
    originalName: string;
    type: string;
    size: number;
  }) => void;
  isLoading?: boolean;
}

export default function CSVDropzone({ onUpload, isLoading }: CSVDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB');
      return;
    }

    setFileName(file.name);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onUpload({ savedName: data.savedName, originalName: data.originalName, type: 'csv', size: data.size });
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
          accept=".csv"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="spinner" />
            <p className="text-sm" style={{ color: '#94a3b8' }}>Uploading {fileName}…</p>
          </div>
        ) : fileName && !error ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={40} style={{ color: '#00ff88' }} />
            <p className="font-semibold" style={{ color: '#00ff88' }}>{fileName}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>Click to upload a different file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(67, 99, 245, 0.1)', border: '1px solid rgba(67, 99, 245, 0.3)' }}
            >
              <FileSpreadsheet size={28} style={{ color: '#4363f5' }} />
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: '#e2e8f0' }}>
                Drop your CSV file here
              </p>
              <p className="text-sm" style={{ color: '#64748b' }}>
                or click to browse • Max 10MB
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['patient_id', 'age', 'heart_rate', 'systolic_bp', 'cholesterol'].map((col) => (
                <span
                  key={col}
                  className="px-2 py-0.5 rounded text-xs mono"
                  style={{ background: 'rgba(67, 99, 245, 0.1)', color: '#94a3b8', border: '1px solid rgba(67, 99, 245, 0.2)' }}
                >
                  {col}
                </span>
              ))}
              <span className="text-xs" style={{ color: '#64748b' }}>+ more…</span>
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
