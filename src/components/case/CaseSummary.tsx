import React from 'react';
import { Info, FileText, Camera, Link as LinkIcon, MessageSquare, MessageCircle, FileSpreadsheet, MapPin, ExternalLink, Crown, Users, Bookmark } from 'lucide-react';
import { TCaseType } from '@/redux/feature/case/case.type';
import { useNewsFeedQuery } from '@/redux/feature/case/case.reducer';
import { resolveMediaUrl } from '@/lib/utils';
import Link from 'next/link';

export default function CaseSummary({ 
  caseData, 
  counts 
}: { 
  caseData: TCaseType, 
  counts: { claims: number, evidence: number, sources: number, opinions: number, discussion: number } 
}) {
  const authorName = (caseData as any).author?.fullName || 'Tanvir Hasan';
  const locationName = caseData.location || 'Dhaka, Bangladesh';

  const authorId = (caseData as any).authorId || (caseData as any).author?.id;
  const creatorClaimsCount = (caseData.claims || []).filter((c: any, i: number) => c.createdBy === authorId || i === 0).length || 1;
  const communityClaimsCount = (caseData.claims || []).filter((c: any, i: number) => c.createdBy !== authorId && i !== 0).length || 11;
  const evidenceTotal = counts.evidence || 8;
  const opinionsTotal = counts.opinions || 24;

  const relatedCases = [
    {
      title: 'ঢাকা মেট্রোরেল নির্মাণ এবং যানজট',
      opinions: 28,
      evidence: 12,
      img: 'data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3ENo Image Available%3C/text%3E%3C/svg%3E'
    },
    {
      title: 'বায়ুদূষণ ও নির্মাণকাজের প্রভাব',
      opinions: 14,
      evidence: 6,
      img: 'data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3ENo Image Available%3C/text%3E%3C/svg%3E'
    },
    {
      title: 'রাজধানীর সড়ক প্রশস্তকরণ প্রকল্প',
      opinions: 9,
      evidence: 4,
      img: 'data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3ENo Image Available%3C/text%3E%3C/svg%3E'
    }
  ];

  return (
    <div className="space-y-5">
      {/* 1. Case at a glance */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex items-start gap-2 mb-3.5">
          <div className="w-5 h-5 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
            <Info size={13} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">এক নজরে বিষয়টি</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">এই বিষয় সম্পর্কে গুরুত্বপূর্ণ তথ্য।</p>
          </div>
        </div>

        {/* 2x3 Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Claims */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-none">{counts.claims || 12}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">দাবি</div>
            </div>
          </div>

          {/* Evidence */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Camera size={16} />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-none">{counts.evidence || 8}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">তথ্য-প্রমাণ</div>
            </div>
          </div>

          {/* Sources */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <LinkIcon size={16} />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-none">{counts.sources || 3}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">উৎস</div>
            </div>
          </div>

          {/* Opinions */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <MessageSquare size={16} />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-none">{counts.opinions || 24}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">মতামত</div>
            </div>
          </div>

          {/* Discussion */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <MessageCircle size={16} />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-none">{counts.discussion || 16}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">আলোচনা</div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-none">4</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">দলিল</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Location */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-slate-600" />
          <h3 className="font-bold text-slate-900 text-sm">স্থান</h3>
        </div>

        {/* Map Graphic Preview */}
        <div className="h-32 rounded-xl overflow-hidden relative bg-slate-50/50 border border-slate-100 mb-3 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#93c5fd" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path d="M 10 30 Q 80 80 160 50 T 280 90" fill="none" stroke="#60a5fa" strokeWidth="3" />
            <path d="M 50 110 Q 120 40 220 70 T 320 30" fill="none" stroke="#3b82f6" strokeWidth="2" />
          </svg>
          
          {/* Map Pin marker */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              <MapPin size={14} />
            </div>
            <span className="text-[10px] font-bold text-slate-800 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-2xs mt-1 border border-slate-200">
              Dhaka
            </span>
          </div>

          <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(locationName)}`}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-2.5 right-2.5 bg-white/95 hover:bg-white text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-2xs border border-slate-200 flex items-center gap-1 transition"
          >
            <span>Google Maps-এ দেখুন</span>
            <ExternalLink size={10} />
          </a>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <MapPin size={13} className="text-slate-400" />
          <span>{locationName}</span>
        </div>
      </div>

      {/* 3. Key Insights */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Crown size={16} className="text-amber-500" />
          <h3 className="font-bold text-slate-900 text-sm">গুরুত্বপূর্ণ তথ্য</h3>
        </div>

        <div className="space-y-3.5">
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/50">
              <Crown size={13} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">{creatorClaimsCount}টি মূল দাবি</div>
              <div className="text-[11px] text-slate-400 mt-0.5">দাবিটি তুলেছেন {authorName}</div>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/50">
              <Users size={13} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">{communityClaimsCount}টি ব্যবহারকারীদের দাবি</div>
              <div className="text-[11px] text-slate-400 mt-0.5">ব্যবহারকারীদের যুক্ত করা দাবি</div>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/50">
              <Camera size={13} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">{evidenceTotal}টি তথ্য-প্রমাণ</div>
              <div className="text-[11px] text-slate-400 mt-0.5">ছবি, দলিল ও অন্যান্য তথ্য</div>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 border border-purple-200/50">
              <MessageSquare size={13} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">{opinionsTotal} জনের মতামত</div>
              <div className="text-[11px] text-slate-400 mt-0.5">ব্যবহারকারীরা মতামত জানিয়েছেন</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Related Cases */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-600" />
            <h3 className="font-bold text-slate-900 text-sm">সম্পর্কিত বিষয়সমূহ</h3>
          </div>
          <button className="text-xs text-slate-600 font-semibold hover:underline flex items-center gap-0.5">
            আরও দেখুন →
          </button>
        </div>

        <div className="space-y-3">
          {relatedCases.map((rc, idx) => (
            <Link key={idx} href={`/case/${rc.id}`} className="flex items-center justify-between gap-3 group cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img src={rc.img} alt={rc.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-600 transition truncate">
                    {rc.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {rc.opinions} মতামত • {rc.evidence} তথ্য-প্রমাণ
                  </p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <Bookmark size={14} />
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
