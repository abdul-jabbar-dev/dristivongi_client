'use client';
import React from 'react';

export default function OrgDashboardCases({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cases</h1>
      </div>
      <div className="bg-white border rounded-xl shadow-sm p-8 text-center text-gray-500">
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Cases Found</h3>
        <p>This organization has not been linked to any public cases yet.</p>
      </div>
    </div>
  );
}
