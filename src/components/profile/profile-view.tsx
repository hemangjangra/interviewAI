'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

const ProfileSchema = z.object({
  name: z.string().min(2).max(60),
  bio: z.string().max(500).optional(),
  currentRole: z.string().max(100).optional(),
  targetRole: z.string().max(100).optional(),
  experienceLevel: z.enum(['fresher', 'entry', 'intermediate', 'advanced', '']).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof ProfileSchema>;

interface ProfileViewProps {
  user: { id: string; name: string | null; email: string | null; image: string | null; createdAt: string };
  profile: { bio?: string | null; currentRole?: string | null; targetRole?: string | null; experienceLevel?: string | null; linkedinUrl?: string | null; githubUrl?: string | null; skills?: string[] } | null;
}

export function ProfileView({ user, profile }: ProfileViewProps) {
  const router = useRouter();
  const userInitials = user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '??';

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user.name ?? '',
      bio: profile?.bio ?? '',
      currentRole: profile?.currentRole ?? '',
      targetRole: profile?.targetRole ?? '',
      experienceLevel: (profile?.experienceLevel as any) ?? '',
      linkedinUrl: profile?.linkedinUrl ?? '',
      githubUrl: profile?.githubUrl ?? '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      toast({ title: 'Profile updated!', description: 'Your changes have been saved.' });
      router.refresh();
    } catch {
      toast({ title: 'Update failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={user.image ?? ''} alt={user.name ?? ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-lg">{user.name ?? 'User'}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="text-xs text-muted-foreground mt-1">Member since {new Date(user.createdAt).getFullYear()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell us about yourself..." {...register('bio')} />
          </div>
        </CardContent>
      </Card>

      {/* Career */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Career Information</CardTitle>
          <CardDescription>This helps personalize your interview experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentRole">Current Role</Label>
              <Input id="currentRole" placeholder="e.g. Final Year B.Tech Student" {...register('currentRole')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetRole">Target Role</Label>
              <Input id="targetRole" placeholder="e.g. Software Engineer" {...register('targetRole')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="experienceLevel">Experience Level</Label>
            <Select
              value={watch('experienceLevel') ?? ''}
              onValueChange={(v) => setValue('experienceLevel', v as any)}
            >
              <SelectTrigger id="experienceLevel">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fresher">Student / Fresher</SelectItem>
                <SelectItem value="entry">Entry Level (1-2 years)</SelectItem>
                <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Social links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input id="linkedinUrl" placeholder="https://linkedin.com/in/yourname" {...register('linkedinUrl')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input id="githubUrl" placeholder="https://github.com/yourname" {...register('githubUrl')} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting} id="save-profile-btn">
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {isSubmitting ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
}
