import React from 'react';
import Link from 'next/link';
import ENV from '@/lib/config';
import CaseDetailsClient from '@/components/case/CaseDetailsClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await fetch(`${ENV.API_URL}/case/get_case/${id}`, { cache: 'no-store' });
    const json = await res.json();
    const data = json.data;
    if (data) {
      return {
        title: `${data.title} | Drishtivongi`,
        description: data.claims?.[0]?.statement || 'Case details on Drishtivongi',
      };
    }
  } catch (error) {
    // fallback
  }
  return { title: 'Case Details | Drishtivongi' };
}

export default async function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let caseData = null;
  let error = false;

  try {
    const res = await fetch(`${ENV.API_URL}/case/get_case/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      error = true;
    } else {
      const json = await res.json();
      caseData = json.data;
    }
  } catch (err) {
    error = true;
  }

  let opinions: any[] = [];
  try {
     const opRes = await fetch(`${ENV.API_URL}/opinions?targetType=CASE&targetId=${id}`, { cache: 'no-store' });
     if (opRes.ok) {
        const opJson = await opRes.json();
        opinions = opJson.data || [];
     }
  } catch(e) {}

  if (error || !caseData) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-100 text-red-700 rounded-xl text-center">
          <p className="mb-4">তথ্য লোড করা যায়নি। (Error loading case details)</p>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition">
            <Link href="/">ফিরে যান</Link>
          </button>
        </div>
      </div>
    );
  }

  return <CaseDetailsClient id={id} initialData={caseData} initialOpinions={opinions} />;
}
