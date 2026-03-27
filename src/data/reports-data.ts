// ─── Reports Data ─────────────────────────────────────────────────────────────

export interface ReportHistoryEntry {
  id: string;
  reportId: string;
  reportTitle: string;
  timestamp: string;
  action: 'created' | 'edited' | 'exported' | 'deleted';
  field?: string;
  user: string;
}

export interface ReportMetrics {
  revenueProgress: { target: number; actual: number; percentage: number };
  budgetInfo: { approved: number; spent: number; remaining: number; utilization: number };
  leadsOpportunity: { initialLeads: number; qualityLeads: number; opportunities: number; deals: number };
  marketingToLeads: { totalActivities: number; leadsGenerated: number; conversionRate: number };
}

export interface OKRItem {
  pillar: string;
  progress: number;
  status: string;
}

export interface QuestUpdateItem {
  quest: string;
  lastWeekDev: string;
  nextWeekDev: string;
  statusVsTimeline: string;
}

export interface WeeklyReport {
  id: string;
  title: string;
  period: string;
  periodType: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  date: string;
  preparedBy: string;
  approvedBy: string;
  executiveSummary: string;
  quantitativeMetrics: ReportMetrics;
  okrUpdate: OKRItem[];
  qualitativeImpacts: string[];
  questUpdate: QuestUpdateItem[];
  manpowerUpdate: string[];
  previousPriorities: string[];
  nextPriorities: string[];
}

export const SAMPLE_REPORTS: WeeklyReport[] = [
  {
    id: 'W12-2026',
    title: 'W12 2026 - Gamification Division Weekly Report',
    period: 'Week 12 (March 16-22, 2026)',
    periodType: 'weekly',
    date: '2026-03-22',
    preparedBy: 'Shieny Aprilia',
    approvedBy: 'Management',
    executiveSummary: 'Q1 revenue on track at IDR 294M against IDR 1.5B quarterly target (aggressive). Pipeline showing strong momentum with DANA Last War Phase 2 entering negotiation stage. Quality B2B leads at 17 against 24 target (71%). Key focus remains on closing Citilink and BPK Penabur deals before Q1 end. Roblox community metrics showing improvement with DAU at 480 against 650 target.',
    quantitativeMetrics: {
      revenueProgress: { target: 6000, actual: 294, percentage: 4.9 },
      budgetInfo: { approved: 491.2, spent: 44.3, remaining: 446.9, utilization: 9 },
      leadsOpportunity: { initialLeads: 290, qualityLeads: 17, opportunities: 16, deals: 6 },
      marketingToLeads: { totalActivities: 15, leadsGenerated: 290, conversionRate: 5.9 },
    },
    okrUpdate: [
      { pillar: 'Sustainable Global Growth & Higher EBITDA', progress: 31, status: 'At Risk' },
      { pillar: 'Product Expansion (Roblox, GBA)', progress: 74, status: 'On Track' },
      { pillar: 'Global Market & Recurring Client', progress: 26, status: 'Behind' },
      { pillar: 'Budget & Cost Efficiency', progress: 91, status: 'On Track' },
    ],
    qualitativeImpacts: [
      'DANA Last War Phase 1 UAT successfully passed - client satisfied with quality',
      'BCA expressing strong interest in gamification training platform',
      'Roblox Concert concept gaining traction with potential sponsors',
      'International partnership outreach to UAE HR consultancies initiated',
    ],
    questUpdate: [
      { quest: 'LinkedIn Ads Campaign', lastWeekDev: 'Optimized targeting, CTR improved 15%', nextWeekDev: 'Scale budget, A/B test creatives', statusVsTimeline: 'On Track' },
      { quest: 'CX Global Summit Follow-up', lastWeekDev: 'Follow-up emails sent to 47 leads', nextWeekDev: 'Schedule discovery calls', statusVsTimeline: 'On Track' },
      { quest: 'SEO Keyword Research', lastWeekDev: 'Keyword research for Agatelevelup.com in progress', nextWeekDev: 'Complete technical audit', statusVsTimeline: 'Slightly Behind' },
      { quest: 'Case Study Videos', lastWeekDev: 'Scripting completed for 2 videos', nextWeekDev: 'Begin production and editing', statusVsTimeline: 'On Track' },
    ],
    manpowerUpdate: [
      'Marketing team at full capacity (Hisyam, Tian, Okky, Bima, Auliya)',
      'Hisyam leading SEO and outbound initiatives - 50% progress on keyword optimization',
      'Tian focused on content creation - social media CTA campaign active',
      'Freelance designer onboarded for Q2 event materials',
    ],
    previousPriorities: [
      'Complete DANA Last War Phase 1 UAT review',
      'Submit BPK Penabur revised proposal',
      'Launch LinkedIn Ads campaign for Q1',
      'Prepare Event Exhibition Indonesia booth design',
      'Follow up Citilink negotiation terms',
    ],
    nextPriorities: [
      'Close Citilink Loyalty System deal before April',
      'Prepare Q1 OKR review presentation',
      'Launch Roblox GTM campaign phase 2',
      'Submit monthly budget report for March',
      'Schedule Zynga discovery call',
    ],
  },
  {
    id: 'M03-2026',
    title: 'MR03 2026 - March Monthly Report',
    period: 'March 2026',
    periodType: 'monthly',
    date: '2026-03-31',
    preparedBy: 'Shieny Aprilia',
    approvedBy: 'Management',
    executiveSummary: 'March marks the end of Q1 2026. Division revenue reached IDR 294M against aggressive target of IDR 1.5B (19.6%). Pipeline is healthy at IDR 4.34B across 12 active deals. Quality leads achieved 17 of 24 target (71%). Key wins include Pertamina Safety VR deal closure (IDR 380M). Budget utilization remains efficient at 9% of annual allocation. Focus for Q2: accelerate deal closures and expand Roblox/GBA product revenue.',
    quantitativeMetrics: {
      revenueProgress: { target: 1500, actual: 294, percentage: 19.6 },
      budgetInfo: { approved: 491.2, spent: 44.3, remaining: 446.9, utilization: 9 },
      leadsOpportunity: { initialLeads: 290, qualityLeads: 17, opportunities: 16, deals: 6 },
      marketingToLeads: { totalActivities: 42, leadsGenerated: 290, conversionRate: 5.9 },
    },
    okrUpdate: [
      { pillar: 'Sustainable Global Growth & Higher EBITDA', progress: 31, status: 'At Risk' },
      { pillar: 'Product Expansion (Roblox, GBA)', progress: 74, status: 'On Track' },
      { pillar: 'Global Market & Recurring Client', progress: 26, status: 'Behind' },
      { pillar: 'Budget & Cost Efficiency', progress: 91, status: 'On Track' },
    ],
    qualitativeImpacts: [
      'Pertamina Safety VR deal successfully closed at IDR 380M',
      'DANA Last War Phase 2 entering negotiation with expanded scope',
      'Event Exhibition Indonesia (IP Expo) generated 47 initial leads',
      'UAE partnership exploration yielding 3 qualified HR consultancy contacts',
      'Roblox DAU showing upward trend from 420 to 480 month-over-month',
    ],
    questUpdate: [
      { quest: 'Event Attend Activities', lastWeekDev: 'Completed 8 events across Indonesia and global', nextWeekDev: 'Plan HR Tech Asia Singapore attendance', statusVsTimeline: 'On Track' },
      { quest: 'LinkedIn Ads Infrastructure', lastWeekDev: 'Premium and Ads infrastructure fully set up', nextWeekDev: 'Launch Q2 campaign creatives', statusVsTimeline: 'On Track' },
      { quest: 'GTM Roblox', lastWeekDev: 'Community engagement events launched', nextWeekDev: 'Scale DAU growth initiatives', statusVsTimeline: 'On Track' },
      { quest: 'Content Pipeline', lastWeekDev: '6 case studies, 12 social posts, 2 e-books in progress', nextWeekDev: 'Publish first batch of case studies', statusVsTimeline: 'Slightly Behind' },
      { quest: 'SEO Optimization', lastWeekDev: 'Technical audit completed, keyword strategy defined', nextWeekDev: 'Implement on-page SEO changes for Q2', statusVsTimeline: 'On Track' },
    ],
    manpowerUpdate: [
      'Full team operational: 5 marketing + 2 BD + 5 directors',
      'Q2 freelance budget allocated for design and content support',
      'Training: AI Workforce Development workshop completed by all team members',
      'Performance reviews scheduled for mid-April',
    ],
    previousPriorities: [
      'Close Q1 pipeline deals - Pertamina closed, others progressing',
      'Launch LinkedIn campaign - completed and running',
      'Submit Q1 OKR self-assessment - in progress',
      'Event Exhibition Indonesia execution - completed successfully',
      'International partnership outreach - 3 contacts established',
    ],
    nextPriorities: [
      'Accelerate Q2 pipeline: target 3 deal closures in April',
      'Launch GBA quality leads campaign',
      'Execute Roblox GTM phase 2 with increased budget',
      'Prepare and submit Q1 OKR review',
      'Plan Event Attend Global (HR Tech Asia Singapore)',
      'Close Citilink and BPK Penabur deals',
    ],
  },
  {
    id: 'Q1-2026',
    title: 'QR01 2026 - Q1 Quarterly Review',
    period: 'Q1 2026 (January - March)',
    periodType: 'quarterly',
    date: '2026-03-31',
    preparedBy: 'Shieny Aprilia',
    approvedBy: 'Management',
    executiveSummary: 'Q1 2026 completed with mixed results. Revenue at IDR 294M vs IDR 1.5B target (19.6% achievement). Pipeline value at IDR 4.34B provides strong Q2 foundation. Quality leads at 71% of target. Notable achievements: Pertamina deal closed (IDR 380M), DANA Phase 2 in negotiation (IDR 500M). Areas for improvement: initial lead volume below target, GBA leads program yet to launch.',
    quantitativeMetrics: {
      revenueProgress: { target: 1500, actual: 294, percentage: 19.6 },
      budgetInfo: { approved: 491.2, spent: 44.3, remaining: 446.9, utilization: 9 },
      leadsOpportunity: { initialLeads: 290, qualityLeads: 17, opportunities: 16, deals: 6 },
      marketingToLeads: { totalActivities: 42, leadsGenerated: 290, conversionRate: 5.9 },
    },
    okrUpdate: [
      { pillar: 'Sustainable Global Growth & Higher EBITDA', progress: 31, status: 'At Risk' },
      { pillar: 'Product Expansion (Roblox, GBA)', progress: 74, status: 'On Track' },
      { pillar: 'Global Market & Recurring Client', progress: 26, status: 'Behind' },
      { pillar: 'Budget & Cost Efficiency', progress: 91, status: 'On Track' },
    ],
    qualitativeImpacts: [
      'Established strong pipeline foundation for remainder of 2026',
      'Product expansion Roblox showing consistent growth trajectory',
      'International presence initiated through UAE partnership outreach',
      'Team alignment on OKR framework fully operational',
    ],
    questUpdate: [
      { quest: 'Q1 Marketing Initiatives', lastWeekDev: 'All Q1 initiatives executed as planned', nextWeekDev: 'Transition to Q2 campaign plans', statusVsTimeline: 'On Track' },
      { quest: 'CRM System Setup', lastWeekDev: 'Fully operational with 12 active deals tracked', nextWeekDev: 'Add automated reporting', statusVsTimeline: 'On Track' },
      { quest: 'Budget Management', lastWeekDev: 'Discipline maintained - 9% utilization on schedule', nextWeekDev: 'Prepare Q2 budget allocation', statusVsTimeline: 'On Track' },
    ],
    manpowerUpdate: [
      'Team fully staffed and aligned to Q2 objectives',
      'Performance baselines established for all 9 team members',
    ],
    previousPriorities: [
      'Set up 2026 operational framework - completed',
      'Launch Q1 marketing campaigns - completed',
      'Establish CRM tracking - completed',
    ],
    nextPriorities: [
      'Achieve 40% of annual revenue target by Q2 end',
      'Launch GBA leads program',
      'Close 5+ deals in Q2',
      'Expand Roblox DAU to 600+ average',
      'Execute international event attendance plan',
    ],
  },
];
