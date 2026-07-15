import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProfileView } from '@/components/profile/profile-view';
import { deserializeArray } from '@/lib/db-helpers';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [user, rawProfile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    }),
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!user) redirect('/login');

  const profile = rawProfile ? {
    ...rawProfile,
    skills: deserializeArray(rawProfile.skills as unknown as string),
  } : null;

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and preferences</p>
      </div>
      <ProfileView
        user={{ id: user.id, name: user.name, email: user.email, image: user.image, createdAt: user.createdAt.toISOString() }}
        profile={profile}
      />
    </div>
  );
}
