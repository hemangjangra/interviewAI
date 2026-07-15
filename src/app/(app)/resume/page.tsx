import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ResumeView } from '@/components/resume/resume-view';
import { deserializeJson } from '@/lib/db-helpers';

export const metadata: Metadata = { title: 'Resume' };

export default async function ResumePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const rawResume = await prisma.resume.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true, fileName: true, fileSize: true, mimeType: true,
      analysisStatus: true, structuredData: true, analysisError: true,
      uploadedAt: true, analyzedAt: true,
    },
  });

  const resume = rawResume ? {
    ...rawResume,
    uploadedAt: rawResume.uploadedAt.toISOString(),
    analyzedAt: rawResume.analyzedAt?.toISOString() ?? null,
    structuredData: deserializeJson<any>(rawResume.structuredData as string, null),
  } : null;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Resume</h1>
        <p className="text-muted-foreground mt-1">Upload and analyze your resume for personalized interview questions</p>
      </div>
      <ResumeView resume={resume} />
    </div>
  );
}
