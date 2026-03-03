import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { participant } from '../db/schema';

interface AppEnv {
  DB: D1Database;
  GAS_URL: string;
  GAS_SECRET: string;
}

function getAppDb() {
  const appEnv = env as unknown as AppEnv;
  return getDb(appEnv.DB);
}

export async function getParticipant(userId: string) {
  const db = getAppDb();
  return db.query.participant.findFirst({
    where: eq(participant.id, userId),
  });
}

export async function upsertParticipant(data: {
  userId: string;
  fullName: string;
  iin: string;
  phone: string;
  educationLevel: string;
  cvUrl?: string | null;
}) {
  const db = getAppDb();

  await db
    .insert(participant)
    .values({
      id: data.userId,
      fullName: data.fullName,
      iin: data.iin,
      phone: data.phone,
      educationLevel: data.educationLevel,
      cvUrl: data.cvUrl ?? null,
    })
    .onConflictDoUpdate({
      target: participant.id,
      set: {
        fullName: data.fullName,
        iin: data.iin,
        phone: data.phone,
        educationLevel: data.educationLevel,
        cvUrl: data.cvUrl ?? null,
        updatedAt: new Date(),
      },
    });
}

/**
 * Build a canonical CV filename: CleanedFullName_IINprefix.ext
 * e.g. "Yerassyl Auyeskhan" + "050919501086" + "my-cv.pdf" → "YerassylAuyeskhan_050919.pdf"
 */
export function buildCvFileName(fullName: string, iin: string, originalFileName: string): string {
  const cleanedName = fullName
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}]/gu, ''))
    .join('');
  const iinPrefix = iin.slice(0, 6);
  const dotIndex = originalFileName.lastIndexOf('.');
  const ext = dotIndex !== -1 ? originalFileName.slice(dotIndex) : '';
  return `${cleanedName}_${iinPrefix}${ext}`;
}

/**
 * Upload a CV to Google Drive via the GAS backend.
 * Runs server-side so GAS_SECRET is never exposed to the client.
 * When fullName + iin are provided the file is renamed before upload.
 */
export async function uploadCvToGas(data: {
  fileName: string;
  mimeType: string;
  data: string;
  fullName?: string;
  iin?: string;
}): Promise<{ url: string; fileId: string }> {
  const appEnv = env as unknown as AppEnv;
  const { GAS_URL, GAS_SECRET } = appEnv;

  if (!GAS_URL || !GAS_SECRET) {
    throw new Error('Upload service not configured');
  }

  const fileName =
    data.fullName && data.iin
      ? buildCvFileName(data.fullName, data.iin, data.fileName)
      : data.fileName;

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: GAS_SECRET,
      action: 'upload-cv',
      fileName,
      mimeType: data.mimeType,
      data: data.data,
    }),
  });

  if (!res.ok) {
    throw new Error(`Upload failed (HTTP ${res.status})`);
  }

  const json = (await res.json()) as Record<string, unknown>;
  const url =
    (json.url as string) ??
    (json.fileUrl as string) ??
    (json.driveUrl as string) ??
    (json.link as string);
  const fileId = (json.fileId as string) ?? '';

  if (!url) throw new Error('No URL returned from upload service');

  return { url, fileId };
}

/**
 * Delete a CV from Google Drive via the GAS backend.
 */
export async function deleteCvFromGas(fileId: string): Promise<void> {
  const appEnv = env as unknown as AppEnv;
  const { GAS_URL, GAS_SECRET } = appEnv;

  if (!GAS_URL || !GAS_SECRET) {
    throw new Error('Upload service not configured');
  }

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: GAS_SECRET,
      action: 'delete-cv',
      fileId,
    }),
  });

  if (!res.ok) {
    throw new Error(`Delete failed (HTTP ${res.status})`);
  }
}
