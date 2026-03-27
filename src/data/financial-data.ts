// Financial Statement data - Gamification Division FY2026

export interface BudgetLineItem {
  id: string;
  category: string;        // CoA Group: CAPEX, Server Cost, Software & License, Manpower, Marketing & Sales, People Growth, Project Delivery
  name: string;             // line item name
  monthly: number[];        // 12 months Jan-Dec in IDR
  q1Total: number;
  q2Total: number;
  q3Total: number;
  q4Total: number;
  fyBefore: number;         // FY Before (BAU)
  fyAfter: number;          // FY After (restructured)
  savings: number;
  action: string;           // KEEP, CUT, REDUCE
}

export interface RevenueScenario {
  label: string;
  revenue: number;
  totalExpense: number;
  ebitda: number;
  savingsVsBau: number;
}

export const REVENUE_SCENARIOS: RevenueScenario[] = [
  { label: 'Rev >= 3.5B (Plan)', revenue: 3500000000, totalExpense: 5697586724, ebitda: -2197586724, savingsVsBau: 0 },
  { label: 'Rev = 2.5B (Moderate)', revenue: 2500000000, totalExpense: 4844698974, ebitda: -2344698974, savingsVsBau: 435000000 },
  { label: 'Rev = 2.0B (Aggressive)', revenue: 2000000000, totalExpense: 4438698974, ebitda: -2438698974, savingsVsBau: 852887750 },
];

export const BUDGET_CATEGORIES = [
  'CAPEX',
  'GA - Server Cost',
  'GA - Software & License Fee',
  'Manpower',
  'Marketing & Sales Operations',
  'People Growth (LnD)',
  'Project Delivery Expense',
] as const;

export type BudgetCategory = typeof BUDGET_CATEGORIES[number];

// Category subtotals (quarterly, from the "Before vs After" sheet)
export interface CategorySummary {
  category: BudgetCategory;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  fyBefore: number;
  fyAfter: number;
  savings: number;
}

export const CATEGORY_SUMMARIES: CategorySummary[] = [
  { category: 'CAPEX', q1: 356259467, q2: 0, q3: 0, q4: 0, fyBefore: 356259467, fyAfter: 356259467, savings: 0 },
  { category: 'GA - Server Cost', q1: 24000000, q2: 24000000, q3: 25000000, q4: 27000000, fyBefore: 100000000, fyAfter: 100000000, savings: 0 },
  { category: 'GA - Software & License Fee', q1: 20852721, q2: 62112136, q3: 20252721, q4: 24412721, fyBefore: 127630299, fyAfter: 87042549, savings: 40587750 },
  { category: 'Manpower', q1: 1168640488, q2: 1117857338, q3: 1117857338, q4: 1117857338, fyBefore: 4522212500, fyAfter: 3602412500, savings: 919800000 },
  { category: 'Marketing & Sales Operations', q1: 91800000, q2: 173800000, q3: 141300000, q4: 86300000, fyBefore: 493200000, fyAfter: 194700000, savings: 298500000 },
  { category: 'People Growth (LnD)', q1: 6600000, q2: 7600000, q3: 8100000, q4: 8100000, fyBefore: 30400000, fyAfter: 30400000, savings: 0 },
  { category: 'Project Delivery Expense', q1: 30384458, q2: 12500000, q3: 12500000, q4: 12500000, fyBefore: 67884458, fyAfter: 67884458, savings: 0 },
];

// Detailed line items for software & licenses (commonly tracked per-account)
export interface AccountBudgetItem {
  name: string;
  monthlyAmount: number;    // average monthly in IDR
  fyTotal: number;
  action: string;           // KEEP, CUT, REDUCE
}

export const SOFTWARE_LICENSE_ITEMS: AccountBudgetItem[] = [
  { name: 'Adobe Illustrator', monthlyAmount: 755000, fyTotal: 9060000, action: 'KEEP' },
  { name: 'Adobe Photography 20GB', monthlyAmount: 400000, fyTotal: 4800000, action: 'KEEP' },
  { name: 'Adobe Substance', monthlyAmount: 411810, fyTotal: 4941720, action: 'KEEP' },
  { name: 'AI Tools (ChatGPT, Claude, Cursor)', monthlyAmount: 700000, fyTotal: 8400000, action: 'KEEP' },
  { name: 'Asset Unity GF', monthlyAmount: 850000, fyTotal: 10200000, action: 'KEEP' },
  { name: 'Clip Studio Paint (CSP EX)', monthlyAmount: 480000, fyTotal: 5760000, action: 'KEEP' },
  { name: 'Domain Rumahweb', monthlyAmount: 83333, fyTotal: 1000000, action: 'KEEP' },
  { name: 'Envato', monthlyAmount: 26667, fyTotal: 320000, action: 'KEEP' },
  { name: 'Figma', monthlyAmount: 510000, fyTotal: 6120000, action: 'KEEP' },
  { name: 'Github Copilot', monthlyAmount: 170000, fyTotal: 2040000, action: 'KEEP' },
  { name: 'ID Cloudhost', monthlyAmount: 92639, fyTotal: 1111665, action: 'KEEP' },
  { name: 'LAMBDATEST.COM', monthlyAmount: 595000, fyTotal: 7140000, action: 'KEEP' },
  { name: 'Mailercloud', monthlyAmount: 497097, fyTotal: 5965164, action: 'KEEP' },
  { name: 'Notion Plus Plan', monthlyAmount: 204000, fyTotal: 2448000, action: 'KEEP' },
  { name: 'Robux', monthlyAmount: 100000, fyTotal: 600000, action: 'CUT' },
  { name: 'SSL Rumahweb', monthlyAmount: 250000, fyTotal: 3000000, action: 'KEEP' },
  { name: 'Testiny', monthlyAmount: 663000, fyTotal: 7956000, action: 'KEEP' },
  { name: 'Unity Pro', monthlyAmount: 0, fyTotal: 0, action: 'CUT' },
  { name: 'Dreamina AI', monthlyAmount: 290000, fyTotal: 3480000, action: 'KEEP' },
  { name: 'Udemy', monthlyAmount: 225000, fyTotal: 2700000, action: 'KEEP' },
];

export const MARKETING_ITEMS: AccountBudgetItem[] = [
  { name: 'Event Attend Indonesia', monthlyAmount: 2291667, fyTotal: 27500000, action: 'KEEP' },
  { name: 'Event Exhibition Indonesia', monthlyAmount: 0, fyTotal: 0, action: 'CUT' },
  { name: 'Global Presence Collaboration', monthlyAmount: 0, fyTotal: 0, action: 'CUT' },
  { name: 'GTM - Game-based Assessment', monthlyAmount: 2500000, fyTotal: 30000000, action: 'KEEP' },
  { name: 'GTM - Roblox', monthlyAmount: 1666667, fyTotal: 20000000, action: 'CUT' },
  { name: 'LinkedIn Premium', monthlyAmount: 1100000, fyTotal: 13200000, action: 'KEEP' },
  { name: 'Merchandise', monthlyAmount: 416667, fyTotal: 5000000, action: 'CUT' },
  { name: 'Operational BD', monthlyAmount: 3333333, fyTotal: 40000000, action: 'REDUCE' },
  { name: 'Operational General', monthlyAmount: 2000000, fyTotal: 24000000, action: 'KEEP' },
  { name: 'Paid Media Global', monthlyAmount: 0, fyTotal: 0, action: 'CUT' },
  { name: 'Visit to Abroad/Intl Partnership', monthlyAmount: 2916667, fyTotal: 35000000, action: 'CUT' },
];

// Grand totals
export const GRAND_TOTAL = {
  fyBefore: 5697586724,
  fyAfter: 4438698974,
  totalSavings: 1258887750,
};

// ─── Monthly Expense by Category (Jan–Dec) ────────────────────────────────
// Derived from quarterly totals; each quarter distributed evenly across 3 months.
export const CATEGORY_MONTHLY: Record<BudgetCategory, number[]> = {
  'CAPEX':                        [118753156,118753156,118753155, 0,0,0, 0,0,0, 0,0,0],
  'GA - Server Cost':             [8000000,8000000,8000000, 8000000,8000000,8000000, 8333334,8333333,8333333, 9000000,9000000,9000000],
  'GA - Software & License Fee':  [6950907,6950907,6950907, 20704046,20704045,20704045, 6750907,6750907,6750907, 8137574,8137574,8137573],
  'Manpower':                     [389546830,389546829,389546829, 372619113,372619113,372619112, 372619113,372619113,372619112, 372619113,372619113,372619112],
  'Marketing & Sales Operations': [30600000,30600000,30600000, 57933334,57933333,57933333, 47100000,47100000,47100000, 28766667,28766667,28766666],
  'People Growth (LnD)':          [2200000,2200000,2200000, 2533334,2533333,2533333, 2700000,2700000,2700000, 2700000,2700000,2700000],
  'Project Delivery Expense':     [10128153,10128153,10128152, 4166667,4166667,4166666, 4166667,4166667,4166666, 4166667,4166667,4166666],
};

// ─── Monthly P&L Overview ─────────────────────────────────────────────────
export interface MonthlyPL {
  month: string;
  projRevenue: number;
  actRevenue: number;
  projExpense: number;
  actExpense: number;
}

export const MONTHLY_PL: MonthlyPL[] = [
  { month: 'Jan-26', projRevenue: 244222907,  actRevenue: 244222907,  projExpense: 566179046, actExpense: 467204673 },
  { month: 'Feb-26', projRevenue: 50000000,   actRevenue: 0,          projExpense: 566179045, actExpense: 0 },
  { month: 'Mar-26', projRevenue: 347800000,  actRevenue: 0,          projExpense: 566179043, actExpense: 0 },
  { month: 'Apr-26', projRevenue: 494239200,  actRevenue: 0,          projExpense: 465956494, actExpense: 0 },
  { month: 'May-26', projRevenue: 426950000,  actRevenue: 0,          projExpense: 465956491, actExpense: 0 },
  { month: 'Jun-26', projRevenue: 50000000,   actRevenue: 0,          projExpense: 465956489, actExpense: 0 },
  { month: 'Jul-26', projRevenue: 179250000,  actRevenue: 0,          projExpense: 441670021, actExpense: 0 },
  { month: 'Aug-26', projRevenue: 50000000,   actRevenue: 50000000,   projExpense: 441670020, actExpense: 0 },
  { month: 'Sep-26', projRevenue: 279250000,  actRevenue: 0,          projExpense: 441670018, actExpense: 0 },
  { month: 'Oct-26', projRevenue: 50000000,   actRevenue: 0,          projExpense: 425390021, actExpense: 0 },
  { month: 'Nov-26', projRevenue: 9000000,    actRevenue: 9000000,    projExpense: 425390021, actExpense: 0 },
  { month: 'Dec-26', projRevenue: 50000000,   actRevenue: 50000000,   projExpense: 425390017, actExpense: 0 },
];

// ─── Revenue Projection by Project ────────────────────────────────────────
export interface RevenueProject {
  name: string;
  monthly: number[]; // 12 months Jan–Dec
}

export const REVENUE_PROJECTS: RevenueProject[] = [
  { name: 'Cow Play Cow Moo',                    monthly: [50000000,50000000,50000000, 50000000,50000000,50000000, 50000000,50000000,50000000, 50000000,50000000,50000000] },
  { name: 'DANA - Last War',                     monthly: [140492800,0,0, 140492800,70246400,0, 0,0,0, 0,0,0] },
  { name: 'Bank Jago - Server 2026',             monthly: [0,27000000,0, 27000000,0,0, 0,0,0, 0,0,0] },
  { name: 'BCA - Periode 5',                     monthly: [0,0,246800000, 246800000,123400000,0, 0,0,0, 0,0,0] },
  { name: 'Bank Jago - Server Q3 & Q4 2024',    monthly: [6500000,0,0, 0,0,0, 0,0,0, 0,0,0] },
  { name: 'Bank Jago - Server 2025',             monthly: [20230107,0,0, 0,0,0, 0,0,0, 0,0,0] },
  { name: 'Astra Maintenance (19 Feb - 10 Apr)', monthly: [0,0,0, 30000000,30000000,0, 0,0,0, 0,0,0] },
  { name: 'SJA - GBA (Server)',                  monthly: [0,0,0, 0,0,6750000, 6750000,0,6750000, 0,0,0] },
  { name: 'Logitech - Desk Makeover',            monthly: [0,0,0, 0,122500000,0, 122500000,0,122500000, 0,0,0] },
  { name: 'LLAB - Interactive Soccer Game',      monthly: [0,0,51000000, 51000000,51000000,0, 0,0,51000000, 0,0,0] },
];

// ─── Monthly Actual Expense by Category ──────────────────────────────────────
// Jan-26 actuals from financial report; future months 0 (to be filled)
export const CATEGORY_MONTHLY_ACTUAL: Record<BudgetCategory, number[]> = {
  'CAPEX':                        [118753156, 0,0, 0,0,0, 0,0,0, 0,0,0],
  'GA - Server Cost':             [8000000,   0,0, 0,0,0, 0,0,0, 0,0,0],
  'GA - Software & License Fee':  [6950907,   0,0, 0,0,0, 0,0,0, 0,0,0],
  'Manpower':                     [294250000, 0,0, 0,0,0, 0,0,0, 0,0,0],
  'Marketing & Sales Operations': [18000000,  0,0, 0,0,0, 0,0,0, 0,0,0],
  'People Growth (LnD)':          [2200000,   0,0, 0,0,0, 0,0,0, 0,0,0],
  'Project Delivery Expense':     [19050610,  0,0, 0,0,0, 0,0,0, 0,0,0],
};

// Format IDR value
export function formatIDR(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return String(value);
  }
  return new Intl.NumberFormat('id-ID').format(value);
}
