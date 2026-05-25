'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import VisualDashboardLayout from '@/components/visual/VisualDashboardLayout';

export default function VisualDashboard() {
  return (
    <Suspense fallback={<div className="flex h-[100dvh] items-center justify-center bg-background"><Loader2 className="animate-spin text-white" /></div>}>
      <VisualDashboardLayout />
    </Suspense>
  );
}
