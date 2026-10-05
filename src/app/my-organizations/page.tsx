'use client';
import React from 'react';
import Link from 'next/link';
import { useGetMyOrganizationsQuery } from '@/redux/feature/organization/organizationApi';
import { OrganizationStatusBadge } from '@/components/organization/OrganizationStatusBadge';

export default function MyOrganizations() {
  const { data, isLoading } = useGetMyOrganizationsQuery();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Organizations</h1>
          <p className="text-gray-600">Organizations you manage or are a member of.</p>
        </div>
        <Link href="/organizations/create" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Create Organization
        </Link>
      </div>

      {isLoading ? (
        <p>Loading your organizations...</p>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((membership: any) => (
             <div key={membership.id} className="border rounded-xl p-4 shadow-sm bg-white flex flex-col">
               <div className="flex justify-between items-start mb-4">
                 <h3 className="font-bold text-lg">{membership.organization.name}</h3>
                 <OrganizationStatusBadge status={membership.organization.status} />
               </div>
               <p className="text-sm text-gray-500 mb-2">Role: <span className="font-semibold">{membership.role}</span></p>
               <p className="text-sm text-gray-500 mb-4">Visibility: {membership.organization.visibility}</p>
               <Link href={`/dashboard/organization/${membership.organization.id}`} className="mt-auto block text-center px-4 py-2 border rounded-md hover:bg-gray-50">
                 Open Dashboard
               </Link>
             </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
           <h3 className="text-xl font-medium text-gray-700 mb-2">No organizations yet</h3>
           <p className="text-gray-500 mb-4">You haven't joined or created an organization yet.</p>
           <Link href="/organizations/create" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block">
             Create Organization
           </Link>
        </div>
      )}
    </div>
  );
}
