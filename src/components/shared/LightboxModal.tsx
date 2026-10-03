import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, FileText, Download } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/utils';

export interface LightboxMedia {
   url: string;
   type: string;
   label?: string;
}

export interface LightboxContextInfo {
   authorName?: string;
   authorAvatar?: string;
   title?: string;
   subtitle?: string;
   content?: string;
   date?: string;
   links?: { url: string; title?: string }[];
}

interface LightboxModalProps {
   medias: LightboxMedia[];
   initialIndex: number;
   onClose: () => void;
   contextInfo?: LightboxContextInfo;
}

export default function LightboxModal({ medias, initialIndex, onClose, contextInfo }: LightboxModalProps) {
   const [currentIndex, setCurrentIndex] = useState(initialIndex);
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
   }, []);

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === 'Escape') onClose();
         if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(currentIndex - 1);
         if (e.key === 'ArrowRight' && currentIndex < medias.length - 1) setCurrentIndex(currentIndex + 1);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [currentIndex, medias.length, onClose]);

   const currentMedia = medias[currentIndex];
   if (!currentMedia) return null;

   const isVideo = currentMedia.type?.toLowerCase().includes('video');
   const isDocument = currentMedia.type?.toLowerCase().includes('pdf') || currentMedia.url.toLowerCase().endsWith('.pdf');

   const renderThumbnail = (m: LightboxMedia) => {
      const v = m.type?.toLowerCase().includes('video');
      const d = m.type?.toLowerCase().includes('pdf') || m.url.toLowerCase().endsWith('.pdf');
      
      if (v) {
         return (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
               <Play size={16} className="text-white opacity-70" />
            </div>
         );
      }
      if (d) {
         return (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
               <FileText size={20} />
            </div>
         );
      }
      return <img src={resolveMediaUrl(m.url)} className="w-full h-full object-cover" alt="thumbnail" />;
   };

   if (!mounted) return null;

   return createPortal(
      <div className="fixed inset-0 z-[999999] bg-black/80 flex items-center justify-center p-2 md:p-6 backdrop-blur-sm" onClick={onClose}>
         {/* Close Button Top Right */}
         <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-2 rounded-full z-50 transition border border-white/10 shadow-lg"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
         >
            <X size={24} />
         </button>
         
         {/* Main Modal Container */}
         <div 
            className="w-full max-w-[1400px] h-[90vh] flex flex-col md:flex-row bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" 
            onClick={(e) => e.stopPropagation()}
         >
            {/* Left Media Pane */}
            <div className="flex-1 relative flex flex-col items-center justify-center bg-black overflow-hidden group">
               {isVideo ? (
                  <video src={resolveMediaUrl(currentMedia.url)} controls autoPlay className="max-w-full max-h-full object-contain" />
               ) : isDocument ? (
                  <iframe src={`${resolveMediaUrl(currentMedia.url)}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`} className="w-full h-full object-contain bg-white" frameBorder="0" scrolling="yes" />
               ) : (
                  <img src={resolveMediaUrl(currentMedia.url)} alt="preview" className="max-w-full max-h-full object-contain" />
               )}
               
               {/* Left/Right Arrows */}
               {currentIndex > 0 && (
                  <button 
                     className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition z-40 shadow-lg border border-white/10 hover:scale-110 opacity-0 group-hover:opacity-100"
                     onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex - 1); }}
                  >
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
               )}
               
               {currentIndex < medias.length - 1 && (
                  <button 
                     className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition z-40 shadow-lg border border-white/10 hover:scale-110 opacity-0 group-hover:opacity-100"
                     onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex + 1); }}
                  >
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
               )}

               {/* Counter */}
               {medias.length > 1 && (
                  <div className="absolute top-4 left-4 text-white/90 text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full z-40 backdrop-blur-md border border-white/10">
                     {currentIndex + 1} / {medias.length}
                  </div>
               )}

               {/* Download Button */}
               <a 
                  href={resolveMediaUrl(currentMedia.url)} 
                  download 
                  target="_blank" 
                  rel="noreferrer"
                  className="absolute top-4 right-4 text-white/90 bg-black/50 hover:bg-black/80 p-2 rounded-full z-40 backdrop-blur-md border border-white/10 transition shadow-lg hover:scale-110 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                  title="Download Media"
               >
                  <Download size={16} /> <span className="text-xs font-bold hidden md:inline-block">Download</span>
               </a>

               {/* Bottom Thumbnail Strip Overlay */}
               {medias.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center gap-2 max-w-full overflow-x-auto scrollbar-hide z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     {medias.map((m, idx) => (
                        <div 
                           key={idx}
                           className={`h-12 w-12 md:h-16 md:w-16 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 ${idx === currentIndex ? 'border-white opacity-100 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}`}
                           onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                        >
                           {renderThumbnail(m)}
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Right Details/Comments Pane */}
            <div className="w-full md:w-[360px] lg:w-[400px] h-[30vh] md:h-full bg-white flex flex-col shrink-0 overflow-y-auto">
               {contextInfo ? (
                  <>
                     <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                        <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden border border-slate-200">
                           <img src={contextInfo.authorAvatar || 'https://i.pravatar.cc/150'} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-bold text-sm text-slate-800 truncate">{contextInfo.authorName || 'Anonymous'}</p>
                           {contextInfo.date && <p className="text-[10px] text-slate-500">{contextInfo.date}</p>}
                        </div>
                     </div>
                     
                     <div className="flex-1 p-4 flex flex-col gap-4 text-slate-800 text-sm overflow-y-auto">
                        {contextInfo.title && (
                           <h2 className="font-bold text-base">{contextInfo.title}</h2>
                        )}
                        {contextInfo.subtitle && (
                           <h3 className="font-semibold text-slate-600 text-xs">{contextInfo.subtitle}</h3>
                        )}
                        {contextInfo.content && (
                           <p className="whitespace-pre-wrap leading-relaxed">{contextInfo.content}</p>
                        )}
                        
                        {contextInfo.links && contextInfo.links.length > 0 && (
                           <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Links</p>
                              {contextInfo.links.map((link, idx) => (
                                 <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-xs break-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                    <span className="font-medium line-clamp-1">{link.title || link.url}</span>
                                 </a>
                              ))}
                           </div>
                        )}
                     </div>
                  </>
               ) : (
                  <>
                     <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden">
                           <img src="https://i.pravatar.cc/150" className="w-full h-full object-cover" />
                        </div>
                        <div>
                           <p className="font-bold text-sm text-slate-800">Media Details</p>
                           <p className="text-xs text-slate-500">More details and comments can go here</p>
                        </div>
                     </div>
                     
                     <div className="flex-1 p-4 flex flex-col items-center justify-center text-slate-400">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium">No details available</p>
                        <p className="text-xs mt-1 text-center px-4">This media has no associated text or links.</p>
                     </div>
                  </>
               )}
            </div>
         </div>
      </div>,
      document.body
   );
}
