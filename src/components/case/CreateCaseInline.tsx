import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, MapPin, Grid, Image as ImageIcon, Video, FileText, Info, Globe, Send, FilePlus, Bold, Italic, List, Quote, Link, Hash } from 'lucide-react';
import { useCreateCaseMutation, useImportUrlMutation } from '@/redux/feature/case/case.reducer';
import { useSearchTagsQuery } from '@/redux/feature/tag/tag.reducer';
import { sanitizePastedHtml } from '@/utils/sanitizePaste';

const MediaPreview = ({ file }: { file: File }) => {
  if (file.type.startsWith('image/')) {
    return <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />;
  } else if (file.type === 'application/pdf') {
    return (
      <div className="w-full h-full overflow-hidden">
        <iframe 
          src={`${URL.createObjectURL(file)}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`} 
          className="w-full h-full border-none pointer-events-none overflow-hidden scale-[1.02]" 
          scrolling="no"
          title="PDF Preview"
        />
      </div>
    );
  } else if (file.type.startsWith('video/')) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4">
        <Video size={36} className="mb-2 text-slate-400" />
        <span className="text-xs font-medium text-center truncate w-full px-2">{file.name}</span>
      </div>
    );
  } else {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4">
        <FileText size={36} className="mb-2 text-slate-400" />
        <span className="text-xs font-medium text-center truncate w-full px-2">{file.name}</span>
      </div>
    );
  }
};

const DraggableGridItem = ({ index, file, handleDragStart, handleDrop, setPreviewMediaIndex, children, className }: any) => {
  return (
    <div
      className={`relative h-full w-full bg-slate-100 cursor-grab active:cursor-grabbing hover:opacity-95 transition overflow-hidden ${className || ''}`}
      draggable
      onDragStart={(e) => handleDragStart(e, index)}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
      onDrop={(e) => handleDrop(e, index)}
      onClick={(e) => {
        // Only trigger preview if we didn't just drag
        setPreviewMediaIndex(index);
      }}
    >
      <MediaPreview file={file} />
      {children}
    </div>
  );
};

export default function CreateCaseInline({ onClose, onSuccess, imgUrl }: { onClose: () => void, onSuccess?: () => void, imgUrl: string }) {
  const [createCaseMutation, { isLoading }] = useCreateCaseMutation();
  const [importUrlMutation] = useImportUrlMutation();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const { data: tagSuggestionsData } = useSearchTagsQuery(tagInput.replace(/^#/, ''), {
    skip: !tagInput || tagInput.length < 1,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewMediaIndex, setPreviewMediaIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    
    const newFiles = [...selectedFiles];
    const item = newFiles.splice(draggedIndex, 1)[0];
    newFiles.splice(targetIndex, 0, item);
    setSelectedFiles(newFiles);
    
    if (previewMediaIndex !== null) {
      if (draggedIndex === previewMediaIndex) {
        setPreviewMediaIndex(targetIndex);
      } else if (draggedIndex < previewMediaIndex && targetIndex >= previewMediaIndex) {
        setPreviewMediaIndex(previewMediaIndex - 1);
      } else if (draggedIndex > previewMediaIndex && targetIndex <= previewMediaIndex) {
        setPreviewMediaIndex(previewMediaIndex + 1);
      }
    }
    
    setDraggedIndex(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const htmlData = e.clipboardData.getData('text/html');
    const plainText = e.clipboardData.getData('text/plain');
    
    if (htmlData) {
      const { cleanHtml, mediaUrlsToImport } = sanitizePastedHtml(htmlData);
      document.execCommand('insertHTML', false, cleanHtml);
      
      // Fire off background imports for extracted media
      mediaUrlsToImport.forEach(async (media) => {
        try {
          const res = await importUrlMutation({ url: media.url }).unwrap();
          if (res?.data?.url) {
            // Find the placeholder in the DOM and update its src
            const el = document.getElementById(media.id);
            if (el) {
              el.setAttribute('src', res.data.url);
              el.style.opacity = '1';
              handleEditorInput(); // Update state with new src
            }
          }
        } catch (err: any) {
           console.error("Failed to import media", err);
           // Optionally, if import fails, we could remove the placeholder or show a broken image.
           const el = document.getElementById(media.id);
           if (el) {
              el.style.opacity = '1';
              // Fallback to original external URL if you prefer, or leave it broken
              el.setAttribute('src', media.url); 
              handleEditorInput();
           }
        }
      });
      
    } else if (plainText) {
      document.execCommand('insertText', false, plainText);
    }
    
    // Slight delay to ensure DOM updates before reading innerHTML
    setTimeout(() => {
      handleEditorInput();
    }, 0);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setTitle(html);

      // Simple detection: if the last typed word starts with #
      const text = editorRef.current.innerText || "";
      const words = text.split(/\s+/);
      const lastWord = words[words.length - 1];

      if (lastWord && lastWord.startsWith('#') && lastWord.length < 20) {
        setTagInput(lastWord);
        setShowTagSuggestions(true);
      } else {
        setShowTagSuggestions(false);
      }
    }
  };

  const execCmd = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleEditorInput();
    editorRef.current?.focus();
  };

  const addLink = () => {
    const url = window.prompt('লিংকটি পেস্ট করুন (যেমন: https://example.com):');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const handleTagAdd = (tagStr: string) => {
    const cleanTag = tagStr.replace(/^#+/, '').trim();
    if (cleanTag && editorRef.current) {
      // Replace the current `#word` with the selected tag in the editor
      const textNode = getSelection()?.focusNode;
      if (textNode && textNode.nodeType === 3) {
        const text = textNode.nodeValue || "";
        const lastHashIndex = text.lastIndexOf('#');
        if (lastHashIndex !== -1) {
          // We insert it simply as text (to simulate Facebook style, you can make it blue, but text is safer)
          const newText = text.substring(0, lastHashIndex) + '#' + cleanTag + '\u00A0';
          textNode.nodeValue = newText;

          // Move cursor to the end of the replaced text
          const range = document.createRange();
          const sel = window.getSelection();
          range.setStart(textNode, newText.length);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);

          handleEditorInput();
        }
      }
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTagAdd(tagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const htmlContent = title;
    // Replace <br> and <p> with spaces to ensure words don't get mashed, then strip tags
    const plainText = htmlContent.replace(/<br\s*[\/]?>/gi, " ").replace(/<\/p>/gi, " ").replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/g, " ").trim();

    if (plainText.length < 3) {
      setError("বিষয়টির বিবরণ অন্তত ৩ অক্ষরের হতে হবে।");
      return;
    }

    if (plainText.length > 4000) {
      setError("বিষয়টির বিবরণ ৪০০০ অক্ষরের বেশি হতে পারবে না। (বর্তমানে " + plainText.length + " অক্ষর)");
      return;
    }

    setError(null);

    const payload = {
      title: plainText,
      titleHtml: htmlContent,
      location: location.trim() ? location : "Not specified"
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    selectedFiles.forEach(file => {
      formData.append('caseMedia', file);
    });

    try {
      await createCaseMutation(formData).unwrap();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.data?.message || err.message || 'An error occurred during submission');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.06)] animate-in slide-in-from-top-4 duration-300 overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-start bg-blue-50/40 px-4 sm:px-5 py-3.5 border-b border-blue-100">
        <div className="flex gap-2.5 items-start min-w-0">
          <div className="mt-0.5 text-blue-600 shrink-0">
            <img src={imgUrl} alt="User" className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-slate-800 leading-5">নতুন বিষয় তুলুন</h2>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-4">আপনার এলাকার গুরুত্বপূর্ণ কোনো সমস্যা, ঘটনা বা জনস্বার্থের বিষয় শেয়ার করুন।</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
          <X size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        {error && (
          <div className="p-2.5 mb-3 text-[12px] text-red-700 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form id="create-case-form" onSubmit={handleSubmit} className="space-y-4">

          {/* Main Title Area & Media Attachments Combined */}
          <div className="border border-slate-200 rounded-xl  focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition relative bg-[#f5f8fc] overflow-visible">

            {/* Custom Toolbar */}
            <div className="flex items-center gap-0.5 bg-white/80 border-b border-slate-200 px-2.5 py-1.5 rounded-t-xl">
              <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('bold'); }} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition" title="Bold">
                <Bold size={14} />
              </button>
              <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('italic'); }} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition" title="Italic">
                <Italic size={14} />
              </button>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition" title="List">
                <List size={14} />
              </button>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <button type="button" onMouseDown={e => { e.preventDefault(); addLink(); }} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition" title="Link">
                <Link size={14} />
              </button>
            </div>

            <div className="px-3.5 pb-2.5 relative">

              {/* Native ContentEditable Editor */}
              <div
                ref={editorRef}
                contentEditable
                onPaste={handlePaste}
                onInput={handleEditorInput}
                className="w-full text-[13px] sm:text-sm text-slate-800 outline-none bg-transparent min-h-[120px] pb-6 pt-3.5 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 cursor-text [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:myb-2 [&_blockquote]:bg-slate-50 [&_blockquote]:py-1 [&_a]:text-slate-600 [&_a:hover]:underline [&_a:hover]:decoration-slate-400 [&_a:hover]:underline-offset-[3px] [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_p]:mb-2"
                data-placeholder="আপনার কাছে কী ঘটেছে, Abdul?"
              />
              <div className={`absolute bottom-2 right-4 text-[10px] font-medium ${title.replace(/<[^>]+>/g, '').length > 4000 ? 'text-red-500' : 'text-slate-400'}`}>
                {title.replace(/<[^>]+>/g, '').length} / 4000
              </div>

              {/* Suggestions Dropdown (Floats below the editor when typing #) */}
              {showTagSuggestions && tagInput && (
                <div className="absolute left-3 top-full z-[9999] w-64 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 text-[11px] font-medium text-slate-500">
                    Hashtag Suggestions
                  </div>
                  {tagSuggestionsData?.data && tagSuggestionsData.data.length > 0 ? (
                    [...tagSuggestionsData.data]
                      .sort((a: any, b: any) => (b.caseCount || 0) - (a.caseCount || 0))
                      .slice(0, 30)
                      .map((tag: any) => (
                        <div
                          key={tag.id}
                          className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition"
                          onClick={() => handleTagAdd(tag.name)}
                        >
                          <span className="font-medium text-slate-700 text-[12px]">#{tag.name}</span>
                          <span className="text-[10px] text-slate-400">{tag.caseCount}</span>
                        </div>
                      ))
                  ) : (
                    <div
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-blue-600 font-medium text-[12px] flex items-center gap-1.5 transition"
                      onClick={() => handleTagAdd(tagInput)}
                    >
                      <Plus size={14} /> <span>Create "{tagInput.startsWith('#') ? tagInput : `#${tagInput}`}"</span>
                    </div>
                  )}
                </div>
              )}

              {/* Media Previews Grid (Facebook Style) */}
              {selectedFiles.length > 0 && (
                <div className="mb-8 mt-2 rounded-xl overflow-hidden border border-slate-200">
                  {/* Remove all files button */}
                  <div className="relative">
                    <button type="button" onClick={() => setSelectedFiles([])} className="absolute top-2 right-2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-1.5 shadow-sm transition z-20">
                      <X size={18} />
                    </button>
                    
                    {selectedFiles.length === 1 && (
                      <DraggableGridItem index={0} file={selectedFiles[0]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} className="max-h-[400px]" />
                    )}

                    {selectedFiles.length === 2 && (
                      <div className="grid grid-cols-2 gap-1 bg-white h-[300px]">
                        <DraggableGridItem index={0} file={selectedFiles[0]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                        <DraggableGridItem index={1} file={selectedFiles[1]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                      </div>
                    )}

                    {selectedFiles.length === 3 && (
                      <div className="grid grid-cols-2 gap-1 bg-white h-[350px]">
                        <DraggableGridItem index={0} file={selectedFiles[0]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                        <div className="grid grid-rows-2 gap-1 h-full">
                          <DraggableGridItem index={1} file={selectedFiles[1]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                          <DraggableGridItem index={2} file={selectedFiles[2]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                        </div>
                      </div>
                    )}

                    {selectedFiles.length === 4 && (
                      <div className="grid grid-rows-2 gap-1 bg-white h-[400px]">
                        <DraggableGridItem index={0} file={selectedFiles[0]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                        <div className="grid grid-cols-3 gap-1 h-full">
                          <DraggableGridItem index={1} file={selectedFiles[1]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                          <DraggableGridItem index={2} file={selectedFiles[2]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                          <DraggableGridItem index={3} file={selectedFiles[3]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                        </div>
                      </div>
                    )}

                    {selectedFiles.length >= 5 && (
                      <div className="grid grid-rows-[2fr_1fr] gap-1 bg-white h-[450px]">
                        <div className="grid grid-cols-2 gap-1 h-full">
                          <DraggableGridItem index={0} file={selectedFiles[0]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                          <DraggableGridItem index={1} file={selectedFiles[1]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                        </div>
                        <div className="grid grid-cols-3 gap-1 h-full">
                          <DraggableGridItem index={2} file={selectedFiles[2]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                          <DraggableGridItem index={3} file={selectedFiles[3]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex} />
                          <DraggableGridItem index={4} file={selectedFiles[4]} handleDragStart={handleDragStart} handleDrop={handleDrop} setPreviewMediaIndex={setPreviewMediaIndex}>
                            {selectedFiles.length > 5 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                                <span className="text-white text-3xl font-semibold">+{selectedFiles.length - 5}</span>
                              </div>
                            )}
                          </DraggableGridItem>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Embedded Media Attachments */}
              <div className="pt-2.5 border-t border-slate-200/80 relative">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />

                <div className="flex flex-wrap items-center gap-2 pb-1">
                  {/* Upload Buttons - Smaller inline version */}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-md px-2.5 py-1.5 hover:bg-blue-50 hover:border-blue-300 transition text-slate-600">
                    <ImageIcon size={15} className="text-blue-500" />
                    <span className="text-[11px] font-medium">ছবি / ভিডিও</span>
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-md px-2.5 py-1.5 hover:bg-orange-50 hover:border-orange-300 transition text-slate-600">
                    <FileText size={15} className="text-orange-500" />
                    <span className="text-[11px] font-medium">দলিল</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">কোথায় ঘটেছে? (ঐচ্ছিক)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin size={16} />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg pl-9 pr-3 text-[12px] sm:text-[13px] text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-400"
                  placeholder="স্থান যেমন: ঢাকা, বাংলাদেশ"
                />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">বিষয় ক্যাটাগরি (ঐচ্ছিক)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Grid size={16} />
                </div>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg pl-9 pr-3 text-[12px] sm:text-[13px] text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition appearance-none bg-white cursor-pointer text-slate-500"
                >
                  <option value="" disabled>একটি ক্যাটাগরি নির্বাচন করুন</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="environment">Environment</option>
                  <option value="corruption">Corruption</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* Footer Actions */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">

        {/* Visibility */}
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-semibold text-slate-500 mb-1">দৃশ্যমানতা</label>
          <div className="relative inline-block w-full sm:w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Globe size={14} />
            </div>
            <select className="w-full h-9 border border-slate-200 rounded-lg pl-8 pr-8 text-[11px] font-medium text-slate-700 outline-none focus:border-blue-500 appearance-none bg-white cursor-pointer">
              <option value="public">সবার জন্য উন্মুক্ত (Public)</option>
              <option value="private">শুধুমাত্র আমি (Private)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-[12px] font-medium hover:bg-slate-50 transition w-full sm:w-auto">
            বাতিল
          </button>
          <button type="submit" form="create-case-form" disabled={isLoading} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-[12px] font-semibold hover:bg-blue-700 transition disabled:opacity-70 flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-sm">
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Send size={15} className="rotate-45 -mt-0.5" />
            )}
            {isLoading ? 'প্রকাশ হচ্ছে...' : 'বিষয়টি প্রকাশ করুন'}
          </button>
        </div>

      </div>

      {/* Lightbox Modal */}
      {previewMediaIndex !== null && (
        <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col items-center justify-center p-4">
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50"
            onClick={() => setPreviewMediaIndex(null)}
          >
            <X size={32} />
          </button>
          
          <div className="w-full max-w-5xl h-[80vh] flex items-center justify-center relative bg-black/40 rounded-lg overflow-hidden border border-white/10">
            <MediaPreview file={selectedFiles[previewMediaIndex]} />
            
            {previewMediaIndex > 0 && (
              <button 
                className="absolute left-4 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
                onClick={(e) => { e.stopPropagation(); setPreviewMediaIndex(previewMediaIndex - 1); }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}
            
            {previewMediaIndex < selectedFiles.length - 1 && (
              <button 
                className="absolute right-4 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
                onClick={(e) => { e.stopPropagation(); setPreviewMediaIndex(previewMediaIndex + 1); }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            )}
          </div>
          
          <div className="mt-4 text-white/70 text-sm font-medium bg-black/50 px-4 py-1.5 rounded-full mb-3">
            {previewMediaIndex + 1} / {selectedFiles.length}
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="flex items-center justify-center gap-2 max-w-full overflow-x-auto p-2 pb-4">
            {selectedFiles.map((f, idx) => (
              <div 
                key={idx}
                className={`relative h-16 w-16 shrink-0 rounded-md overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all group ${idx === previewMediaIndex ? 'border-blue-500 opacity-100 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => setPreviewMediaIndex(idx)}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                    if (selectedFiles.length <= 1) {
                      setPreviewMediaIndex(null);
                    } else if (previewMediaIndex !== null && idx === previewMediaIndex) {
                      setPreviewMediaIndex(Math.max(0, idx - 1));
                    } else if (previewMediaIndex !== null && idx < previewMediaIndex) {
                      setPreviewMediaIndex(previewMediaIndex - 1);
                    }
                  }}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition hover:bg-red-500 z-10"
                >
                  <X size={12} />
                </button>
                {f.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(f)} alt="thumb" className="w-full h-full object-cover pointer-events-none" />
                ) : f.type.startsWith('video/') ? (
                   <div className="w-full h-full bg-slate-800 flex items-center justify-center pointer-events-none"><Video size={20} className="text-white/70"/></div>
                ) : (
                   <div className="w-full h-full bg-slate-800 flex items-center justify-center pointer-events-none"><FileText size={20} className="text-white/70"/></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
