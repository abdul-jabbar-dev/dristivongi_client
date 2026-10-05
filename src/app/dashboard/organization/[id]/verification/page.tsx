'use client';
import React, { useState } from 'react';
import { useGetOrganizationByIdQuery, useSubmitVerificationMutation } from '@/redux/feature/organization/organizationApi';
import { OrganizationVerificationBadge } from '@/components/organization/OrganizationVerificationBadge';

export default function OrgDashboardVerification({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetOrganizationByIdQuery(id);
  const [submitDocs, { isLoading: isSubmitting }] = useSubmitVerificationMutation();
  const [docs, setDocs] = useState<string[]>([]);

  if (isLoading) return <div className="p-8">Loading verification data...</div>;
  if (!data?.data) return <div>Organization not found</div>;

  const org = data.data;

  const handleSubmit = async () => {
    if (docs.length === 0) return alert('Please upload at least one document.');
    try {
      await submitDocs({ id, documentUrls: docs }).unwrap();
      alert('Verification submitted successfully!');
      setDocs([]);
    } catch (err) {
      alert('Failed to submit verification');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Verification Center</h1>
      
      <div className="bg-white border rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          Current Status: <OrganizationVerificationBadge status={org.verificationStatus} />
        </h2>
        
        {org.verificationStatus === 'REJECTED' && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 border border-red-200">
            <strong>Rejection Reason:</strong> {org.rejectionReason}
          </div>
        )}

        {org.verificationStatus === 'VERIFIED' ? (
          <p className="text-green-700 font-medium">Your organization is fully verified by CivicLens.</p>
        ) : org.verificationStatus === 'PENDING_VERIFICATION' ? (
          <p className="text-yellow-700 font-medium">Your application is under review by CivicLens administrators.</p>
        ) : (
          <div className="border-t pt-6 mt-4">
            <h3 className="font-bold mb-2">Submit for Verification</h3>
            <p className="text-sm text-gray-600 mb-4">Please upload official registration documents, authorization letters, or ID cards proving your connection to the organization.</p>
            
            <div className="border-2 border-dashed p-8 rounded-xl text-center mb-4 bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <span className="text-blue-600 font-medium">Click to upload documents (Simulated)</span>
              {/* Reuse centralized uploader here */}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting} 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Documents'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Verification Guidelines</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          <li>Documents must be clear and legible.</li>
          <li>Verification documents are strictly private and never shown to the public.</li>
          <li>Only CivicLens administrators can review these documents.</li>
          <li>Approval may take up to 48 hours.</li>
        </ul>
      </div>
    </div>
  );
}
