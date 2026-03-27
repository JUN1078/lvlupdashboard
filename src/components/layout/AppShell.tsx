import { useState } from 'react';
import { clsx } from 'clsx';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AIInsightPanel } from '../ai/AIInsightPanel';
import { RevenuePerformanceView } from '../views/RevenuePerformanceView';
import { QualityLeadsView } from '../views/QualityLeadsView';
import { CRMPipelineView } from '../views/CRMPipelineView';
import { MarketingLeadsView } from '../views/MarketingLeadsView';
import { WeeklyReportsView } from '../views/WeeklyReportsView';
import { AccessManagementView } from '../views/AccessManagementView';
import { ExecutiveSummaryBox } from '../summary/ExecutiveSummaryBox';
import { PageLoader } from '../shared/LoadingSpinner';
import { useDashboard } from '../../context/DashboardContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useScenarioMetrics } from '../../hooks/useScenarioMetrics';
import { CRM_DEALS, CRM_LEADS, CRM_COMPANIES, CRM_CONTACTS } from '../../data/crm-data';
import { FUNNEL_METRICS, CHANNEL_DATA, MONTHLY_LEAD_TREND, MARKETING_OKRS, QUALITY_LEADS_TRACKER, BUDGET_2026 } from '../../data/marketing-data';
import { SAMPLE_REPORTS } from '../../data/reports-data';
import { BudgetTrackerView } from '../views/BudgetTrackerView';
import { StrategyMapView } from '../views/StrategyMapView';
import { OKRTrackerView } from '../views/OKRTrackerView';
import { InitiativesView } from '../views/InitiativesView';
import { PerformanceReviewView } from '../views/PerformanceReviewView';
import { KPISubmissionView } from '../views/KPISubmissionView';
import { SeniorLeadershipReportView } from '../views/SeniorLeadershipReportView';
import { MasterDashboardView } from '../views/MasterDashboardView';


export function AppShell() {
  useDashboardData();
  const { state } = useDashboard();
  const { summary, leads, channels } = useScenarioMetrics();
  const { isLoading, error, data, selectedMode, selectedScenario } = state;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) return <PageLoader />;

  if (error || !data || !summary || !leads) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-400 font-semibold">Failed to load dashboard data</p>
          <p className="text-slate-500 text-sm">{error ?? 'Unknown error'}</p>
          <p className="text-slate-600 text-xs">
            Ensure <code className="text-slate-400">src/data/dashboard-data.json</code> exists and is valid.
          </p>
        </div>
      </div>
    );
  }

  const showAIPanel = selectedMode === 'revenue-performance' || selectedMode === 'quality-leads';

  const renderView = () => {
    switch (selectedMode) {
      case 'master-dashboard':
        return <MasterDashboardView />;
      case 'revenue-performance':
        return <RevenuePerformanceView summary={summary} />;
      case 'quality-leads':
        return <QualityLeadsView leads={leads} channels={channels} opportunities={data.opportunities} />;
      case 'crm-pipeline':
        return (
          <CRMPipelineView
            initialDeals={CRM_DEALS}
            initialLeads={CRM_LEADS}
            initialCompanies={CRM_COMPANIES}
            initialContacts={CRM_CONTACTS}
          />
        );
      case 'marketing-leads':
        return (
          <MarketingLeadsView
            initialFunnel={FUNNEL_METRICS}
            initialChannels={CHANNEL_DATA}
            initialMonthlyTrend={MONTHLY_LEAD_TREND}
            initialOkrs={MARKETING_OKRS}
            initialQualityLeads={QUALITY_LEADS_TRACKER}
            initialBudget={BUDGET_2026}
          />
        );
      case 'weekly-reports':
        return <WeeklyReportsView initialReports={SAMPLE_REPORTS} />;
      case 'access-management':
        return <AccessManagementView />;
      case 'budget-tracker':
        return <BudgetTrackerView />;
      case 'strategy-map':
        return <StrategyMapView />;
      case 'okr-tracker':
        return <OKRTrackerView />;
      case 'initiatives':
        return <InitiativesView />;
      case 'performance-review':
        return <PerformanceReviewView />;
      case 'kpi-submission':
        return <KPISubmissionView />;
      case 'sl-report':
        return <SeniorLeadershipReportView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={clsx(
        'fixed lg:relative z-40 h-full transition-transform duration-300 shrink-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onToggleSidebar={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 overflow-y-auto p-3 md:p-5 space-y-4">
          {renderView()}
          {showAIPanel && (
            <ExecutiveSummaryBox
              summary={summary}
              leads={leads}
              scenario={selectedScenario}
              channels={channels}
            />
          )}
        </main>
      </div>

      {/* Right AI Panel - only for revenue/leads views */}
      {showAIPanel && (
        <AIInsightPanel
          summary={summary}
          leads={leads}
          channels={channels}
          scenario={selectedScenario}
        />
      )}
    </div>
  );
}
