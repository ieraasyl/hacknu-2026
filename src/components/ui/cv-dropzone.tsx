'use client';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebHaptics } from 'web-haptics/react';
import {
  CheckCircleIcon,
  UploadSimpleIcon,
  XCircleIcon,
  SpinnerIcon,
  XIcon,
} from '@phosphor-icons/react';
import { webHapticsOptions } from '@/lib/web-haptics';

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
  const { t } = useTranslation();
  const { trigger } = useWebHaptics(webHapticsOptions);
  const [state, setState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDisabled = disabled || state === 'uploading';

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!ACCEPTED_TYPES.includes(file.type)) {
      trigger?.('error');
      setErrorMsg(t('cvDropzone.onlyPdf'));
      setState('error');
      return;
    }
    if (file.size > MAX_BYTES) {
      trigger?.('error');
      setErrorMsg(t('cvDropzone.maxSize'));
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

      trigger?.('success');
      setState('done');
      setFileId(result.fileId);
      onUpload(result.url);
    } catch (err) {
      trigger?.('error');
      setState('error');
      setFileName(null);
      setErrorMsg(err instanceof Error ? err.message : t('cvDropzone.uploadFailed'));
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
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXT}
            onChange={handleChange}
            disabled={isDisabled}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isDisabled}
            className={[
              'flex h-8 w-full items-center gap-1.5 rounded-none border px-2.5 py-1 text-xs transition-colors outline-none',
              'border-hacknu-border bg-input/30 text-hacknu-text',
              'focus-visible:border-hacknu-green focus-visible:ring-1 focus-visible:ring-hacknu-green/50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              state === 'error' ? 'border-red-500/50' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {state === 'uploading' ? (
              <>
                <SpinnerIcon size={13} className="shrink-0 animate-spin" />
                {t('cvDropzone.uploading')}
              </>
            ) : (
              <>
                <UploadSimpleIcon size={13} className="shrink-0" />
                {t('cvDropzone.chooseFile')}
              </>
            )}
          </button>
        </>
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
            aria-label={t('cvDropzone.removeFile')}
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
