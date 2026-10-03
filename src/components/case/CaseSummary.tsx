import React from 'react';
import { Info, FileText, Camera, Link as LinkIcon, MessageSquare, MessageCircle, FileSpreadsheet, MapPin, ExternalLink, Crown, Users, Bookmark } from 'lucide-react';
import { TCaseType } from '@/redux/feature/case/case.type';

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
      img: 'https://images.unsplash.com/photo-1541888059039-2708304a37b3?w=200&q=80'
    },
    {
      title: 'বায়ুদূষণ ও নির্মাণকাজের প্রভাব',
      opinions: 14,
      evidence: 6,
      img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200&q=80'
    },
    {
      title: 'রাজধানীর সড়ক প্রশস্তকরণ প্রকল্প',
      opinions: 9,
      evidence: 4,
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&q=80'
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
            <h3 className="font-bold text-slate-900 text-sm leading-tight">Case at a glance</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Key information about this case.</p>
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
              <div className="text-[11px] text-slate-500 font-medium mt-1">Claims</div>
            </div>
          </div>

          {/* Evidence */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Camera size={16} />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-none">{counts.evidence || 8}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Evidence</div>
            </div>
          </div>

          {/* Sources */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <LinkIcon size={16} />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-none">{counts.sources || 3}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Sources</div>
            </div>
          </div>

          {/* Opinions */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <MessageSquare size={16} />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-none">{counts.opinions || 24}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Opinions</div>
            </div>
          </div>

          {/* Discussion */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <MessageCircle size={16} />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-none">{counts.discussion || 16}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Discussion</div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-none">4</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Documents</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Location */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-slate-600" />
          <h3 className="font-bold text-slate-900 text-sm">Location</h3>
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
            <span>View in Google Maps</span>
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
          <h3 className="font-bold text-slate-900 text-sm">Key Insights</h3>
        </div>

        <div className="space-y-3.5">
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/50">
              <Crown size={13} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">{creatorClaimsCount} Creator's Claim</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Original claim by {authorName}</div>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/50">
              <Users size={13} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">{communityClaimsCount} Community Claims</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Claims from community members</div>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/50">
              <Camera size={13} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">{evidenceTotal} Pieces of Evidence</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Photos, documents and other materials</div>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 border border-purple-200/50">
              <MessageSquare size={13} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">{opinionsTotal} Community Opinions</div>
              <div className="text-[11px] text-slate-400 mt-0.5">People have shared their views</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Related Cases */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-600" />
            <h3 className="font-bold text-slate-900 text-sm">Related Cases</h3>
          </div>
          <button className="text-xs text-slate-600 font-semibold hover:underline flex items-center gap-0.5">
            View more →
          </button>
        </div>

        <div className="space-y-3">
          {relatedCases.map((rc, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 group cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img src={rc.img} alt={rc.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-600 transition truncate">
                    {rc.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {rc.opinions} opinions • {rc.evidence} evidence
                  </p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <Bookmark size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
