import type { Metadata } from 'next';
import { CreateInterviewWizard } from '@/components/interviews/create-interview-wizard';

export const metadata: Metadata = { title: 'New Interview' };

export default function NewInterviewPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">New Interview</h1>
        <p className="text-muted-foreground mt-1">Configure your mock interview session</p>
      </div>
      <CreateInterviewWizard />
    </div>
  );
}
