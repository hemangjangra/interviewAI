'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Upload, Loader2, Trash2, CheckCircle, AlertCircle,
  RefreshCw, Brain, Code2, Database, GraduationCap, Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { formatFileSize, formatDate } from '@/lib/utils';

interface ResumeData {
  id: string; fileName: string; fileSize: number; mimeType: string;
  analysisStatus: string; analysisError: string | null;
  uploadedAt: string; analyzedAt: string | null;
  structuredData: {
    summary?: string;
    programmingLanguages?: string[];
    frameworks?: string[];
    tools?: string[];
    databases?: string[];
    skills?: string[];
    education?: { institution: string; degree: string; field: string; year?: string; cgpa?: string }[];
    experience?: { company: string; role: string; duration: string; highlights: string[] }[];
    projects?: { name: string; description: string; technologies: string[] }[];
    certifications?: string[];
    likelyInterviewTopics?: string[];
    experienceLevel?: string;
    targetRoles?: string[];
  } | null;
}

interface ResumeViewProps {
  resume: ResumeData | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf'];

export function ResumeView({ resume: initialResume }: ResumeViewProps) {
  const router = useRouter();
  const [resume, setResume] = React.useState(initialResume);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadState, setUploadState] = React.useState<'idle' | 'uploading' | 'analyzing'>('idle');
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF file.', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: 'File too large', description: 'Maximum file size is 10MB.', variant: 'destructive' });
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 10, 80));
      }, 200);

      const res = await fetch('/api/resume', { method: 'POST', body: formData });
      clearInterval(progressInterval);
      setUploadProgress(90);

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? 'Upload failed');
      }

      const data = await res.json() as { resume: ResumeData };
      setUploadProgress(100);
      setResume(data.resume);
      setUploadState('analyzing');

      toast({ title: 'Resume uploaded!', description: 'AI is analyzing your resume...' });

      // Poll for analysis completion
      pollAnalysisStatus(data.resume.id);
    } catch (error) {
      toast({ title: 'Upload failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
      setUploadState('idle');
    }
  };

  const pollAnalysisStatus = async (resumeId: string) => {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await fetch('/api/resume');
        if (res.ok) {
          const data = await res.json() as { resume: ResumeData };
          setResume(data.resume);
          if (data.resume.analysisStatus === 'done') {
            setUploadState('idle');
            toast({ title: 'Analysis complete!', description: 'Your resume has been analyzed.' });
            router.refresh();
            return;
          }
          if (data.resume.analysisStatus === 'failed') {
            setUploadState('idle');
            toast({ title: 'Analysis failed', description: 'Resume text could not be fully extracted.', variant: 'destructive' });
            return;
          }
        }
      } catch { /* ignore poll error */ }
    }
    setUploadState('idle');
  };

  const handleDelete = async () => {
    if (!confirm('Delete your resume? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/resume', { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setResume(null);
      toast({ title: 'Resume deleted' });
    } catch {
      toast({ title: 'Delete failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleReanalyze = async () => {
    if (!resume) return;
    setUploadState('analyzing');
    try {
      const res = await fetch('/api/resume/analyze', { method: 'POST' });
      if (!res.ok) throw new Error();
      toast({ title: 'Re-analyzing...', description: 'This may take a moment.' });
      pollAnalysisStatus(resume.id);
    } catch {
      toast({ title: 'Failed to re-analyze', variant: 'destructive' });
      setUploadState('idle');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const data = resume?.structuredData;
  const isAnalyzing = resume?.analysisStatus === 'processing' || uploadState === 'analyzing';

  return (
    <div className="max-w-3xl space-y-6">
      {/* Upload area */}
      {!resume || resume.analysisStatus === 'failed' ? (
        <div
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload resume"
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="sr-only"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {uploadState === 'uploading' ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
              <p className="text-sm font-medium">Uploading...</p>
              <Progress value={uploadProgress} className="max-w-xs mx-auto" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold">Drop your resume here or click to upload</p>
                <p className="text-sm text-muted-foreground mt-1">PDF format · Max 10MB</p>
              </div>
              <Button size="sm" variant="outline" className="mt-2" id="upload-resume-btn">
                Choose File
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Current resume info */
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{resume.fileName}</div>
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(resume.fileSize)} · Uploaded {formatDate(resume.uploadedAt)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {resume.analysisStatus === 'done' ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Analyzed
                  </Badge>
                ) : isAnalyzing ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Analyzing...
                  </Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
                <Button variant="ghost" size="icon" onClick={handleReanalyze} disabled={isAnalyzing} title="Re-analyze" id="reanalyze-btn">
                  <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={handleDelete} title="Delete resume" id="delete-resume-btn">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analyzing state */}
      {isAnalyzing && !data && (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-10 w-10 text-primary mx-auto mb-3 animate-pulse" />
            <p className="font-medium">AI is analyzing your resume...</p>
            <p className="text-sm text-muted-foreground mt-1">This may take 10-30 seconds</p>
          </CardContent>
        </Card>
      )}

      {/* Analysis results */}
      {data && resume?.analysisStatus === 'done' && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary */}
          {data.summary && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{data.summary}</p>
                {data.experienceLevel && (
                  <Badge variant="secondary" className="mt-3 capitalize">{data.experienceLevel} level</Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {data.programmingLanguages && data.programmingLanguages.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-blue-500" />
                    Programming Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {data.programmingLanguages.map((l) => (
                      <Badge key={l} variant="secondary">{l}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {data.frameworks && data.frameworks.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Frameworks & Libraries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {data.frameworks.map((f) => (
                      <Badge key={f} variant="secondary">{f}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {data.databases && data.databases.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-500" />
                    Databases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {data.databases.map((d) => (
                      <Badge key={d} variant="secondary">{d}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {data.likelyInterviewTopics && data.likelyInterviewTopics.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Suggested Interview Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {data.likelyInterviewTopics.map((t) => (
                      <Badge key={t} variant="outline" className="capitalize">{t.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-violet-500" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.education.map((edu, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <div>
                        <div className="font-medium">{edu.institution}</div>
                        <div className="text-muted-foreground">{edu.degree} in {edu.field}</div>
                      </div>
                      <div className="text-right text-muted-foreground">
                        {edu.year && <div>{edu.year}</div>}
                        {edu.cgpa && <div>CGPA: {edu.cgpa}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-orange-500" />
                  Projects ({data.projects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.projects.map((proj, i) => (
                    <div key={i}>
                      {i > 0 && <Separator className="mb-3" />}
                      <div className="font-medium text-sm">{proj.name}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{proj.description}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.technologies.map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
