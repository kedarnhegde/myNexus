'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export default function Modal({ isOpen, onClose, title, message, type = 'info' }: ModalProps) {
  if (!isOpen) return null;

  const bgColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#A6192E';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: bgColor}}>
              {type === 'success' ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : type === 'error' ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          <p className="text-gray-300 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full py-2 text-white rounded-lg font-medium"
            style={{backgroundColor: bgColor}}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
