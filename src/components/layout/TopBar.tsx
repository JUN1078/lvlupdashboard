import { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { ScenarioSelector } from '../controls/ScenarioSelector';
import { InsightModeTabs } from '../controls/InsightModeTabs';
import { DataEditorModal } from '../editor/DataEditorModal';
import { WeeklyReportModal } from '../report/WeeklyReportModal';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { clsx } from 'clsx';

export function TopBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { state } = useDashboard();
  const meta = state.data?.metadata;
  const [editorOpen, setEditorOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <header className="bg-[#161b27] border-b border-surface-500 px-3 md:px-6 py-3">
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          {/* Hamburger — mobile/tablet only */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors shrink-0"
              aria-label="Toggle sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect y="2" width="18" height="2" rx="1" fill="currentColor"/>
                <rect y="8" width="18" height="2" rx="1" fill="currentColor"/>
                <rect y="14" width="18" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
          )}
          {/* Scenario selector - only on Revenue Performance */}
          {state.selectedMode === 'revenue-performance' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Scenario</span>
                <ScenarioSelector />
              </div>
              <div className="h-6 w-px bg-surface-500" />
            </>
          )}

          {/* Mode tabs */}
          <InsightModeTabs />

          {/* Report buttons - inline with tabs */}
          <div className="h-6 w-px bg-surface-500" />

          {/* Revenue Report - only on Revenue Performance */}
          {state.selectedMode === 'revenue-performance' && (
            <>
              <button
                onClick={() => setReportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-surface-400 hover:border-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all"
              >
                <span>📄</span>
                Revenue Report
              </button>
              <button
                onClick={() => setEditorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-surface-400 hover:border-brand-500/60 hover:text-brand-400 hover:bg-brand-500/5 transition-all"
              >
                <span>✎</span>
                Edit Data
              </button>
            </>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Metadata — hidden on small screens */}
          {meta && (
            <div className="hidden md:flex items-center gap-3 text-xs text-slate-500">
              <span>{formatDate(meta.reportDate)}</span>
              <span className="h-4 w-px bg-surface-500" />
              <span
                className={clsx(
                  'px-2 py-0.5 rounded-full border text-xs font-medium',
                  meta.dataStatus === 'Final'
                    ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                    : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                )}
              >
                {meta.dataStatus}
              </span>
              <span className="h-4 w-px bg-surface-500" />
              <span>{formatDateTime(meta.lastUpdated)}</span>
            </div>
          )}
        </div>
      </header>

      <DataEditorModal isOpen={editorOpen} onClose={() => setEditorOpen(false)} />
      <WeeklyReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </>
  );
}
