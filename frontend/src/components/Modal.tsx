import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquear scroll do body quando o modal estiver aberto no mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[#F4F4F6] dark:bg-[#18191D] border border-[#E2E2E8] dark:border-[#292A30] rounded-2xl shadow-modal overflow-hidden z-10 my-auto text-[#18191D] dark:text-[#F4F4F6] transition-colors max-h-[92vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E2E2E8] dark:border-[#292A30] bg-white/70 dark:bg-[#202126]/90 backdrop-blur-md shrink-0 gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-sans text-lg sm:text-xl font-medium tracking-tight text-[#18191D] dark:text-[#F4F4F6] truncate">{title}</h3>
            {subtitle && <p className="text-xs sm:text-sm text-[#686971] dark:text-[#BFC0C7] mt-0.5 line-clamp-2">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#686971] hover:text-[#18191D] dark:hover:text-[#F4F4F6] hover:bg-[#EEEEF1] dark:hover:bg-[#292A30] rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain bg-[#F4F4F6] dark:bg-[#18191D]">{children}</div>
      </div>
    </div>
  );
}
