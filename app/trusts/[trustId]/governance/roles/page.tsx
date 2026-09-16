'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RolesRedirect() {
  const params = useParams();
  const router = useRouter();
  const trustId = (params?.trustId as string) || 'trust_sringeri';
  const { switchScope, updateSession } = useAuth();

  useEffect(() => {
    updateSession({ trustId, scope: 'TRUST' });
    switchScope('TRUST');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'sankalpvani_navigation_state',
          JSON.stringify({ activeTab: 'roles', parentTab: null })
        );
      } catch (e) {}
    }
    router.replace('/?tab=roles');
  }, [trustId, router, switchScope, updateSession]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-primary">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="font-sans text-xs text-on-surface-variant font-medium">
          Loading Dynamic Roles in Integrated Workspace...
        </p>
      </div>
    </div>
  );
}
