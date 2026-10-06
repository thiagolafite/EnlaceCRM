import React from 'react';
import { AlertCircle, HelpCircle, RefreshCw, X } from 'lucide-react';

export interface ErrorBannerProps {
  error: string | null;
  solution?: string | null;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
}

export function ErrorBanner({ error, solution, onRetry, onClose, className = '' }: ErrorBannerProps) {
  if (!error) return null;

  return (
    <div className={`p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 text-xs space-y-1.5 animate-in fade-in duration-200 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 flex-1">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-rose-900 dark:text-rose-100 text-xs leading-snug">
              {error}
            </div>
            {solution && (
              <div className="flex items-start gap-1.5 text-[11px] text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                <HelpCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-rose-800 dark:text-rose-200">Como resolver:</strong> {solution}
                </span>
              </div>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {onRetry && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onRetry}
            className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-800 text-rose-800 dark:text-rose-200 font-medium flex items-center gap-1 transition-colors text-[11px]"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      )}
    </div>
  );
}
