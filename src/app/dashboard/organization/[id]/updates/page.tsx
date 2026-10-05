'use client';
import React from 'react';

export default function OrgDashboardUpdates({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Updates</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">New Update</button>
      </div>
      <div className="bg-white border rounded-xl shadow-sm p-8 text-center text-gray-500">
        <p>You haven't posted any public updates yet.</p>
      </div>
    </div>
  );
}
