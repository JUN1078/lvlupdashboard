import { clsx } from 'clsx';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import { ACTIONS } from '../../context/actions';
import { INSIGHT_MODES } from '../../constants';
import type { InsightMode } from '../../types';
import type { ViewId } from '../../data/crew-data';

const MODE_ICONS: Record<InsightMode, string> = {
  'master-dashboard': '🏠',
  'revenue-performance': '📊',
  'quality-leads': '💡',
  'crm-pipeline': '🎯',
  'marketing-leads': '📣',
  'weekly-reports': '📋',
  'access-management': '🔐',
  'strategy-map': '🗺',
  'okr-tracker': '🎯',
  'initiatives': '⚡',
  'performance-review': '📈',
  'kpi-submission': '📝',
  'budget-tracker': '💰',
  'sl-report': '📋',
};

const BUSINESS_CRM_IDS: InsightMode[] = ['quality-leads', 'crm-pipeline', 'marketing-leads'];
const PERFORMANCE_IDS: InsightMode[] = ['strategy-map', 'okr-tracker', 'initiatives', 'performance-review', 'kpi-submission'];

export function Sidebar() {
  const { state, dispatch } = useDashboard();
  const { currentUser, canAccess, isAdmin, logout } = useAuth();
  const { selectedMode } = state;

  // Filter modes by access
  const visibleModes = INSIGHT_MODES.filter(({ id }) => canAccess(id as ViewId));

  const userId = currentUser?.id;
  // Auliya: revenue, crm, marketing, kpi-submission
  // Others (non-admin): kpi-submission only
  const canSeeInsightViews = isAdmin || userId === 'auliya';
  const canSeeCRM = isAdmin || userId === 'auliya';
  const canSeeReports = isAdmin;
  const canSeeFullPerformance = isAdmin; // strategy-map, okr, initiatives, review
  const canSeeBudget = isAdmin;

  const renderNavButton = (id: InsightMode, label: string, activeColor = 'bg-brand-500/20 text-brand-400') => {
    const isActive = id === selectedMode;
    return (
      <button
        key={id}
        onClick={() => dispatch({ type: ACTIONS.SET_MODE, payload: id })}
        className={clsx(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left',
          isActive
            ? `${activeColor} font-medium`
            : 'text-slate-400 hover:bg-surface-600 hover:text-slate-200'
        )}
      >
        <span className="text-base leading-none">{MODE_ICONS[id]}</span>
        <span className="leading-snug">{label}</span>
      </button>
    );
  };

  return (
    <>
      <aside className="w-[220px] bg-[#161b27] border-r border-surface-500 flex flex-col h-full">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-surface-500">
          <img
            src="/logo.png"
            alt="Level Up powered by Agate"
            className="w-full object-contain"
            style={{ maxHeight: 56 }}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Insight Views - Revenue Performance */}
          {canSeeInsightViews && (
            <>
              <p className="px-2 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                Insight Views
              </p>
              {visibleModes
                .filter(({ id }) => !BUSINESS_CRM_IDS.includes(id) && id !== 'weekly-reports' && !PERFORMANCE_IDS.includes(id))
                .map(({ id, label }) => renderNavButton(id, label))}
            </>
          )}

          {/* Business CRM section */}
          {canSeeCRM && visibleModes.some(({ id }) => BUSINESS_CRM_IDS.includes(id)) && (
            <>
              <div className="h-px bg-slate-700/50 my-3" />
              <p className="px-2 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                Business CRM
              </p>
              {visibleModes
                .filter(({ id }) => BUSINESS_CRM_IDS.includes(id))
                .map(({ id, label }) => renderNavButton(id, label))}
            </>
          )}

          {/* Reports section - Weekly + Leadership */}
          {canSeeReports && visibleModes.some(({ id }) => id === 'weekly-reports') && (
            <>
              <div className="h-px bg-slate-700/50 my-3" />
              <p className="px-2 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                Reports
              </p>
              {visibleModes
                .filter(({ id }) => id === 'weekly-reports')
                .map(({ id, label }) => renderNavButton(id, label))}
              {renderNavButton('sl-report', 'Leadership Report')}
            </>
          )}

          {/* Performance Management section */}
          <>
            <div className="h-px bg-slate-700/50 my-3" />
            <p className="px-2 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
              Performance
            </p>
            {canSeeFullPerformance && renderNavButton('strategy-map', 'Strategy Map')}
            {canSeeFullPerformance && renderNavButton('okr-tracker', 'OKR & KPI')}
            {canSeeFullPerformance && renderNavButton('initiatives', 'Initiatives')}
            {canSeeFullPerformance && renderNavButton('performance-review', 'Performance Review')}
            {renderNavButton('kpi-submission', 'KPI Submission')}
          </>

          {/* Finance section */}
          {canSeeBudget && (
            <>
              <div className="h-px bg-slate-700/50 my-3" />
              <p className="px-2 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                Finance
              </p>
              {renderNavButton('budget-tracker', 'Budget & Revenue')}
            </>
          )}

          {/* Access Management - Admin only */}
          {isAdmin && (
            <>
              <div className="h-px bg-slate-700/50 my-3" />
              <p className="px-2 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                Administration
              </p>
              <button
                onClick={() => dispatch({ type: ACTIONS.SET_MODE, payload: 'access-management' as InsightMode })}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left',
                  selectedMode === 'access-management'
                    ? 'bg-red-500/20 text-red-400 font-medium'
                    : 'text-slate-400 hover:bg-surface-600 hover:text-slate-200'
                )}
              >
                <span className="text-base leading-none">🔐</span>
                <span className="leading-snug">Access Control</span>
              </button>
            </>
          )}
        </nav>

        {/* Bottom: User info + scenario */}
        <div className="border-t border-surface-500">
          {/* Logged in user */}
          {currentUser && (
            <div className="px-3 py-3 border-b border-surface-500/50">
              <div className="flex items-center gap-2">
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0',
                  currentUser.isAdmin ? 'bg-gradient-to-br from-red-500 to-amber-500' : 'bg-gradient-to-br from-indigo-500 to-cyan-500'
                )}>
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{currentUser.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-2 w-full px-3 py-1.5 rounded-lg text-[10px] font-medium text-slate-500 border border-slate-700 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition-all"
              >
                Switch User
              </button>
            </div>
          )}

        </div>
      </aside>
    </>
  );
}
