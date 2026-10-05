import React, { useRef, useState } from 'react';
import { Camera, Video, Link as LinkIcon, Smile, X, Plus, Shield } from 'lucide-react';
import { useCreateOpinionMutation } from '@/redux/feature/opinion/opinion.reducer';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { resolveMediaUrl , getAvatarUrl} from '@/lib/utils';
import AnonymousToggle from '../common/AnonymousToggle';

interface Source {
  title: string;
  externalLinks: string[];
}

export default function OpinionComposer({ targetType, targetId }: { targetType: string, targetId: string }) {
  const [createOpinion, { isLoading: isCreatingOpinion }] = useCreateOpinionMutation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [opinionContent, setOpinionContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  if (!isAuthenticated) return null;
  const getOptions = () => {
    if (targetType === 'CASE') return [
      { value: 'DISCUSSION', label: 'আলোচনা' },
      { value: 'IMPORTANT', label: 'গুরুত্বপূর্ণ' },
      { value: 'NEEDS_MORE_INFORMATION', label: 'আরও তথ্য প্রয়োজন' },
      { value: 'DISPUTED', label: 'বিতর্কিত' }
    ];
    if (targetType === 'CLAIM') return [
      { value: 'SUPPORTED', label: 'সমর্থন করে' },
      { value: 'PARTIALLY_SUPPORTED', label: 'আংশিক সমর্থন' },
      { value: 'INSUFFICIENT_EVIDENCE', label: 'পর্যাপ্ত তথ্য নেই' },
      { value: 'CONTRADICTED', label: 'বিরোধিতা করে' },
      { value: 'DISPUTED', label: 'বিতর্কিত' }
    ];
    if (targetType === 'EVIDENCE') return [
      { value: 'SUPPORTS', label: 'সমর্থন করে' },
      { value: 'CHALLENGES', label: 'চ্যালেঞ্জ করে' },
      { value: 'RELEVANT', label: 'প্রাসঙ্গিক' },
      { value: 'NOT_RELEVANT', label: 'অপ্রাসঙ্গিক' }
    ];
    return [
      { value: 'RELIABLE', label: 'নির্ভরযোগ্য' },
      { value: 'QUESTIONABLE', label: 'প্রশ্নবিদ্ধ' },
      { value: 'NEEDS_VERIFICATION', label: 'যাচাই প্রয়োজন' },
      { value: 'IRRELEVANT', label: 'অপ্রাসঙ্গিক' }
    ];
  };

  const options = getOptions();
  const [opinionValue, setOpinionValue] = useState(options[0].value);
  const [opinionFiles, setOpinionFiles] = useState<File[]>([]);
  const [opinionSources, setOpinionSources] = useState<Source[]>([]);
  
  const [showSourceInputs, setShowSourceInputs] = useState(false);
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePostOpinion = async () => {
    if (!opinionContent.trim()) {
      alert("মতামত লিখুন");
      return;
    }
    const formData = new FormData();
    formData.append("data", JSON.stringify({
      targetType,
      targetId,
      content: opinionContent,
      value: opinionValue,
      isAnonymous,
      sources: opinionSources.map(s => ({
        ...s,
        externalSourceType: 'URL',
        externalSourceName: new URL(s.externalLinks[0]).hostname.replace('www.', '')
      }))
    }));
    
    if (opinionFiles.length > 0) {
      opinionFiles.forEach(file => formData.append("files", file));
    }
    
    try {
      await createOpinion(formData).unwrap();
      alert("মতামত যোগ করা হয়েছে");
      setOpinionContent('');
      setOpinionFiles([]);
      setOpinionSources([]);
      setShowSourceInputs(false);
    } catch (err: any) {
      if (err.status === 401 || err.data?.message === 'jwt expired') {
        alert("আপনার সেশনের মেয়াদ শেষ হয়ে গেছে। দয়া করে আবার লগইন করুন।");
        window.location.href = '/login';
        return;
      }
      alert(err.data?.message || err.error || "Failed to post opinion");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const { processFilesForUpload } = await import('@/lib/image-processor');
        const processedFiles = await processFilesForUpload(Array.from(e.target.files));
        setOpinionFiles(prev => [...prev, ...processedFiles]);
      } catch (err: any) {
        alert(err.message || 'Image processing failed');
      }
    }
  };

  const removeFile = (index: number) => {
    setOpinionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSource = () => {
    if (!sourceTitle.trim() || !sourceUrl.trim()) {
      alert("Title and URL are required for source");
      return;
    }
    try {
      new URL(sourceUrl);
    } catch (e) {
      alert("Invalid URL");
      return;
    }
    setOpinionSources(prev => [...prev, { title: sourceTitle, externalLinks: [sourceUrl] }]);
    setSourceTitle('');
    setSourceUrl('');
    setShowSourceInputs(false);
  };

  const removeSource = (index: number) => {
    setOpinionSources(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`border rounded-xl p-4 sm:p-5 shadow-sm transition-colors ${isAnonymous ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200'}`}>
      <div className="flex gap-3 sm:gap-4">
        {isAnonymous ? (
           <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 shrink-0">
              <Shield size={18} />
           </div>
        ) : (
           <img src={getAvatarUrl(user)} alt="User" className="w-10 h-10 rounded-full shrink-0 border border-slate-200 object-cover" />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
             <div className="text-sm font-bold text-slate-700">
                {isAnonymous ? 'Anonymous Mode' : 'মতামত যোগ করুন'}
             </div>
             <AnonymousToggle isAnonymous={isAnonymous} onChange={setIsAnonymous} />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition">
            <input 
              type="text" 
              value={opinionContent}
              onChange={(e) => setOpinionContent(e.target.value)}
              placeholder="আপনার মতামত লিখুন..." 
              className="flex-1 bg-transparent border-none outline-none text-sm" 
            />
            <div className="flex items-center gap-2 text-slate-400">
               <button onClick={() => fileInputRef.current?.click()} className="hover:text-slate-500 transition" title="ছবি/ভিডিও যোগ করুন"><Camera size={18}/></button>
               <button onClick={() => setShowSourceInputs(!showSourceInputs)} className="hover:text-slate-500 transition" title="উৎস যোগ করুন"><LinkIcon size={18}/></button>
               <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
            </div>
          </div>

          {/* Media Previews */}
          {opinionFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {opinionFiles.map((file, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded bg-slate-100 border border-slate-200">
                  {file.type.startsWith('image') ? (
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">Video</div>
                  )}
                  <button onClick={() => removeFile(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Source Previews */}
          {opinionSources.length > 0 && (
            <div className="mt-3 space-y-2">
              {opinionSources.map((src, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded p-2 text-sm">
                  <div>
                    <div className="font-bold text-slate-700">{src.title}</div>
                    <a href={src.externalLinks[0]} target="_blank" className="text-xs text-slate-500 hover:underline">{src.externalLinks[0]}</a>
                  </div>
                  <button onClick={() => removeSource(idx)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Add Source Form */}
          {showSourceInputs && (
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded p-3 text-sm space-y-2">
              <input type="text" placeholder="উৎস শিরোনাম (Title)" className="w-full p-1.5 border border-slate-200 rounded outline-none" value={sourceTitle} onChange={e => setSourceTitle(e.target.value)} />
              <input type="text" placeholder="লিঙ্ক (URL)" className="w-full p-1.5 border border-slate-200 rounded outline-none" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} />
              <div className="flex justify-end gap-2">
                 <button onClick={() => setShowSourceInputs(false)} className="text-slate-500 font-bold px-3 py-1">বাতিল</button>
                 <button onClick={handleAddSource} className="bg-slate-600 text-white px-3 py-1 rounded font-bold hover:bg-slate-700">যুক্ত করুন</button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <select 
              value={opinionValue} 
              onChange={(e) => setOpinionValue(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none cursor-pointer"
            >
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="flex items-center gap-3">
              <button  
              onClick={handlePostOpinion} 
              disabled={isCreatingOpinion}
              className="bg-slate-600 text-white px-5 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-700 transition disabled:opacity-50"
            >
              {isCreatingOpinion ? 'পোস্টিং...' : 'পোস্ট'}
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
