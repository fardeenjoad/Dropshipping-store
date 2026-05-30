import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-[100] animate-fade-in-up">
      <div className="bg-[#161616] text-white px-5 py-3.5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center space-x-3 border border-white/10 glass">
        <div className="relative flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8ff00] opacity-40"></span>
          <CheckCircle2 className="relative text-[#c8ff00]" size={20} />
        </div>
        <span className="font-medium text-sm pr-2">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
