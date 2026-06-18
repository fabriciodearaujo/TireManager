import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 modal-overlay">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm modal-content">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="font-semibold text-gray-800 text-sm">{title || 'Confirmação'}</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <div className="flex gap-3 justify-end px-5 pb-5">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">Excluir</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
