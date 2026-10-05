'use client';
import React from 'react';
import { useParams } from 'next/navigation';

export default function AdminOrganizationDetails() {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Review: {id}</h1>
      <div className="bg-white border rounded-xl shadow-sm p-8 text-center text-gray-500">
        <p>Select actions from the main Admin Organizations list to approve/reject.</p>
      </div>
    </div>
  );
}
