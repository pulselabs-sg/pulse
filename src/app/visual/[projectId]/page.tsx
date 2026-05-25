'use client';

import { Suspense, use } from 'react';
import { Loader2 } from 'lucide-react';
import VisualDashboardLayout from '@/components/visual/VisualDashboardLayout';

export default function VisualProjectDashboard({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);

  return (
    <Suspense fallback={<div className="flex h-[100dvh] items-center justify-center bg-background"><Loader2 className="animate-spin text-white" /></div>}>
      <VisualDashboardLayout projectId={resolvedParams.projectId} />
    </Suspense>
  );
}
