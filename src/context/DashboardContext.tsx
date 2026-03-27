import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type {
  DashboardState,
  DashboardData,
  ScenarioKey,
  InsightMode,
  AIInsightPayload,
} from '../types';
import { ACTIONS } from './actions';

const LS_DATA_KEY = 'dashboard_data_overrides_v2_idr';

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: DashboardState = {
  data: null,
  originalData: null,
  isLoading: true,
  error: null,
  selectedScenario: 'base',
  selectedMode: 'revenue-performance',
  aiInsight: null,
  aiLoading: false,
  aiError: null,
};

// ─── Action Union ─────────────────────────────────────────────────────────────

type DashboardAction =
  | { type: typeof ACTIONS.SET_DATA; payload: DashboardData }
  | { type: typeof ACTIONS.SET_LOADING; payload: boolean }
  | { type: typeof ACTIONS.SET_ERROR; payload: string }
  | { type: typeof ACTIONS.SET_SCENARIO; payload: ScenarioKey }
  | { type: typeof ACTIONS.SET_MODE; payload: InsightMode }
  | { type: typeof ACTIONS.SET_AI_INSIGHT; payload: AIInsightPayload }
  | { type: typeof ACTIONS.SET_AI_LOADING; payload: boolean }
  | { type: typeof ACTIONS.SET_AI_ERROR; payload: string | null }
  | { type: typeof ACTIONS.UPDATE_DATA; payload: DashboardData }
  | { type: typeof ACTIONS.RESET_DATA };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case ACTIONS.SET_DATA: {
      // Check localStorage for saved edits on first load
      try {
        const saved = localStorage.getItem(LS_DATA_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as DashboardData;
          return { ...state, data: parsed, originalData: action.payload, isLoading: false, error: null };
        }
      } catch {
        // ignore corrupt storage
      }
      return { ...state, data: action.payload, originalData: action.payload, isLoading: false, error: null };
    }
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case ACTIONS.SET_SCENARIO:
      return { ...state, selectedScenario: action.payload };
    case ACTIONS.SET_MODE:
      return { ...state, selectedMode: action.payload };
    case ACTIONS.SET_AI_INSIGHT:
      return { ...state, aiInsight: action.payload, aiLoading: false, aiError: null };
    case ACTIONS.SET_AI_LOADING:
      return { ...state, aiLoading: action.payload };
    case ACTIONS.SET_AI_ERROR:
      return { ...state, aiError: action.payload, aiLoading: false };
    case ACTIONS.UPDATE_DATA:
      // Persist to localStorage
      try { localStorage.setItem(LS_DATA_KEY, JSON.stringify(action.payload)); } catch { /* ignore */ }
      return { ...state, data: action.payload };
    case ACTIONS.RESET_DATA:
      // Clear localStorage overrides and restore original
      try { localStorage.removeItem(LS_DATA_KEY); } catch { /* ignore */ }
      return { ...state, data: state.originalData };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface DashboardContextValue {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
