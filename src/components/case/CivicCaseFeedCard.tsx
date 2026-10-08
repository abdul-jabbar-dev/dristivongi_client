'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  FeedItemDTO,
  useToggleFollowCaseMutation,
  useToggleSaveCaseMutation,
  useHideCaseMutation,
  useMarkNotInterestedMutation,
  useMuteOrganizationMutation,
} from '@/redux/feature/feed/feedApi';
import { useSubmitCaseReactionMutation } from '@/redux/feature/case/case.reducer';
import DiscussionComments from '@/components/shared/DiscussionComments';
import LightboxModal from '@/components/shared/LightboxModal';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import { resolveMediaUrl, toBengaliNumber, formatBengaliTime, getAvatarUrl } from '@/lib/utils';
import {
  FileText,
  Shield,
  MapPin,
  MessageSquare,
  FileCheck,
  Bookmark,
  Share2,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Building,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Play,
} from 'lucide-react';

interface CivicCaseFeedCardProps {
  item: FeedItemDTO;
  onHide?: (caseId: string) => void;
}

const CardMediaPreview = ({ media, resolveMediaUrl }: { media: any; resolveMediaUrl: any }) => {
  if (media.label === 'Photo') {
    return (
      <img
        src={resolveMediaUrl(media.url)}
        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
        alt="Evidence"
      />
    );
  }
  if (media.label === 'Video') {
    return (
      <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden group">
        <img
          src={resolveMediaUrl(media.url)}
          className="object-cover w-full h-full opacity-70 group-hover:opacity-60 transition duration-300 group-hover:scale-105"
          alt="Video thumbnail"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border border-white/30">
            <Play size={18} className="text-white fill-white ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[10px] font-bold bg-black/70 px-2 py-0.5 rounded-md backdrop-blur-md">
          <Play size={10} /> ভিডিও
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-500 relative group hover:bg-slate-200 transition p-2">
      {media.type?.includes('pdf') || media.url?.toLowerCase().endsWith('.pdf') ? (
        <iframe
          src={`${resolveMediaUrl(media.url)}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
          className="w-full h-full object-cover pointer-events-none"
          frameBorder="0"
          scrolling="no"
        />
      ) : (
        <FileText size={32} className="text-slate-400 mb-1 group-hover:text-slate-600 transition" />
      )}
      <div className="absolute inset-0 z-10" />
      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-slate-700 text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded-md shadow-xs z-20 border border-slate-200">
        <FileText size={10} /> ডকুমেন্ট
      </div>
    </div>
  );
};

export default function CivicCaseFeedCard({ item, onHide }: CivicCaseFeedCardProps) {
  const { case: c, context } = item;
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Reaction State (Optimistic)
  const initialReaction = c.userInteractions?.currentUserReaction || null;
  const [currentReaction, setCurrentReaction] = useState<'SUPPORT' | 'OPPOSE' | null>(initialReaction);
  const [supportCount, setSupportCount] = useState(c.stats?.supportCount || 0);
  const [opposeCount, setOpposeCount] = useState(c.stats?.opposeCount || 0);

  const [submitReaction, { isLoading: isReacting }] = useSubmitCaseReactionMutation();
  const [toggleFollow, { isLoading: isFollowingLoading }] = useToggleFollowCaseMutation();
  const [toggleSave, { isLoading: isSavingLoading }] = useToggleSaveCaseMutation();
  const [hideCase] = useHideCaseMutation();
  const [markNotInterested] = useMarkNotInterestedMutation();
  const [muteOrg] = useMuteOrganizationMutation();

  const [isFollowing, setIsFollowing] = useState(c.userInteractions?.isFollowing || false);
  const [isSaved, setIsSaved] = useState(c.userInteractions?.isSaved || false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract all media from case and claims
  const allMedias: { type: string; url: string; label: string }[] = [];
  c.medias?.forEach((m) => {
    const mime = m.media?.type?.toLowerCase() || '';
    let label = 'Photo';
    if (mime.includes('video')) label = 'Video';
    else if (mime.includes('pdf') || mime.includes('document')) label = 'Document';
    if (m.media?.url) allMedias.push({ type: mime || 'IMAGE', url: m.media.url, label });
  });

  c.claims?.forEach((claim) => {
    claim.evidence?.forEach((ce) => {
      ce.evidence?.medias?.forEach((em) => {
        const mime = em.media?.type?.toLowerCase() || '';
        let label = 'Photo';
        if (mime.includes('video')) label = 'Video';
        else if (mime.includes('pdf') || mime.includes('document')) label = 'Document';
        if (em.media?.url) allMedias.push({ type: mime || 'IMAGE', url: em.media.url, label });
      });
    });
  });

  const validMedias = allMedias.filter((m) => m.url);

  // Handle Support / Oppose Reaction
  const handleReactionClick = async (reactionType: 'SUPPORT' | 'OPPOSE') => {
    if (!isAuthenticated) {
      alert('প্রতিক্রিয়া জানাতে অনুগ্রহ করে লগইন করুন।');
      return;
    }

    const prevReaction = currentReaction;
    const prevSupport = supportCount;
    const prevOppose = opposeCount;

    let nextReaction: 'SUPPORT' | 'OPPOSE' | null = null;
    let nextSupport = supportCount;
    let nextOppose = opposeCount;

    if (prevReaction === reactionType) {
      nextReaction = null;
      if (reactionType === 'SUPPORT') nextSupport = Math.max(0, supportCount - 1);
      if (reactionType === 'OPPOSE') nextOppose = Math.max(0, opposeCount - 1);
    } else {
      nextReaction = reactionType;
      if (prevReaction === 'SUPPORT') nextSupport = Math.max(0, supportCount - 1);
      if (prevReaction === 'OPPOSE') nextOppose = Math.max(0, opposeCount - 1);

      if (reactionType === 'SUPPORT') nextSupport = nextSupport + 1;
      if (reactionType === 'OPPOSE') nextOppose = nextOppose + 1;
    }

    setCurrentReaction(nextReaction);
    setSupportCount(nextSupport);
    setOpposeCount(nextOppose);

    try {
      await submitReaction({
        caseId: c.id,
        value: nextReaction === null ? 'NONE' : nextReaction,
      }).unwrap();
    } catch {
      setCurrentReaction(prevReaction);
      setSupportCount(prevSupport);
      setOpposeCount(prevOppose);
    }
  };

  const handleFollowClick = async () => {
    setIsFollowing(!isFollowing);
    try {
      await toggleFollow(c.id).unwrap();
    } catch {
      setIsFollowing(isFollowing);
    }
  };

  const handleSaveClick = async () => {
    setIsSaved(!isSaved);
    try {
      await toggleSave(c.id).unwrap();
    } catch {
      setIsSaved(isSaved);
    }
  };

  const handleHideClick = async () => {
    setIsMenuOpen(false);
    try {
      await hideCase(c.id).unwrap();
      if (onHide) onHide(c.id);
    } catch {
      alert('Failed to hide case');
    }
  };

  const handleNotInterestedClick = async () => {
    setIsMenuOpen(false);
    try {
      await markNotInterested(c.id).unwrap();
      if (onHide) onHide(c.id);
    } catch {
      alert('Failed to update preference');
    }
  };

  const handleMuteOrgClick = async () => {
    if (!c.organization?.id) return;
    setIsMenuOpen(false);
    try {
      await muteOrg(c.organization.id).unwrap();
      if (onHide) onHide(c.id);
    } catch {
      alert('Failed to mute organization');
    }
  };

  const handleShareClick = () => {
    const url = `${window.location.origin}/case/${c.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const caseUrl = `/case/${c.id}`;
  const authorUrl = c.isAnonymous
    ? '#'
    : c.author?.userName
    ? `/profile/${c.author.userName}`
    : `/profile/${c.author?.id}`;

  const timeAgo = (dateStr: string) => {
    try {
      return formatBengaliTime(dateStr);
    } catch {
      return 'সম্প্রতি';
    }
  };

  const officialResponse =
    c.officialResponses && c.officialResponses.length > 0 ? c.officialResponses[0] : null;

  return (
    <article className="w-full max-w-full min-w-0 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-3.5 break-words">
      {/* Small Organization Top Tag if Case belongs to an Organization */}
      {c.organization && (
        <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 text-xs text-slate-500 min-w-0">
          <Link
            href={`/org/${c.organization.slug}`}
            className="inline-flex items-center gap-1.5 font-bold text-slate-800 hover:text-blue-600 transition truncate group min-w-0"
          >
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden shrink-0 shadow-2xs">
              {c.organization.logoUrl ? (
                <img src={c.organization.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                c.organization.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="truncate">{c.organization.name}</span>
          </Link>
          <span className="text-[10px] text-slate-300">·</span>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
            সংগঠন
          </span>
        </div>
      )}

      {/* Creator / Author Identity Header */}
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
          <Link href={authorUrl} className="relative flex-shrink-0 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm overflow-hidden ring-2 ring-transparent group-hover:ring-blue-400 transition-all shrink-0 border border-slate-200">
              {c.isAnonymous ? (
                <Shield className="w-4 h-4 text-slate-600" />
              ) : c.author?.userProfile?.profilePicture ? (
                <img
                  src={resolveMediaUrl(c.author.userProfile.profilePicture)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                c.author?.fullName?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
          </Link>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <Link
                href={authorUrl}
                className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-sm truncate max-w-[200px] sm:max-w-xs"
              >
                {c.isAnonymous ? 'গোপন নাগরিক (Whistleblower)' : c.author?.fullName || 'নাগরিক'}
              </Link>
              {c.isAnonymous && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold shrink-0">
                  গোপন
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 min-w-0 truncate">
              <span className="shrink-0">{timeAgo(c.createdAt)}</span>
              {c.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 truncate text-slate-600">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{c.location}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top Right Menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-30 text-xs animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={handleShareClick}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                {copied ? 'লিঙ্ক কপি হয়েছে!' : 'লিঙ্ক কপি করুন'}
              </button>

              <button
                onClick={handleSaveClick}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                {isSaved ? 'সংরক্ষণ তালিকা থেকে সরান' : 'কেসটি সংরক্ষণ করুন'}
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={handleHideClick}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                কেসটি লুকান (Hide)
              </button>

              <button
                onClick={handleNotInterestedClick}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                আগ্রহী নই (Not Interested)
              </button>

              {c.organization && (
                <button
                  onClick={handleMuteOrgClick}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-amber-700 hover:bg-amber-50 text-left transition-colors"
                >
                  <Building className="w-3.5 h-3.5 text-amber-500" />
                  {c.organization.name} মিউট করুন
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Case Content rendered according to DB format */}
      <div className="space-y-2 min-w-0 overflow-hidden break-words">
        <div className="text-[15px] sm:text-base text-slate-800 leading-relaxed overflow-hidden break-words [overflow-wrap:anywhere]">
          <MarkdownRenderer content={c.titleHtml || c.title} />
        </div>

        {c.claims && c.claims.length > 0 && (
          <div className="bg-slate-50/80 border-l-3 border-blue-600 rounded-r-xl p-2.5 text-xs text-slate-700 min-w-0 break-words [overflow-wrap:anywhere] break-all">
            <span className="font-bold text-blue-900 block text-[11px] mb-0.5">প্রধান দাবি:</span>
            {c.claims[0].title}
          </div>
        )}

        {/* Multimedia Grid Layout */}
        {validMedias.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-slate-200/90 w-full">
            <div className="relative w-full">
              {/* 1 Item */}
              {validMedias.length === 1 && (
                <div
                  onClick={() => setPreviewIndex(0)}
                  className="relative w-full max-h-[380px] min-h-[220px] bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  <CardMediaPreview media={validMedias[0]} resolveMediaUrl={resolveMediaUrl} />
                </div>
              )}

              {/* 2 Items */}
              {validMedias.length === 2 && (
                <div className="grid grid-cols-2 gap-1 bg-white h-[260px] sm:h-[300px] cursor-pointer">
                  <div onClick={() => setPreviewIndex(0)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                    <CardMediaPreview media={validMedias[0]} resolveMediaUrl={resolveMediaUrl} />
                  </div>
                  <div onClick={() => setPreviewIndex(1)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                    <CardMediaPreview media={validMedias[1]} resolveMediaUrl={resolveMediaUrl} />
                  </div>
                </div>
              )}

              {/* 3 Items */}
              {validMedias.length === 3 && (
                <div className="grid grid-cols-2 gap-1 bg-white h-[300px] sm:h-[340px] cursor-pointer">
                  <div onClick={() => setPreviewIndex(0)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                    <CardMediaPreview media={validMedias[0]} resolveMediaUrl={resolveMediaUrl} />
                  </div>
                  <div className="grid grid-rows-2 gap-1 h-full">
                    <div onClick={() => setPreviewIndex(1)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                      <CardMediaPreview media={validMedias[1]} resolveMediaUrl={resolveMediaUrl} />
                    </div>
                    <div onClick={() => setPreviewIndex(2)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                      <CardMediaPreview media={validMedias[2]} resolveMediaUrl={resolveMediaUrl} />
                    </div>
                  </div>
                </div>
              )}

              {/* 4 Items */}
              {validMedias.length === 4 && (
                <div className="grid grid-rows-2 gap-1 bg-white h-[340px] sm:h-[380px] cursor-pointer">
                  <div onClick={() => setPreviewIndex(0)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                    <CardMediaPreview media={validMedias[0]} resolveMediaUrl={resolveMediaUrl} />
                  </div>
                  <div className="grid grid-cols-3 gap-1 h-full">
                    <div onClick={() => setPreviewIndex(1)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                      <CardMediaPreview media={validMedias[1]} resolveMediaUrl={resolveMediaUrl} />
                    </div>
                    <div onClick={() => setPreviewIndex(2)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                      <CardMediaPreview media={validMedias[2]} resolveMediaUrl={resolveMediaUrl} />
                    </div>
                    <div onClick={() => setPreviewIndex(3)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                      <CardMediaPreview media={validMedias[3]} resolveMediaUrl={resolveMediaUrl} />
                    </div>
                  </div>
                </div>
              )}

              {/* 5+ Items */}
              {validMedias.length >= 5 && (
                <div className="grid grid-rows-[2fr_1fr] gap-1 bg-white h-[360px] sm:h-[400px] cursor-pointer">
                  <div className="grid grid-cols-2 gap-1 h-full">
                    <div onClick={() => setPreviewIndex(0)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                      <CardMediaPreview media={validMedias[0]} resolveMediaUrl={resolveMediaUrl} />
                    </div>
                    <div onClick={() => setPreviewIndex(1)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                      <CardMediaPreview media={validMedias[1]} resolveMediaUrl={resolveMediaUrl} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 h-full">
                    <div onClick={() => setPreviewIndex(2)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                      <CardMediaPreview media={validMedias[2]} resolveMediaUrl={resolveMediaUrl} />
                    </div>
                    <div onClick={() => setPreviewIndex(3)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                      <CardMediaPreview media={validMedias[3]} resolveMediaUrl={resolveMediaUrl} />
                    </div>
                    <div onClick={() => setPreviewIndex(4)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                      <CardMediaPreview media={validMedias[4]} resolveMediaUrl={resolveMediaUrl} />
                      {validMedias.length > 5 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-2xs">
                          <span className="text-white text-xl sm:text-2xl font-bold">+{validMedias.length - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Official Response Highlight */}
        {officialResponse && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-900 flex items-start gap-2 min-w-0 break-words [overflow-wrap:anywhere]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="font-bold block truncate text-[11px]">
                {officialResponse.organization?.name || 'সংগঠন'}-এর অফিসিয়াল প্রতিক্রিয়া:
              </span>
              <p className="mt-0.5 text-emerald-800 line-clamp-2 break-words [overflow-wrap:anywhere] text-xs">
                {officialResponse.content}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Civic Metrics Counters */}
      <div className="flex flex-wrap items-center gap-3 py-1.5 border-y border-slate-100 text-xs text-slate-500 min-w-0">
        <div className="flex items-center gap-1 font-medium shrink-0">
          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{toBengaliNumber(c.stats?.evidenceCount || validMedias.length || 0)} প্রমাণাদি</span>
        </div>

        <div className="flex items-center gap-1 font-medium shrink-0">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>{toBengaliNumber(c.stats?.sourceCount || 0)} উৎস</span>
        </div>

        <div className="flex items-center gap-1 font-medium shrink-0">
          <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
          <span>{toBengaliNumber(c.stats?.discussionCount || 0)} মতামত</span>
        </div>

        <div className="flex items-center gap-1 font-medium ml-auto shrink-0 text-slate-400 text-[11px]">
          <Eye className="w-3.5 h-3.5" />
          <span>{toBengaliNumber(c.stats?.viewCount || 0)} বার দেখা হয়েছে</span>
        </div>
      </div>

      {/* Bottom Action Bar: Grouped Stance (Support/Oppose), Discussion toggle, and Utilities */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Professional Grouped Stance Button: Support | Oppose */}
          <div className="inline-flex items-center rounded-xl bg-slate-50 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => handleReactionClick('SUPPORT')}
              disabled={isReacting}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentReaction === 'SUPPORT'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-white'
              }`}
              title="সমর্থন করুন"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${currentReaction === 'SUPPORT' ? 'fill-current' : ''}`} />
              <span>সমর্থন</span>
              {supportCount > 0 && <span className="text-[11px] font-bold ml-0.5">{toBengaliNumber(supportCount)}</span>}
            </button>

            <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

            <button
              type="button"
              onClick={() => handleReactionClick('OPPOSE')}
              disabled={isReacting}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentReaction === 'OPPOSE'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:text-rose-700 hover:bg-white'
              }`}
              title="অসমর্থন বা আপত্তি জানান"
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${currentReaction === 'OPPOSE' ? 'fill-current' : ''}`} />
              <span>অসমর্থন</span>
              {opposeCount > 0 && <span className="text-[11px] font-bold ml-0.5">{toBengaliNumber(opposeCount)}</span>}
            </button>
          </div>

          {/* Minimalist Discussion / Comment Toggle */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showComments
                ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="মতামত ও আলোচনা দেখুন"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>মতামত</span>
            {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Right Action Controls: Follow, Save, Share, View details */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleFollowClick}
            disabled={isFollowingLoading}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isFollowing
                ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title={isFollowing ? 'Following' : 'Follow Case'}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isFollowing ? 'অনুসরণ করছেন' : 'অনুসরণ'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSavingLoading}
            className={`p-1.5 rounded-xl border transition-all ${
              isSaved
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title={isSaved ? 'সংরক্ষিত' : 'সংরক্ষণ করুন'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleShareClick}
            className="p-1.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            title="শেয়ার করুন"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <Link
            href={caseUrl}
            className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs text-center"
          >
            বিস্তারিত
          </Link>
        </div>
      </div>

      {/* Minimalist Collapsible Comments Section */}
      {showComments && (
        <div className="pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
          <DiscussionComments 
            targetType="CASE" 
            targetId={c.id} 
            mentionSuggestions={(c.claims || []).map((cl: any) => ({
              id: cl.id,
              type: 'CLAIM',
              prefix: '#claim-',
              title: cl.title,
              author: cl.creator?.fullName,
              date: cl.createdAt
            }))}
            userSuggestions={c.author ? [{
              id: c.author.id,
              userName: c.author.userName || (c.author.fullName ? c.author.fullName.toLowerCase().replace(/\s+/g, '') : c.author.id),
              fullName: c.author.fullName || c.author.userName,
              avatar: getAvatarUrl(c.author),
              role: 'লেখক'
            }] : []}
          />
        </div>
      )}

      {/* Fullscreen Lightbox Modal on click */}
      {previewIndex !== null && validMedias[previewIndex] && (
        <LightboxModal
          medias={validMedias}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
          contextInfo={{
            authorName: c.author?.fullName || c.author?.userName || 'Anonymous',
            authorAvatar: resolveMediaUrl(c.author?.userProfile?.profilePicture || (c.author as any)?.avatar),
            title: c.title,
            content: c.claims && c.claims.length > 0 ? c.claims[0].title : c.title,
            date: formatBengaliTime(c.createdAt),
          }}
        />
      )}
    </article>
  );
}
