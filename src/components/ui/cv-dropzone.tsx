import { useRef, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, SpinnerIcon, XIcon } from '@phosphor-icons/react';
import { Input } from './input';

const ACCEPTED_TYPES = ['application/pdf'];
const ACCEPTED_EXT = '.pdf';
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

interface CvDropzoneProps {
  onUpload: (url: string) => void;
  onClear: () => void;
  uploadFile: (data: {
    fileName: string;
    mimeType: string;
    data: string;
  }) => Promise<{ url: string; fileId: string }>;
  deleteFile?: (fileId: string) => Promise<void>;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
}

export function CvDropzone({
  onUpload,
  onClear,
  uploadFile,
  deleteFile,
  onUploadingChange,
  disabled = false,
}: CvDropzoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMsg('Only PDF files are accepted.');
      setState('error');
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrorMsg('File must be under 2 MB.');
      setState('error');
      return;
    }

    setState('uploading');
    onUploadingChange?.(true);
    setFileName(file.name);
    setErrorMsg(null);

    try {
      const base64 = await readAsBase64(file);
      const result = await uploadFile({
        fileName: file.name,
        mimeType: file.type,
        data: base64,
      });

      setState('done');
      setFileId(result.fileId);
      onUpload(result.url);
    } catch (err) {
      setState('error');
      setFileName(null);
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      onUploadingChange?.(false);
    }
  };

  const handleClear = () => {
    const currentFileId = fileId;
    setState('idle');
    setFileName(null);
    setFileId(null);
    setErrorMsg(null);
    onClear();

    if (deleteFile && currentFileId) {
      void deleteFile(currentFileId).catch(() => {
        // deletion failure is non-blocking after optimistic local clear
      });
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {state !== 'done' && (
        <Input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXT}
          onChange={handleChange}
          disabled={disabled || state === 'uploading'}
          className={[
            'border-hacknu-border bg-hacknu-dark text-hacknu-text',
            'file:text-hacknu-text-muted focus-visible:border-hacknu-green',
            state === 'error' ? 'border-red-500/50' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      )}

      {state === 'uploading' && (
        <p className="flex items-center gap-1.5 text-[11px] text-hacknu-text-muted">
          <SpinnerIcon size={12} className="animate-spin" />
          Uploading {fileName}...
        </p>
      )}

      {state === 'done' && (
        <div className="flex items-center justify-between border border-hacknu-green/40 bg-hacknu-green/5 px-2.5 py-1.5">
          <span className="flex items-center gap-1.5 text-xs text-hacknu-green">
            <CheckCircleIcon size={14} weight="fill" />
            <span className="max-w-55 truncate">{fileName}</span>
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 text-hacknu-text-muted/60 transition-colors hover:text-red-400"
            aria-label="Remove file"
          >
            <XIcon size={12} />
          </button>
        </div>
      )}

      {state === 'error' && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-400">
          <XCircleIcon size={12} weight="fill" />
          {errorMsg}
        </p>
      )}

      {state === 'idle' && (
        <p className="text-[11px] text-hacknu-text-muted/60">PDF only — max 2 MB</p>
      )}
    </div>
  );
}

/* ─── Helpers ─── */
function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
