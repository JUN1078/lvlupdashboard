import { useState } from 'react';
import { clsx } from 'clsx';

interface AIInsightSectionProps {
  label: string;
  content: string;
  defaultOpen?: boolean;
}

export function AIInsightSection({ label, content, defaultOpen = false }: AIInsightSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-surface-500 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-surface-600 transition-colors"
      >
        <span>{label}</span>
        <span
          className={clsx(
            'text-slate-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="px-3 pb-3 pt-1 text-xs text-slate-400 leading-relaxed border-t border-surface-600 bg-surface-700/50">
          {content}
        </div>
      )}
    </div>
  );
}
