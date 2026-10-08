'use client';
import { useParams } from 'next/navigation';
import { useGetOrganizationBySlugQuery } from '@/redux/feature/organization/organizationApi';
import { Globe, Mail, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react';

export default function OrganizationAboutPage() {
  const { slug } = useParams();
  const { data, isLoading } = useGetOrganizationBySlugQuery(slug as string);

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading details...</div>;

  const org = data?.data?.organization;
  if (!org) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">About this community</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {org.description || 'No description provided.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600 gap-3">
                <CheckCircle className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900 w-24">Status:</span>
                <span className="capitalize">{org.verificationStatus.toLowerCase()}</span>
              </li>
              <li className="flex items-center text-gray-600 gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900 w-24">Created:</span>
                <span>{new Date(org.createdAt).toLocaleDateString()}</span>
              </li>
              <li className="flex items-center text-gray-600 gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900 w-24">Location:</span>
                <span>{org.location || org.address || 'Global'}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Info</h3>
            <ul className="space-y-3">
              {org.website && (
                <li className="flex items-center text-gray-600 gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {org.website}
                  </a>
                </li>
              )}
              {org.email && (
                <li className="flex items-center text-gray-600 gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a href={`mailto:${org.email}`} className="text-blue-600 hover:underline break-all">
                    {org.email}
                  </a>
                </li>
              )}
              {org.phone && (
                <li className="flex items-center text-gray-600 gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a href={`tel:${org.phone}`} className="text-blue-600 hover:underline">
                    {org.phone}
                  </a>
                </li>
              )}
              {!org.website && !org.email && !org.phone && (
                <li className="text-gray-500 italic">No contact information provided.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
