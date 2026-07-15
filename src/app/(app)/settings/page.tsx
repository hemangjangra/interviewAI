import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const aiProvider = process.env.AI_PROVIDER ?? 'mock';
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const hasGoogleOAuth = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configuration and system status</p>
      </div>

      <div className="space-y-6">
        {/* AI Provider Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Provider</CardTitle>
            <CardDescription>Which AI model is powering your interviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Current Provider</span>
              <Badge variant={aiProvider === 'gemini' ? 'success' : 'secondary'} className="capitalize">
                {aiProvider === 'mock' ? 'Demo Mode (Mock AI)' : aiProvider}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Gemini API Key</span>
              <div className="flex items-center gap-2 text-sm">
                {hasGeminiKey ? (
                  <><CheckCircle className="h-4 w-4 text-success" /><span className="text-success">Configured</span></>
                ) : (
                  <><AlertCircle className="h-4 w-4 text-warning" /><span className="text-muted-foreground">Not set</span></>
                )}
              </div>
            </div>
            {!hasGeminiKey && (
              <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm text-muted-foreground">
                <p className="font-medium text-warning mb-1">Demo Mode Active</p>
                <p>Add your Gemini API key to get real AI-powered interview questions and feedback.</p>
                <p className="mt-2 font-mono text-xs bg-muted px-2 py-1 rounded">
                  GEMINI_API_KEY=your_key_here → .env.local
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* OAuth Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Google OAuth</CardTitle>
            <CardDescription>Sign in with Google integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm">Google Sign In</span>
              <div className="flex items-center gap-2 text-sm">
                {hasGoogleOAuth ? (
                  <><CheckCircle className="h-4 w-4 text-success" /><span className="text-success">Configured</span></>
                ) : (
                  <><Info className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Optional</span></>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Database</CardTitle>
            <CardDescription>Data storage configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Current Database</span>
              <Badge variant="secondary">
                {process.env.DATABASE_URL?.startsWith('file:') ? 'SQLite (Dev)' : 'PostgreSQL'}
              </Badge>
            </div>
            {process.env.DATABASE_URL?.startsWith('file:') && (
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm">
                <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">Development Database</p>
                <p className="text-muted-foreground">Using SQLite for local development. Switch to PostgreSQL for production by updating DATABASE_URL.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{session.user.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs text-muted-foreground">{session.user.id?.slice(0, 16)}…</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
