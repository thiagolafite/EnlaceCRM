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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-[#0F1216]/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[#F8F9FA] dark:bg-[#181C21] border-2 border-[#C85A32]/40 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto text-[#1A1E24] dark:text-[#F1F3F5] transition-colors max-h-[92vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#C85A32]/20 bg-[#F1F3F5]/90 dark:bg-[#13171C]/90 shrink-0 gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg sm:text-2xl font-normal text-[#1A1E24] dark:text-[#F1F3F5] truncate">{title}</h3>
            {subtitle && <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#ADB5BD] mt-0.5 sm:mt-1 line-clamp-2">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6C757D] hover:text-[#1A1E24] dark:hover:text-[#F1F3F5] hover:bg-[#E9ECEF] dark:hover:bg-[#22272E] border border-transparent hover:border-[#C85A32]/30 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain bg-[#F8F9FA] dark:bg-[#181C21]">{children}</div>
      </div>
    </div>
  );
}
