import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(60),
  bio: z.string().max(500).optional(),
  currentRole: z.string().max(100).optional(),
  targetRole: z.string().max(100).optional(),
  experienceLevel: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
});

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as unknown;
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, ...profileData } = parsed.data;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      }),
      prisma.profile.upsert({
        where: { userId: session.user.id },
        update: {
          bio: profileData.bio,
          currentRole: profileData.currentRole,
          targetRole: profileData.targetRole,
          experienceLevel: profileData.experienceLevel || null,
          linkedinUrl: profileData.linkedinUrl || null,
          githubUrl: profileData.githubUrl || null,
        },
        create: {
          userId: session.user.id,
          bio: profileData.bio,
          currentRole: profileData.currentRole,
          targetRole: profileData.targetRole,
          experienceLevel: profileData.experienceLevel || null,
          linkedinUrl: profileData.linkedinUrl || null,
          githubUrl: profileData.githubUrl || null,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[UPDATE_PROFILE_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
