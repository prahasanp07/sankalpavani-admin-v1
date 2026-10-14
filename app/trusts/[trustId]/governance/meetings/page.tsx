'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import MeetingsGovernance from '@/components/governance/MeetingsGovernance';
import { useAuth } from '@/contexts/AuthContext';

export default function MeetingsPage() {
  const params = useParams();
  const router = useRouter();
  const trustId = (params?.trustId as string) || 'trust_sringeri';
  const { session } = useAuth();

  const trustName =
    trustId === 'trust_ahobila'
      ? 'Sri Ahobila Matha Devasthanam Trust'
      : 'Sri Sringeri Sharada Peetham Trust';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <MeetingsGovernance
          trustId={trustId}
          trustName={trustName}
          onBack={() => router.push('/')}
        />
      </div>
    </div>
  );
}
