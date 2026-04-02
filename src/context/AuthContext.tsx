import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CREW_MEMBERS, getDefaultAccessMap, type CrewMember, type ViewId } from '../data/crew-data';

const LS_KEY = 'auth_v1';
const ACCESS_LS_KEY = 'access_map_v1';
const CODES_LS_KEY = 'verify_codes_v1';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function generateDefaultCodes(): Record<string, string> {
  const codes: Record<string, string> = {};
  for (const member of CREW_MEMBERS) {
    // Use fixed code from crew data if defined, otherwise generate random
    codes[member.id] = member.code ?? (member.isAdmin ? 'CUAN0' : generateCode());
  }
  return codes;
}

interface AuthState {
  currentUser: CrewMember | null;
  accessMap: Record<string, ViewId[]>;
  verifyCodes: Record<string, string>;
}

interface AuthContextType {
  currentUser: CrewMember | null;
  accessMap: Record<string, ViewId[]>;
  verifyCodes: Record<string, string>;
  login: (userId: string) => void;
  loginWithCode: (userId: string, code: string) => boolean;
  logout: () => void;
  canAccess: (viewId: ViewId) => boolean;
  isAdmin: boolean;
  updateAccess: (userId: string, views: ViewId[]) => void;
  regenerateCode: (userId: string) => void;
  regenerateAllCodes: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadState(): AuthState {
  try {
    const userJson = localStorage.getItem(LS_KEY);
    const accessJson = localStorage.getItem(ACCESS_LS_KEY);
    const codesJson = localStorage.getItem(CODES_LS_KEY);
    const userId = userJson ? JSON.parse(userJson) : null;
    const accessMap = accessJson ? JSON.parse(accessJson) : getDefaultAccessMap();
    const verifyCodes = codesJson ? JSON.parse(codesJson) : generateDefaultCodes();
    const currentUser = userId ? CREW_MEMBERS.find(m => m.id === userId) || null : null;

    // Ensure every CREW_MEMBER has a code; always honour fixed codes in crew data
    let codesUpdated = !codesJson;
    for (const member of CREW_MEMBERS) {
      const fixedCode = member.code ?? (member.isAdmin ? 'CUAN0' : null);
      if (fixedCode) {
        if (verifyCodes[member.id] !== fixedCode) {
          verifyCodes[member.id] = fixedCode;
          codesUpdated = true;
        }
      } else if (!verifyCodes[member.id]) {
        verifyCodes[member.id] = generateCode();
        codesUpdated = true;
      }
    }
    if (codesUpdated) {
      localStorage.setItem(CODES_LS_KEY, JSON.stringify(verifyCodes));
    }

    return { currentUser, accessMap, verifyCodes };
  } catch {
    const verifyCodes = generateDefaultCodes();
    localStorage.setItem(CODES_LS_KEY, JSON.stringify(verifyCodes));
    return { currentUser: null, accessMap: getDefaultAccessMap(), verifyCodes };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadState);

  const login = useCallback((userId: string) => {
    const user = CREW_MEMBERS.find(m => m.id === userId);
    if (user) {
      localStorage.setItem(LS_KEY, JSON.stringify(userId));
      setState(prev => ({ ...prev, currentUser: user }));
    }
  }, []);

  const loginWithCode = useCallback((userId: string, code: string): boolean => {
    const member = CREW_MEMBERS.find(m => m.id === userId);
    // Admin always accepts "CUAN0" as code
    if (member?.isAdmin && code.toUpperCase().trim() === 'CUAN0') {
      localStorage.setItem(LS_KEY, JSON.stringify(userId));
      setState(prev => ({ ...prev, currentUser: member }));
      return true;
    }
    const expectedCode = state.verifyCodes[userId];
    if (!expectedCode || code.toUpperCase().trim() !== expectedCode) return false;
    const user = CREW_MEMBERS.find(m => m.id === userId);
    if (user) {
      localStorage.setItem(LS_KEY, JSON.stringify(userId));
      setState(prev => ({ ...prev, currentUser: user }));
    }
    return true;
  }, [state.verifyCodes]);

  const logout = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setState(prev => ({ ...prev, currentUser: null }));
  }, []);

  const canAccess = useCallback((viewId: ViewId): boolean => {
    if (!state.currentUser) return false;
    if (state.currentUser.isAdmin) return true;
    const views = state.accessMap[state.currentUser.id] || [];
    return views.includes(viewId);
  }, [state.currentUser, state.accessMap]);

  const updateAccess = useCallback((userId: string, views: ViewId[]) => {
    setState(prev => {
      const newMap = { ...prev.accessMap, [userId]: views };
      localStorage.setItem(ACCESS_LS_KEY, JSON.stringify(newMap));
      return { ...prev, accessMap: newMap };
    });
  }, []);

  const regenerateCode = useCallback((userId: string) => {
    const member = CREW_MEMBERS.find(m => m.id === userId);
    const newCode = member?.isAdmin ? 'CUAN0' : generateCode();
    setState(prev => {
      const newCodes = { ...prev.verifyCodes, [userId]: newCode };
      localStorage.setItem(CODES_LS_KEY, JSON.stringify(newCodes));
      return { ...prev, verifyCodes: newCodes };
    });
  }, []);

  const regenerateAllCodes = useCallback(() => {
    setState(prev => {
      const newCodes = generateDefaultCodes();
      localStorage.setItem(CODES_LS_KEY, JSON.stringify(newCodes));
      return { ...prev, verifyCodes: newCodes };
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser: state.currentUser,
      accessMap: state.accessMap,
      verifyCodes: state.verifyCodes,
      login,
      loginWithCode,
      logout,
      canAccess,
      isAdmin: state.currentUser?.isAdmin ?? false,
      updateAccess,
      regenerateCode,
      regenerateAllCodes,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
