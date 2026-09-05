'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import MembersGovernance from '@/components/MembersGovernance';

export default function MembersDirectoryPage() {
  const params = useParams();
  const router = useRouter();
  const trustId = (params?.trustId as string) || 'trust_sringeri';

  return (
    <div className="min-h-screen bg-background text-on-surface p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <MembersGovernance
          trustId={trustId}
          onBack={() => router.push(`/trusts/${trustId}/dashboard`)}
          onNavigate={(tab) => {
            if (tab === 'dashboard') router.push(`/trusts/${trustId}/dashboard`);
          }}
        />
      </div>
    </div>
  );
}
