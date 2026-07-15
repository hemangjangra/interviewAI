import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAIProvider } from '@/lib/ai';
import { serializeJson, deserializeJson } from '@/lib/db-helpers';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error('[PDF_PARSE_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return '';
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Only PDF files are allowed.' }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const extractedText = await extractPDFText(buffer);
    const safeFileName = 'in-memory';

    const resume = await prisma.resume.upsert({
      where: { userId: session.user.id },
      update: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath: safeFileName,
        extractedText: extractedText || null,
        analysisStatus: 'processing',
        structuredData: null,
        analysisError: null,
        analyzedAt: null,
      },
      create: {
        userId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath: safeFileName,
        extractedText: extractedText || null,
        analysisStatus: 'processing',
      },
      select: {
        id: true, fileName: true, fileSize: true, mimeType: true,
        analysisStatus: true, uploadedAt: true, analyzedAt: true,
        structuredData: true, analysisError: true,
      },
    });

    analyzeResumeAsync(resume.id, session.user.id, extractedText, file.name).catch(console.error);

    return NextResponse.json({ resume: { ...resume, structuredData: null } }, { status: 201 });
  } catch (error) {
    console.error('[RESUME_UPLOAD_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to upload resume.' }, { status: 500 });
  }
}

async function analyzeResumeAsync(resumeId: string, userId: string, extractedText: string, fileName: string) {
  try {
    const ai = getAIProvider();
    if (!extractedText || extractedText.trim().length < 50) {
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          analysisStatus: 'failed',
          analysisError: 'Could not extract sufficient text from PDF. The file may be image-based or encrypted.',
        },
      });
      return;
    }

    const analysis = await ai.analyzeResume(extractedText, fileName);
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        analysisStatus: 'done',
        structuredData: serializeJson(analysis),
        analyzedAt: new Date(),
        analysisError: null,
      },
    });
  } catch (error) {
    console.error('[RESUME_ANALYSIS_ERROR]', error instanceof Error ? error.message : 'Unknown');
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        analysisStatus: 'failed',
        analysisError: error instanceof Error ? error.message : 'Analysis failed',
      },
    }).catch(() => {});
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawResume = await prisma.resume.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true, fileName: true, fileSize: true, mimeType: true,
        analysisStatus: true, structuredData: true, analysisError: true,
        uploadedAt: true, analyzedAt: true,
      },
    });

    if (!rawResume) return NextResponse.json({ resume: null });

    return NextResponse.json({
      resume: {
        ...rawResume,
        structuredData: deserializeJson(rawResume.structuredData as string, null),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load resume.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resume = await prisma.resume.findUnique({
      where: { userId: session.user.id },
      select: { id: true, storagePath: true },
    });

    if (!resume) return NextResponse.json({ error: 'No resume found' }, { status: 404 });

    // Files are parsed in-memory, no local filesystem deletion required on Vercel

    await prisma.resume.delete({ where: { id: resume.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[RESUME_DELETE_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to delete resume.' }, { status: 500 });
  }
}
