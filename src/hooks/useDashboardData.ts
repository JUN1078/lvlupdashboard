import { useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { ACTIONS } from '../context/actions';
import type { DashboardData } from '../types';

function validateData(data: unknown): data is DashboardData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    'metadata' in d &&
    'scenarios' in d &&
    'quarters' in d &&
    'opportunities' in d &&
    'leads' in d
  );
}

export function useDashboardData() {
  const { dispatch } = useDashboard();

  useEffect(() => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    fetch('/data/dashboard-data.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
        return res.json();
      })
      .then((raw: unknown) => {
        if (!validateData(raw)) {
          throw new Error('Invalid data format in dashboard-data.json');
        }
        dispatch({ type: ACTIONS.SET_DATA, payload: raw });
      })
      .catch((err: Error) => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
      });
  }, [dispatch]);
}
