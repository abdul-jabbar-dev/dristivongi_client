'use client';
import React from 'react';
import { useGetOrganizationByIdQuery } from '../../../../redux/feature/organization/organizationApi';


export default function OrgDashboardOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetOrganizationByIdQuery(id);

  if (isLoading) return <div className="animate-pulse h-full bg-gray-100 rounded-xl min-h-[400px]"></div>;
  if (!data?.data) return <div className="text-red-500">Organization not found or access denied.</div>;

  const org = data.data;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Organization Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 border rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-500 mb-1">Status</h3>
            <div className="mt-2 text-lg font-bold">{org.status}</div>
         </div>
         <div className="bg-white p-6 border rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-500 mb-1">Visibility</h3>
            <p className="text-lg font-bold">{org.visibility}</p>
         </div>
         <div className="bg-white p-6 border rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-500 mb-1">Members</h3>
            <p className="text-3xl font-bold">Manage &rarr;</p>
         </div>
      </div>
      
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="font-bold text-xl mb-4">Organization Identity</h2>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border">
            {org.logoUrl ? <img src={org.logoUrl} className="w-full h-full object-cover" /> : <span className="text-gray-400 font-bold text-2xl">{org.name.charAt(0)}</span>}
          </div>
          <div>
            <h3 className="text-2xl font-bold">{org.name}</h3>
            <p className="text-gray-600">{org.organizationType}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
