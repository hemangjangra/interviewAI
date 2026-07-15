import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAIProvider } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resume = await prisma.resume.findUnique({
      where: { userId: session.user.id },
      select: { id: true, extractedText: true, fileName: true, analysisStatus: true },
    });

    if (!resume) {
      return NextResponse.json({ error: 'No resume found' }, { status: 404 });
    }

    if (!resume.extractedText || resume.extractedText.trim().length < 50) {
      return NextResponse.json({ error: 'Insufficient text for analysis.' }, { status: 400 });
    }

    // Update status to processing
    await prisma.resume.update({
      where: { id: resume.id },
      data: { analysisStatus: 'processing', analysisError: null },
    });

    // Async analysis
    const ai = getAIProvider();
    ai.analyzeResume(resume.extractedText, resume.fileName)
      .then(async (analysis) => {
        await prisma.resume.update({
          where: { id: resume.id },
          data: { analysisStatus: 'done', structuredData: analysis as any, analyzedAt: new Date() },
        });
      })
      .catch(async (error) => {
        await prisma.resume.update({
          where: { id: resume.id },
          data: { analysisStatus: 'failed', analysisError: error instanceof Error ? error.message : 'Analysis failed' },
        });
      });

    return NextResponse.json({ message: 'Analysis started' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start analysis.' }, { status: 500 });
  }
}
