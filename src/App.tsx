import { DashboardProvider } from './context/DashboardContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { LoginScreen } from './components/auth/LoginScreen';

function AuthGate() {
  const { currentUser } = useAuth();
  if (!currentUser) return <LoginScreen />;
  return (
    <DashboardProvider>
      <AppShell />
    </DashboardProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
