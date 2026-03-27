import { clsx } from 'clsx';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import { ACTIONS } from '../../context/actions';
import { INSIGHT_MODES } from '../../constants';
import type { ViewId } from '../../data/crew-data';

export function InsightModeTabs() {
  const { state, dispatch } = useDashboard();
  const { canAccess } = useAuth();
  const { selectedMode } = state;

  const visibleModes = INSIGHT_MODES.filter(({ id }) => canAccess(id as ViewId));

  return (
    <div className="flex items-center gap-1 bg-[#161b27] rounded-lg p-1 border border-surface-500">
      {visibleModes.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => dispatch({ type: ACTIONS.SET_MODE, payload: id })}
          className={clsx(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap',
            id === selectedMode
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-600'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
