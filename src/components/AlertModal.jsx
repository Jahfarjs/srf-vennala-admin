import React from 'react';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const AlertModal = ({ isOpen, onClose, title, message, type = 'error' }) => {
  if (!isOpen) return null;

  const config = {
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      buttonColor: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      buttonColor: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
    }
  };

  const currentConfig = config[type] || config.error;
  const Icon = currentConfig.icon;

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
          <div className={`flex items-start gap-4 p-4 rounded-xl border ${currentConfig.bgColor} ${currentConfig.borderColor}`}>
            <Icon className={`w-6 h-6 flex-shrink-0 ${currentConfig.iconColor}`} />
            <p className="text-sm text-slate-700 leading-relaxed flex-1">{message}</p>
          </div>
        </div>
        
        <div className="srf-modal-footer rounded-b-3xl">
          <button
            onClick={onClose}
            className={`srf-btn text-white ${currentConfig.buttonColor} w-full`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

