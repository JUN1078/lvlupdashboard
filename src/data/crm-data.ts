// ─── CRM Data ─────────────────────────────────────────────────────────────────

export type DealCategory = 'new-2026' | 'carry-over' | 'on-hold' | 'deal-won' | 'deal-lost';

export interface CrmDeal {
  id: number;
  client: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  stage: 'Needs Analysis' | 'Proposal Sent' | 'Negotiation' | 'Verbal Commit' | 'Deal Won' | 'On Hold' | 'Deal Lost';
  confidence: 'Hot' | 'Warm' | 'Lukewarm';
  value: number;
  expectedClose: string;
  owner: string;
  link?: string;
  description?: string;
  category?: DealCategory;
}

export interface CrmLead {
  id: number;
  contactName: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  source: 'Event' | 'Referral' | 'Email' | 'Website' | 'LinkedIn';
  link?: string;
  description?: string;
}

export interface CrmCompany {
  id: number;
  leadName: string;
  type: string;
  funnelStage: 'Cold' | 'Hot' | 'Warm';
  date: string;
  email: string;
  source: string;
  direction: 'Inbound' | 'Outbound';
  link?: string;
  description?: string;
}

export interface CrmContact {
  id: number;
  contactName: string;
  company: string;
  lastOpportunity: string;
  retainStatus: boolean;
  link?: string;
  description?: string;
}

export const CRM_DEALS: CrmDeal[] = [
  // ── New Opportunity 2026 ──────────────────────────────────────
  { id: 1, client: 'Zynga - Playable Ads', priority: 'High', stage: 'Needs Analysis', confidence: 'Warm', value: 250, expectedClose: '2026-06-30', owner: 'Junialdi', category: 'new-2026' },
  { id: 2, client: 'DANAMON - Mobile Branch', priority: 'High', stage: 'Needs Analysis', confidence: 'Hot', value: 250, expectedClose: '2026-05-31', owner: 'Cipto', category: 'new-2026' },
  { id: 3, client: 'Univ. Cendrawasih - VR Lab', priority: 'Critical', stage: 'Needs Analysis', confidence: 'Lukewarm', value: 1000, expectedClose: '2026-09-30', owner: 'Junialdi', category: 'new-2026' },
  { id: 4, client: 'BPK Penabur - DigiSmart', priority: 'High', stage: 'Proposal Sent', confidence: 'Hot', value: 350, expectedClose: '2026-04-30', owner: 'Cipto', category: 'new-2026' },
  { id: 5, client: 'Citilink - Loyalty System', priority: 'High', stage: 'Negotiation', confidence: 'Hot', value: 300, expectedClose: '2026-04-15', owner: 'Junialdi', category: 'new-2026' },
  { id: 6, client: 'Concert on Roblox', priority: 'Medium', stage: 'Proposal Sent', confidence: 'Warm', value: 350, expectedClose: '2026-05-31', owner: 'Aldo', category: 'new-2026' },
  { id: 9, client: 'BCA - Gamification Training', priority: 'High', stage: 'Proposal Sent', confidence: 'Warm', value: 450, expectedClose: '2026-06-30', owner: 'Cipto', category: 'new-2026' },
  { id: 10, client: 'Telkom - AR Experience', priority: 'Medium', stage: 'Needs Analysis', confidence: 'Lukewarm', value: 200, expectedClose: '2026-07-31', owner: 'Junialdi', category: 'new-2026' },

  // ── Carry Over Opportunity (from 2025) ────────────────────────
  { id: 7, client: 'ChildFund - Server Cost', priority: 'Low', stage: 'Verbal Commit', confidence: 'Hot', value: 27, expectedClose: '2026-04-01', owner: 'Cipto', category: 'carry-over', description: 'Carried from Q4 2025 - pending contract renewal' },
  { id: 8, client: 'DANA - Last War Phase 2', priority: 'Critical', stage: 'Negotiation', confidence: 'Hot', value: 500, expectedClose: '2026-05-15', owner: 'Junialdi', category: 'carry-over', description: 'Phase 1 completed Q4 2025, Phase 2 scope expansion' },
  { id: 12, client: 'Unilever - Brand Game', priority: 'Medium', stage: 'Verbal Commit', confidence: 'Warm', value: 280, expectedClose: '2026-04-30', owner: 'Junialdi', category: 'carry-over', description: 'Initial discussions started late 2025' },
  { id: 13, client: 'Garuda Indonesia - Loyalty App', priority: 'High', stage: 'Proposal Sent', confidence: 'Warm', value: 320, expectedClose: '2026-05-31', owner: 'Cipto', category: 'carry-over', description: 'Proposal submitted Dec 2025, awaiting budget approval' },

  // ── On Hold ───────────────────────────────────────────────────
  { id: 14, client: 'Tokopedia - E-commerce Gamification', priority: 'Medium', stage: 'On Hold', confidence: 'Lukewarm', value: 400, expectedClose: '2026-08-31', owner: 'Junialdi', category: 'on-hold', description: 'Client internal restructuring, resume Q3 2026' },
  { id: 15, client: 'Gojek - Driver Training Game', priority: 'Low', stage: 'On Hold', confidence: 'Lukewarm', value: 180, expectedClose: '2026-09-30', owner: 'Reza', category: 'on-hold', description: 'Budget freeze until H2 2026' },

  // ── Deal Won 2026 ─────────────────────────────────────────────
  { id: 11, client: 'Pertamina - Safety VR', priority: 'High', stage: 'Deal Won', confidence: 'Hot', value: 380, expectedClose: '2026-03-15', owner: 'Cipto', category: 'deal-won', description: 'Closed Q1 2026 - Full VR safety training platform' },
  { id: 16, client: 'DANA - Last War Phase 1', priority: 'Critical', stage: 'Deal Won', confidence: 'Hot', value: 350, expectedClose: '2026-02-28', owner: 'Junialdi', category: 'deal-won', description: 'Phase 1 completed and delivered successfully' },
  { id: 17, client: 'PLN - Safety Awareness Game', priority: 'Medium', stage: 'Deal Won', confidence: 'Hot', value: 150, expectedClose: '2026-01-31', owner: 'Arif', category: 'deal-won', description: 'Quick win - mobile safety quiz platform' },

  // ── Deal Lost 2026 ────────────────────────────────────────────
  { id: 18, client: 'Shopee - Seller Gamification', priority: 'High', stage: 'Deal Lost', confidence: 'Warm', value: 500, expectedClose: '2026-03-31', owner: 'Junialdi', category: 'deal-lost', description: 'Lost to competitor - pricing mismatch' },
  { id: 19, client: 'XL Axiata - Loyalty Points', priority: 'Medium', stage: 'Deal Lost', confidence: 'Lukewarm', value: 220, expectedClose: '2026-02-28', owner: 'Cipto', category: 'deal-lost', description: 'Client decided to build in-house solution' },
];

export const CRM_LEADS: CrmLead[] = [
  { id: 1, contactName: 'Ahmad Rizki', title: 'VP Digital', company: 'Bank Mandiri', phone: '+62 812-3456-7890', email: 'ahmad.rizki@mandiri.co.id', source: 'Event' },
  { id: 2, contactName: 'Siti Nurhaliza', title: 'Head of Innovation', company: 'Telkomsel', phone: '+62 813-2345-6789', email: 'siti.n@telkomsel.co.id', source: 'LinkedIn' },
  { id: 3, contactName: 'Budi Santoso', title: 'CTO', company: 'Tokopedia', phone: '+62 811-4567-8901', email: 'budi.s@tokopedia.com', source: 'Referral' },
  { id: 4, contactName: 'Dewi Anggraini', title: 'Marketing Director', company: 'Unilever Indonesia', phone: '+62 814-5678-9012', email: 'dewi.a@unilever.com', source: 'Event' },
  { id: 5, contactName: 'Rendra Prasetya', title: 'Head of L&D', company: 'Pertamina', phone: '+62 815-6789-0123', email: 'rendra.p@pertamina.com', source: 'Website' },
  { id: 6, contactName: 'Maya Kartika', title: 'Digital Manager', company: 'Garuda Indonesia', phone: '+62 816-7890-1234', email: 'maya.k@garuda.co.id', source: 'Email' },
  { id: 7, contactName: 'Hendra Wijaya', title: 'VP Product', company: 'Gojek', phone: '+62 817-8901-2345', email: 'hendra.w@gojek.com', source: 'LinkedIn' },
  { id: 8, contactName: 'Putri Rahayu', title: 'Education Director', company: 'BPK Penabur', phone: '+62 818-9012-3456', email: 'putri.r@bpkpenabur.or.id', source: 'Referral' },
  { id: 9, contactName: 'Farid Abdullah', title: 'IT Director', company: 'Citilink', phone: '+62 819-0123-4567', email: 'farid.a@citilink.co.id', source: 'Event' },
  { id: 10, contactName: 'Lina Susanti', title: 'HR Director', company: 'Astra International', phone: '+62 821-1234-5678', email: 'lina.s@astra.co.id', source: 'Event' },
  { id: 11, contactName: 'Arif Wibowo', title: 'Head of Digital', company: 'Bank BCA', phone: '+62 822-2345-6789', email: 'arif.w@bca.co.id', source: 'Website' },
  { id: 12, contactName: 'Rina Marlina', title: 'VP Marketing', company: 'Indofood', phone: '+62 823-3456-7890', email: 'rina.m@indofood.co.id', source: 'LinkedIn' },
  { id: 13, contactName: 'Dimas Pramudya', title: 'CIO', company: 'PLN', phone: '+62 824-4567-8901', email: 'dimas.p@pln.co.id', source: 'Event' },
  { id: 14, contactName: 'Nur Aisyah', title: 'Dean of Engineering', company: 'Univ. Cendrawasih', phone: '+62 825-5678-9012', email: 'nur.a@uncen.ac.id', source: 'Referral' },
  { id: 15, contactName: 'Taufik Hidayat', title: 'Program Director', company: 'ChildFund', phone: '+62 826-6789-0123', email: 'taufik.h@childfund.org', source: 'Email' },
];

export const CRM_COMPANIES: CrmCompany[] = [
  { id: 1, leadName: 'Bank Mandiri - Digital Transformation', type: 'Enterprise', funnelStage: 'Hot', date: '2026-03-10', email: 'digital@mandiri.co.id', source: 'Event Exhibition', direction: 'Inbound' },
  { id: 2, leadName: 'Telkomsel - Gamification Platform', type: 'Enterprise', funnelStage: 'Warm', date: '2026-03-05', email: 'innovation@telkomsel.co.id', source: 'LinkedIn Ads', direction: 'Outbound' },
  { id: 3, leadName: 'Gojek - Driver Training Game', type: 'Tech', funnelStage: 'Cold', date: '2026-02-28', email: 'product@gojek.com', source: 'Referral', direction: 'Inbound' },
  { id: 4, leadName: 'Astra - Leadership Simulation', type: 'Conglomerate', funnelStage: 'Warm', date: '2026-03-15', email: 'hr@astra.co.id', source: 'Event Attend', direction: 'Inbound' },
  { id: 5, leadName: 'PLN - Safety Training VR', type: 'State-Owned', funnelStage: 'Hot', date: '2026-03-20', email: 'training@pln.co.id', source: 'SEO', direction: 'Inbound' },
  { id: 6, leadName: 'Indofood - Brand Engagement', type: 'FMCG', funnelStage: 'Cold', date: '2026-02-15', email: 'marketing@indofood.co.id', source: 'Content Marketing', direction: 'Outbound' },
  { id: 7, leadName: 'UAE HR Consultancy - GBA Partnership', type: 'International', funnelStage: 'Warm', date: '2026-03-18', email: 'partnerships@snk.ae', source: 'International Partnership', direction: 'Outbound' },
];

export const CRM_CONTACTS: CrmContact[] = [
  { id: 1, contactName: 'Farid Abdullah', company: 'Citilink', lastOpportunity: 'Loyalty System', retainStatus: true },
  { id: 2, contactName: 'Putri Rahayu', company: 'BPK Penabur', lastOpportunity: 'DigiSmart Platform', retainStatus: true },
  { id: 3, contactName: 'Taufik Hidayat', company: 'ChildFund', lastOpportunity: 'Server Cost', retainStatus: true },
  { id: 4, contactName: 'Rendra Prasetya', company: 'Pertamina', lastOpportunity: 'Safety VR Training', retainStatus: true },
  { id: 5, contactName: 'Michael Chen', company: 'DANA', lastOpportunity: 'Last War Phase 1', retainStatus: true },
  { id: 6, contactName: 'Sarah Johnson', company: 'Zynga', lastOpportunity: 'Playable Ads Concept', retainStatus: false },
  { id: 7, contactName: 'Dewi Anggraini', company: 'Unilever', lastOpportunity: 'Brand Game Proposal', retainStatus: true },
  { id: 8, contactName: 'Arif Wibowo', company: 'Bank BCA', lastOpportunity: 'Gamification Training', retainStatus: true },
  { id: 9, contactName: 'Nur Aisyah', company: 'Univ. Cendrawasih', lastOpportunity: 'VR Lab Setup', retainStatus: false },
  { id: 10, contactName: 'Kevin Tan', company: 'Concert Platform', lastOpportunity: 'Roblox Concert', retainStatus: true },
  { id: 11, contactName: 'Budi Santoso', company: 'Tokopedia', lastOpportunity: 'E-commerce Gamification', retainStatus: false },
  { id: 12, contactName: 'Ahmad Rizki', company: 'Bank Mandiri', lastOpportunity: 'Digital Branch Game', retainStatus: true },
];
