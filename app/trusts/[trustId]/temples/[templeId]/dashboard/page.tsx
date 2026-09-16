'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function TempleDashboardRedirect() {
  const params = useParams();
  const router = useRouter();
  const trustId = (params?.trustId as string) || 'trust_sringeri';
  const templeId = (params?.templeId as string) || 'temple_vidyashankara';
  const { switchScope, updateSession } = useAuth();

  useEffect(() => {
    updateSession({ trustId, scope: 'TEMPLE', templeId });
    switchScope('TEMPLE', templeId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'sankalpvani_navigation_state',
          JSON.stringify({ activeTab: 'dashboard', parentTab: null })
        );
      } catch (e) {}
    }
    router.replace(`/?scope=TEMPLE&templeId=${templeId}&tab=dashboard`);
  }, [trustId, templeId, router, switchScope, updateSession]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-primary">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="font-sans text-xs text-on-surface-variant font-medium">
          Loading Temple Workplace in Integrated Dashboard...
        </p>
      </div>
    </div>
  );
}
