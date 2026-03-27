import { useState, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import { CREW_MEMBERS } from '../../data/crew-data';
import { useAuth } from '../../context/AuthContext';

export function LoginScreen() {
  const { loginWithCode } = useAuth();
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState('');

  const filtered = CREW_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  const pendingMember = useMemo(() => CREW_MEMBERS.find(m => m.id === pendingUser), [pendingUser]);

  const handleSelectUser = useCallback((userId: string) => {
    setPendingUser(userId);
    setCodeInput('');
    setError('');
  }, []);

  const handleVerify = useCallback(() => {
    if (!pendingUser) return;
    const success = loginWithCode(pendingUser, codeInput);
    if (!success) {
      setError('Invalid verification code. Contact your admin for the correct code.');
      setCodeInput('');
    }
  }, [codeInput, pendingUser, loginWithCode]);

  const handleCancel = useCallback(() => {
    setPendingUser(null);
    setCodeInput('');
    setError('');
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Level Up powered by Agate" className="h-12 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-white mb-2">Gamification Division</h1>
          <p className="text-slate-400">Select your profile to access the dashboard</p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or role..."
            className="w-full bg-[#1a1f2e] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 outline-none placeholder:text-slate-600"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Crew Grid */}
        <div className="bg-[#1a1f2e] rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="max-h-[480px] overflow-y-auto">
            {filtered.map(member => (
              <button
                key={member.id}
                onClick={() => handleSelectUser(member.id)}
                onMouseEnter={() => setHoveredId(member.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={clsx(
                  'w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all border-b border-slate-700/30 last:border-b-0',
                  hoveredId === member.id ? 'bg-red-500/10' : 'hover:bg-slate-800/50'
                )}
              >
                {/* Avatar */}
                <div className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0',
                  member.isAdmin
                    ? 'bg-gradient-to-br from-red-500 to-amber-500'
                    : 'bg-gradient-to-br from-indigo-500 to-cyan-500'
                )}>
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{member.name}</p>
                  <p className="text-slate-400 text-xs truncate">{member.role}</p>
                </div>

                {/* Admin badge */}
                {member.isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                    ADMIN
                  </span>
                )}

                {/* Arrow */}
                <span className={clsx('text-slate-600 transition-colors', hoveredId === member.id && 'text-red-400')}>
                  &rarr;
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          {CREW_MEMBERS.length} team members &middot; Enter your verification code to login
        </p>
      </div>

      {/* Verification Modal */}
      {pendingUser && pendingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCancel} />
          <div className="relative z-10 bg-[#1e2534] border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            {/* User info */}
            <div className="flex items-center gap-3 mb-5">
              <div className={clsx(
                'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0',
                pendingMember.isAdmin
                  ? 'bg-gradient-to-br from-red-500 to-amber-500'
                  : 'bg-gradient-to-br from-indigo-500 to-cyan-500'
              )}>
                {pendingMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">{pendingMember.name}</p>
                <p className="text-slate-400 text-xs">{pendingMember.role}</p>
              </div>
            </div>

            {/* Prompt */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔑</span>
              </div>
              <p className="text-sm text-white font-medium">Enter Verification Code</p>
              <p className="text-[11px] text-slate-500 mt-1">Your code was provided by the admin via Access Control</p>
            </div>

            {/* Code input */}
            <input
              type="text"
              autoFocus
              maxLength={5}
              value={codeInput}
              onChange={e => { setCodeInput(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter' && codeInput.length >= 5) handleVerify(); }}
              className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-lg font-mono tracking-[0.3em] focus:border-red-500 outline-none placeholder:text-slate-700 uppercase mb-3"
              placeholder="_ _ _ _ _"
            />

            {/* Error */}
            {error && (
              <p className="text-red-400 text-xs text-center mb-3">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-200 transition-all">
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={codeInput.length < 5}
                className={clsx(
                  'flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  codeInput.length >= 5
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                )}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
