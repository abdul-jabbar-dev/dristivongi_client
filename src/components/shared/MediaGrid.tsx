import React, { useState, useRef, useEffect } from 'react';
import { FileText, Play, Maximize2, X, Download } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/utils';
import LightboxModal, { LightboxContextInfo } from './LightboxModal';

interface MediaItem {
   url: string;
   type: string;
   name?: string;
}

export default function MediaGrid({ medias = [], compactMode = false, contextInfo }: { medias: MediaItem[], compactMode?: boolean, contextInfo?: LightboxContextInfo }) {
   if (!medias || medias.length === 0) return null;

   const [fullscreenMedia, setFullscreenMedia] = useState<MediaItem | null>(null);
   const popupRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const el = popupRef.current;
      if (!el) return;

      const handleWheel = (e: WheelEvent) => {
         if (e.deltaY !== 0) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
         }
      };

      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
   }, []);

   const renderMediaItem = (m: MediaItem, className: string, key?: string | number) => {
      const isVideo = m.type?.toLowerCase().includes('video');
      const isImage = m.type?.toLowerCase().includes('image');
      const isDocument = !isVideo && !isImage;

      if (isDocument) {
         const ext = m.type?.split('/').pop()?.toUpperCase().substring(0, 3) || 'DOC';
         const isPDF = m.type?.toLowerCase().includes('pdf') || m.url.toLowerCase().endsWith('.pdf');

         return (
            <div key={key} onClick={() => setFullscreenMedia(m)} className={`${className} bg-slate-50 border border-slate-200 flex flex-col items-center justify-center hover:bg-slate-100 transition hover:border-slate-300 group/doc cursor-pointer relative overflow-hidden`}>
               {isPDF ? (
                  <>
                     {/* Background placeholder in case iframe fails to load or browser doesn't support PDF embedding */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                        <FileText size={32} className="mb-2 opacity-50" />
                        <span className="text-[10px] font-bold">PDF FILE</span>
                     </div>

                     {/* Wrapper with overflow hidden to clip iframe scrollbars */}
                     <div className="absolute inset-0 overflow-hidden rounded-lg">
                        <iframe
                           src={`${resolveMediaUrl(m.url)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                           className="absolute w-[calc(100%+24px)] h-[calc(100%+24px)] -top-[12px] -left-[12px] pointer-events-none border-none bg-transparent"
                           title="PDF Preview"
                           scrolling="no"
                           frameBorder="0"
                        />
                     </div>
                     <div className="absolute inset-0 bg-transparent group-hover/doc:bg-black/10 transition z-10 rounded-lg" />

                     {/* Small badge to indicate it's a PDF */}
                     <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-20 shadow-sm">
                        PDF
                     </div>
                  </>
               ) : (
                  <>
                     <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-indigo-100 text-slate-600 flex items-center justify-center shadow-sm mb-2 group-hover/doc:scale-110 transition-transform z-10 relative">
                        <FileText size={24} />
                     </div>
                     <span className="text-[11px] font-extrabold text-slate-500 tracking-wider group-hover/doc:text-slate-700 transition-colors z-10 relative">{ext} FILE</span>
                  </>
               )}
            </div>
         );
      }

      return (
         <div key={key} className={`${className} bg-slate-100 relative group cursor-pointer border border-slate-200 overflow-hidden`} onClick={() => setFullscreenMedia(m)}>
            {isVideo ? (
               <video src={resolveMediaUrl(m.url)} className="w-full h-full object-cover absolute inset-0" controls={false} />
            ) : (
               <img src={resolveMediaUrl(m.url)} alt="Media" className="w-full h-full object-cover absolute inset-0" />
            )}
            {isVideo && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
                  <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                     <Play size={18} className="text-slate-800 ml-1 fill-slate-800" />
                  </div>
               </div>
            )}
         </div>
      );
   };

   const renderVisualGrid = () => {
      if (compactMode) {
         return (
            <div className="flex flex-wrap gap-2">
               {medias.slice(0, 4).map((m, i) => {
                  const isLastVisible = i === 3 && medias.length > 4;

                  if (isLastVisible) {
                     return (
                        <div key={i} className="relative group/more shrink-0">
                           <div className="relative w-[120px] h-[80px] rounded-lg overflow-hidden border border-slate-200 transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-1 hover:shadow-xl hover:z-20 cursor-pointer">
                              {renderMediaItem(m, "w-full h-full border-none rounded-none")}
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] cursor-pointer transition duration-300" onClick={() => setFullscreenMedia(m)}>
                                 <span className="text-white font-bold text-sm">+{medias.length - 4}</span>
                              </div>
                           </div>

                           {/* Popup Grid Above */}
                           <div
                              ref={popupRef}
                              className="absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 invisible opacity-0 translate-y-3 scale-95 group-hover/more:visible group-hover/more:opacity-100 group-hover/more:translate-y-0 group-hover/more:scale-100 transition-all duration-300 ease-out origin-bottom z-[100] max-w-[calc(100vw-32px)] sm:max-w-[340px] flex flex-nowrap overflow-x-auto gap-2 p-2 pointer-events-none group-hover/more:pointer-events-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                           >
                              {medias.slice(4).map((hiddenMedia, hi) => (
                                 <div key={hi} className="relative shrink-0 w-[100px] h-[75px] rounded-xl overflow-hidden shadow-sm cursor-pointer hover:scale-[1.05] hover:shadow-xl hover:ring-2 hover:ring-slate-400/50 transition-all duration-300 ease-out z-10 hover:z-20 border border-slate-200/50" onClick={() => setFullscreenMedia(hiddenMedia)}>
                                    {renderMediaItem(hiddenMedia, "w-full h-full border-none rounded-none")}
                                 </div>
                              ))}
                           </div>
                        </div>
                     );
                  }

                  return (
                     <div key={i} className="relative w-[120px] h-[80px] rounded-lg overflow-hidden border border-slate-200 shrink-0 transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-1 hover:shadow-xl hover:z-20 cursor-pointer">
                        {renderMediaItem(m, "w-full h-full border-none rounded-none")}
                     </div>
                  );
               })}
            </div>
         );
      }

      // Default Big Grid Layout
      if (medias.length === 1) {
         return renderMediaItem(medias[0], "w-full h-[300px] rounded-xl");
      }

      if (medias.length === 2) {
         return (
            <div className="grid grid-cols-2 gap-1.5 h-[300px]">
               {medias.map((m, i) => renderMediaItem(m, "w-full h-full rounded-lg", i))}
            </div>
         );
      }

      if (medias.length === 3) {
         return (
            <div className="grid grid-cols-2 gap-1.5 h-[320px]">
               {renderMediaItem(medias[0], "w-full h-full rounded-lg")}
               <div className="flex flex-col gap-1.5 h-full">
                  {medias.slice(1, 3).map((m, i) => renderMediaItem(m, "w-full flex-1 rounded-lg", i))}
               </div>
            </div>
         );
      }

      // 4 or more
      return (
         <div className="grid grid-cols-2 grid-rows-2 gap-1.5 h-[350px]">
            {medias.slice(0, 4).map((m, i) => {
               const isLast = i === 3 && medias.length > 4;
               return (
                  <div key={i} className="relative w-full h-full rounded-lg overflow-hidden border border-slate-200">
                     {renderMediaItem(m, "w-full h-full border-none rounded-none")}
                     {isLast && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] cursor-pointer hover:bg-black/70 transition" onClick={() => setFullscreenMedia(m)}>
                           <span className="text-white font-bold text-2xl">+{medias.length - 4}</span>
                        </div>
                     )}
                  </div>
               );
            })}
         </div>
      );
   };

   return (
      <div className="w-full">
         {renderVisualGrid()}

         {/* Lightbox Modal */}
         {fullscreenMedia && (
            <LightboxModal 
               medias={medias} 
               initialIndex={medias.findIndex(m => m.url === fullscreenMedia.url)} 
               onClose={() => setFullscreenMedia(null)} 
               contextInfo={contextInfo}
            />
         )}
      </div>
   );
}
