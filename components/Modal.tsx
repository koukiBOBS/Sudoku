import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actionButtonText?: string;
  onAction?: () => void;
  closeLabel?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actionButtonText, onAction, closeLabel = "Close" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
          <div className="text-slate-600 text-sm leading-relaxed mb-6">
            {children}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors"
            >
              {closeLabel}
            </button>
            {actionButtonText && onAction && (
              <button
                onClick={onAction}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                {actionButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
