import React from 'react';
import { X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  if (!isOpen) return null;

  const buttonColors = {
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
    info: 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
  };

  return (
    <div className="srf-modal-backdrop">
      <div className="srf-modal-panel max-w-md rounded-3xl overflow-hidden">
        <div className="srf-modal-header rounded-t-3xl">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="srf-icon-btn text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 py-6">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
        
        <div className="srf-modal-footer rounded-b-3xl">
          <button
            onClick={onClose}
            className="srf-btn srf-btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`srf-btn text-white ${buttonColors[type]}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

