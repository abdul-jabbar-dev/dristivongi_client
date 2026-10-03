import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface SafeLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export default function SafeLinkModal({ isOpen, onClose, reason }: SafeLinkModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 flex flex-col gap-4 border border-red-100">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={24} />
          <h3 className="font-bold text-lg">Link blocked</h3>
        </div>
        <p className="text-slate-600 text-sm">
          This link appears unsafe and was blocked for your safety.
          {reason && (
            <>
              <br />
              <span className="text-xs text-slate-400 mt-2 block">Reason: {reason}</span>
            </>
          )}
        </p>
        <div className="flex justify-end mt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
