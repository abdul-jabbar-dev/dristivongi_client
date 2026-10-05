'use client';
import React from 'react';

export default function OrgDashboardResponses({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Official Responses</h1>
      </div>
      <div className="bg-white border rounded-xl shadow-sm p-8 text-center text-gray-500">
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Official Responses</h3>
        <p>Your authorized representatives can create official responses directly from Case Details pages.</p>
      </div>
    </div>
  );
}
