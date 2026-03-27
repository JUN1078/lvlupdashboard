import { clsx } from 'clsx';
import { useDashboard } from '../../context/DashboardContext';
import { ACTIONS } from '../../context/actions';
import type { ScenarioKey } from '../../types';
import { SCENARIO_LABELS } from '../../constants';

const SCENARIOS: ScenarioKey[] = ['conservative', 'base', 'aggressive'];

const SCENARIO_STYLES: Record<ScenarioKey, { active: string; dot: string }> = {
  conservative: {
    active: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    dot: 'bg-blue-400',
  },
  base: {
    active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dot: 'bg-emerald-400',
  },
  aggressive: {
    active: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    dot: 'bg-amber-400',
  },
};

export function ScenarioSelector() {
  const { state, dispatch } = useDashboard();
  const { selectedScenario } = state;

  return (
    <div className="flex items-center gap-1 bg-[#161b27] rounded-lg p-1 border border-surface-500">
      {SCENARIOS.map((key) => {
        const isActive = key === selectedScenario;
        const styles = SCENARIO_STYLES[key];
        return (
          <button
            key={key}
            onClick={() => dispatch({ type: ACTIONS.SET_SCENARIO, payload: key })}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all duration-150',
              isActive
                ? styles.active
                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-surface-600'
            )}
          >
            <span
              className={clsx(
                'w-1.5 h-1.5 rounded-full',
                isActive ? styles.dot : 'bg-slate-600'
              )}
            />
            {SCENARIO_LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}
