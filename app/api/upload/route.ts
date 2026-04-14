import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = [
  'text/csv',
  'application/csv',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/bmp',
  'application/pdf',
];

export async function POST(req: NextRequest) {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const extension = filename.split('.').pop() || '';
    
    // Robust type check: MIME type contains 'csv' OR extension is 'csv'
    const isCSV = file.type.includes('csv') || 
                  file.type === 'application/vnd.ms-excel' || 
                  file.type === 'application/octet-stream' ||
                  extension === 'csv';
    
    const isImage = file.type.startsWith('image/') || 
                    ['png', 'jpg', 'jpeg', 'bmp'].includes(extension);
    
    const isPDF = file.type === 'application/pdf' || extension === 'pdf';

    if (!isCSV && !isImage && !isPDF) {
      return NextResponse.json(
        { error: `File type not supported: ${file.type} (${extension})` },
        { status: 415 }
      );
    }

    const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '10');
    if (file.size > maxSizeMB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSizeMB}MB limit` },
        { status: 413 }
      );
    }

    const fileId = uuidv4();
    const ext = file.name.split('.').pop() || 'bin';
    const savedName = `${fileId}.${ext}`;
    const savePath = join(UPLOAD_DIR, savedName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(savePath, buffer);

    return NextResponse.json({
      success: true,
      fileId,
      originalName: file.name,
      savedName,
      size: file.size,
      type: isCSV ? 'csv' : 'ecg',
      path: `/uploads/${savedName}`,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed', detail: String(err) }, { status: 500 });
  }
}
