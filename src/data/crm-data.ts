// ─── CRM Data ─────────────────────────────────────────────────────────────────
// Source: GF_Deal_Opportunities & GF_Leads Excel exports (Mar 2026)

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
  { id: 1,  client: 'Grab - Magical Airport Experience',              priority: 'Critical', stage: 'Needs Analysis', confidence: 'Lukewarm', value: 75,   expectedClose: '2026-03-30', owner: 'Auliya',   category: 'new-2026', description: 'Brand Engagement - On-ground Activation · Media & Entertainment' },
  { id: 2,  client: 'Arkiv - Cafe Experience',                        priority: 'High',     stage: 'Needs Analysis', confidence: 'Lukewarm', value: 100,  expectedClose: '2026-04-30', owner: 'Junialdi', category: 'new-2026', description: 'Brand Engagement - Media & Entertainment' },
  { id: 3,  client: 'LLAB - Lenovo Tablet AR Experience',             priority: 'High',     stage: 'Negotiation',    confidence: 'Warm',     value: 300,  expectedClose: '2026-03-31', owner: 'Auliya',   category: 'new-2026', description: 'Brand Engagement - Creative Agency' },
  { id: 4,  client: 'Zynga - Playable Ads Production',                priority: 'High',     stage: 'Needs Analysis', confidence: 'Lukewarm', value: 250,  expectedClose: '2026-04-30', owner: 'Auliya',   category: 'new-2026', description: 'Brand Engagement - Gaming / Metaverse' },
  { id: 5,  client: 'DANAMON - Gamification on Mobile Branch',        priority: 'Critical', stage: 'Needs Analysis', confidence: 'Warm',     value: 250,  expectedClose: '2026-04-30', owner: 'Auliya',   category: 'new-2026', description: 'Brand Engagement - Finance' },
  { id: 6,  client: 'Universitas Cendrawasih - VR Pharmacology Lab',  priority: 'Medium',   stage: 'Needs Analysis', confidence: 'Lukewarm', value: 1000, expectedClose: '2026-06-30', owner: 'Auliya',   category: 'new-2026', description: 'People Growth - TVET Education' },
  { id: 7,  client: 'LinkVN - Kopiko Vietnam',                        priority: 'Medium',   stage: 'Needs Analysis', confidence: 'Warm',     value: 50,   expectedClose: '2026-03-31', owner: 'Auliya',   category: 'new-2026', description: 'Brand Engagement - Digital Agency' },
  { id: 8,  client: 'BPK Penabur - DigiSmart Project',                priority: 'High',     stage: 'Proposal Sent',  confidence: 'Lukewarm', value: 350,  expectedClose: '2026-04-30', owner: 'Auliya',   category: 'new-2026', description: 'People Growth - Education' },
  { id: 9,  client: 'Akebono - Game-based Learning Anti-Phishing',    priority: 'Medium',   stage: 'Proposal Sent',  confidence: 'Lukewarm', value: 75,   expectedClose: '2026-04-30', owner: 'Auliya',   category: 'new-2026', description: 'People Growth - Manufacturing' },
  { id: 10, client: 'Citilink - Gamification Loyalty System',         priority: 'High',     stage: 'Negotiation',    confidence: 'Warm',     value: 300,  expectedClose: '2026-04-15', owner: 'Auliya',   category: 'new-2026', description: 'Brand Engagement - Government / Aviation' },
  { id: 11, client: 'Concert Experience on Roblox',                   priority: 'Medium',   stage: 'Proposal Sent',  confidence: 'Hot',      value: 350,  expectedClose: '2026-03-31', owner: 'Junialdi', category: 'new-2026', description: 'Brand Engagement - Gaming / Metaverse' },
  { id: 12, client: 'LLAB - IdeaTab Run 2',                           priority: 'Medium',   stage: 'Proposal Sent',  confidence: 'Lukewarm', value: 350,  expectedClose: '2026-03-31', owner: 'Auliya',   category: 'new-2026', description: 'Brand Engagement - Creative Agency' },
  { id: 13, client: 'Erafone - Casual Game',                          priority: 'High',     stage: 'Proposal Sent',  confidence: 'Warm',     value: 200,  expectedClose: '2026-04-30', owner: 'Auliya',   category: 'new-2026', description: 'Brand Engagement - Retail' },
  { id: 14, client: 'DMIA - VR Fire Simulation',                      priority: 'High',     stage: 'Needs Analysis', confidence: 'Lukewarm', value: 300,  expectedClose: '2026-05-29', owner: 'Auliya',   category: 'new-2026', description: 'People Growth - Manufacturing' },

  // ── Carry Over Opportunity (from 2025) ────────────────────────
  { id: 20, client: 'GDP - IP Expo 2026 - Branded Games',             priority: 'Medium',   stage: 'Proposal Sent',  confidence: 'Lukewarm', value: 375,  expectedClose: '2026-06-30', owner: 'Auliya',   category: 'carry-over', description: 'Brand Engagement - Creative Agency' },
  { id: 21, client: 'Bola.com - Games for World Cup 2026',            priority: 'High',     stage: 'Proposal Sent',  confidence: 'Lukewarm', value: 125,  expectedClose: '2026-06-30', owner: 'Auliya',   category: 'carry-over', description: 'Brand Engagement - Media & Entertainment' },
  { id: 22, client: 'LLAB - IdeaTab Extension',                       priority: 'Medium',   stage: 'Proposal Sent',  confidence: 'Warm',     value: 165,  expectedClose: '2026-04-30', owner: 'Auliya',   category: 'carry-over', description: 'Brand Engagement - Creative Agency' },
  { id: 23, client: 'BNPB - VR Immersive Training',                   priority: 'High',     stage: 'Negotiation',    confidence: 'Hot',      value: 3000, expectedClose: '2026-06-30', owner: 'Auliya',   category: 'carry-over', description: 'People Growth - Government · Large deal carried from 2025' },

  // ── On Hold ───────────────────────────────────────────────────
  { id: 30, client: 'PT TCBI - Sacred Octagon Math Game',             priority: 'Low',      stage: 'On Hold',        confidence: 'Hot',      value: 750,  expectedClose: '2026-06-30', owner: 'Auliya',   category: 'on-hold', description: 'People Growth - Technology · Re-engineering scope TBD' },
  { id: 31, client: 'TNI AU - Fighter Jet Simulator',                  priority: 'Medium',   stage: 'On Hold',        confidence: 'Warm',     value: 4125, expectedClose: '2026-09-30', owner: 'Auliya',   category: 'on-hold', description: 'People Growth - Government · Large simulator project' },
  { id: 32, client: 'Ally Universe - Arcade Games for OTT',           priority: 'Low',      stage: 'On Hold',        confidence: 'Warm',     value: 150,  expectedClose: '2026-06-30', owner: 'Auliya',   category: 'on-hold', description: 'Brand Engagement - Media & Entertainment' },
  { id: 33, client: 'Giz.de ID - GBL for Green Jobs & GESI',         priority: 'Low',      stage: 'On Hold',        confidence: 'Lukewarm', value: 300,  expectedClose: '2026-06-30', owner: 'Auliya',   category: 'on-hold', description: 'People Growth - NPO' },

  // ── Deal Won 2026 ─────────────────────────────────────────────
  { id: 40, client: 'Bank Jago - Annual Server Cost 2026',            priority: 'Medium',   stage: 'Deal Won',       confidence: 'Hot',      value: 27,   expectedClose: '2026-01-29', owner: 'Auliya',   category: 'deal-won', description: 'General - Finance · Actual: IDR 27M' },
  { id: 41, client: 'Astra Virtueverse - Knowledge Sharing 2026',    priority: 'Medium',   stage: 'Deal Won',       confidence: 'Hot',      value: 60,   expectedClose: '2026-02-18', owner: 'Auliya',   category: 'deal-won', description: 'People Growth - Conglomerates · Actual: IDR 60M' },
  { id: 42, client: 'BCA - Gebyar BCA Periode 5',                     priority: 'High',     stage: 'Deal Won',       confidence: 'Hot',      value: 617,  expectedClose: '2026-01-15', owner: 'Auliya',   category: 'deal-won', description: 'Brand Engagement - Finance · Actual: IDR 617M' },
  { id: 43, client: 'Logitech for Business - Desk Make Over',         priority: 'High',     stage: 'Verbal Commit',  confidence: 'Hot',      value: 245,  expectedClose: '2026-03-10', owner: 'Auliya',   category: 'deal-won', description: 'Brand Engagement - Technology · Actual: IDR 245M' },
  { id: 44, client: 'LLAB - Retail Experience',                       priority: 'Critical', stage: 'Deal Won',       confidence: 'Hot',      value: 99,   expectedClose: '2026-03-17', owner: 'Auliya',   category: 'deal-won', description: 'Brand Engagement - Creative Agency · Actual: IDR 99M' },
  { id: 45, client: 'ChildFund - Ulun Lampung Server Cost',           priority: 'Critical', stage: 'Deal Won',       confidence: 'Hot',      value: 27,   expectedClose: '2026-03-17', owner: 'Bima',     category: 'deal-won', description: 'General - NGO · Annual server renewal' },

  // ── Deal Lost 2026 ────────────────────────────────────────────
  { id: 50, client: 'TRESemmé - AI Style Creator',                    priority: 'Medium',   stage: 'Deal Lost',      confidence: 'Lukewarm', value: 150,  expectedClose: '2026-01-23', owner: 'Auliya',   category: 'deal-lost', description: 'Brand Engagement - Creative Agency' },
  { id: 51, client: 'AdQuest - HTML5 Games Platform',                 priority: 'Medium',   stage: 'Deal Lost',      confidence: 'Warm',     value: 75,   expectedClose: '2026-01-09', owner: 'Auliya',   category: 'deal-lost', description: 'Brand Engagement - Gaming / Metaverse' },
  { id: 52, client: 'Lion Parcel - Roblox Activation',                priority: 'Medium',   stage: 'Deal Lost',      confidence: 'Lukewarm', value: 75,   expectedClose: '2026-01-26', owner: 'Auliya',   category: 'deal-lost', description: 'Brand Engagement - Logistics' },
  { id: 53, client: 'Shopee - Roblox Games',                          priority: 'Medium',   stage: 'Deal Lost',      confidence: 'Lukewarm', value: 125,  expectedClose: '2026-01-29', owner: 'Auliya',   category: 'deal-lost', description: 'Brand Engagement - Retail' },
  { id: 54, client: 'Zari Gaming Studio - Al-Fateh FC Roblox',        priority: 'Medium',   stage: 'Deal Lost',      confidence: 'Lukewarm', value: 150,  expectedClose: '2026-01-23', owner: 'Auliya',   category: 'deal-lost', description: 'Brand Engagement - Gaming / Metaverse' },
  { id: 55, client: 'GPN - OPLA',                                     priority: 'Medium',   stage: 'Deal Lost',      confidence: 'Lukewarm', value: 300,  expectedClose: '2026-02-02', owner: 'Auliya',   category: 'deal-lost', description: 'Brand Engagement - Creative Agency' },
  { id: 56, client: 'Adeka Al Otaiba - HR Policy Course',             priority: 'High',     stage: 'Deal Lost',      confidence: 'Lukewarm', value: 600,  expectedClose: '2026-03-31', owner: 'Auliya',   category: 'deal-lost', description: 'People Growth - Manufacturing' },
];

export const CRM_LEADS: CrmLead[] = [
  // 2026 Quality & Warm Leads
  { id: 1,  contactName: 'Parth Nigam',             title: 'Product Marketing Lead',              company: 'Grab',                            phone: '', email: 'parth.nigam@grabtaxi.com',               source: 'Referral',  description: 'External Referral · Quality Lead · 2026-03-27' },
  { id: 2,  contactName: 'Brian Chua',              title: 'Journalist / BD',                     company: 'Tech in Asia Malaysia',           phone: '', email: 'brian@techinasia.com',                   source: 'Referral',  description: 'Internal Referral · Quality Lead · 2026-03-26' },
  { id: 3,  contactName: 'Jimmy Prawira',           title: 'Procurement Specialist',              company: 'Bank Danamon',                    phone: '', email: 'jimmy.prawira@danamon.co.id',            source: 'Website',   description: 'Website Lead · Quality Lead · 2026-03-09' },
  { id: 4,  contactName: 'Elliya Wijaya',           title: 'Head of People Operations',           company: 'Mekari',                          phone: '', email: 'elliya.wijaya@mekari.com',               source: 'Event',     description: 'Event Attend · 2026-03-10' },
  { id: 5,  contactName: 'Brian Widjaja',           title: 'Director of Marketing',               company: 'DBC Group',                       phone: '', email: 'brianwidjaja@dbc.co.id',                source: 'Email',     description: 'Email Marketing · Quality Lead · 2026-03-10' },
  { id: 6,  contactName: 'Ricky Arnold',            title: 'Responsable Culture & Communication', company: 'Institut Français Indonesia (IFI)', phone: '', email: 'ricky.arnold@ifi-id.com',              source: 'Referral',  description: 'Internal Referral · 2026-03-06' },
  { id: 7,  contactName: 'Tomy Hendrawan',          title: 'Head of Marketing Development',       company: 'Rumah Zakat Indonesia',           phone: '', email: 'tomy.hendrawan@rumahzakat.org',          source: 'Email',     description: 'Email Marketing · Quality Lead · 2026-03-03' },
  { id: 8,  contactName: 'Jessica Darmasaputri',   title: 'Sr. Secretary to CEO',               company: 'F&B Indonesia',                   phone: '', email: 'jessica.darmasaputri@fbindonesia.co.id', source: 'Event',     description: 'Event Attend · Quality Lead · 2026-03-05' },
  { id: 9,  contactName: 'Ujang Mulyadi',           title: 'Business Development & Marketing',    company: 'Indonesia Heritage Agency',       phone: '', email: 'ujang.mulyadi@kemendikbud.go.id',        source: 'Referral',  description: 'Internal Referral · 2026-02-13' },
  { id: 10, contactName: 'Fierman Authar',          title: 'Head of Consumer Engagement',         company: 'PT Indofood Sukses Makmur',       phone: '', email: 'fierman.authar@icbp.indofood.co.id',     source: 'Email',     description: 'Email Marketing · 2026-02-28' },
  { id: 11, contactName: 'Stephen Angkiwirang',    title: 'Head of GoPay Online & B2B',          company: 'GoPay',                           phone: '', email: '',                                        source: 'Referral',  description: 'Internal Referral · 2026-01-19' },
  { id: 12, contactName: 'Rian Rahadian',           title: 'Head of Marketing & Acquisition',     company: 'Bank Ina Persada',                phone: '', email: 'muhammad.rahadian@bankina.co.id',         source: 'LinkedIn',  description: 'LinkedIn · Quality Lead · 2026-01-09' },
  { id: 13, contactName: 'Riyan Nurul Hakim',       title: 'E-commerce Expertise',                company: 'Foom',                            phone: '', email: 'riyan@foom.id',                          source: 'Referral',  description: 'Internal Referral · Quality Lead · 2026-01-09' },
  { id: 14, contactName: 'Brenda Polynska Ruth',    title: 'HR Manager',                          company: 'PT Hitachi Channel Solutions',    phone: '', email: 'bsihombing@hitachi-ch.co.id',            source: 'Website',   description: 'Website · Quality Lead · 2026-01-22' },
  { id: 15, contactName: 'Subhan Novianda Mani',   title: 'VP Digital & Teknologi Informasi',    company: 'Biofarma',                        phone: '', email: 'subhan.novianda@biofarma.co.id',         source: 'Event',     description: 'Event Attend · Quality Lead · 2026-01-06' },
  { id: 16, contactName: 'Eko Ralesiya Ramadhan',  title: 'IT Manager',                          company: 'PT Akebono Brake Astra Indonesia', phone: '', email: 'eko.r@akebono-astra.co.id',             source: 'Event',     description: 'Event Attend · Quality Lead · 2026-01-13' },
  { id: 17, contactName: 'Rene De Paus',            title: 'Country Director of Growth Indonesia', company: 'Design Bridge',                  phone: '', email: 'rene.depaus@designbridge.com',           source: 'Event',     description: 'Event Attend · Quality Lead · 2026-01-05' },
  { id: 18, contactName: 'Juli Pandapotan Simarmata', title: 'Procurement',                       company: 'Denso Manufacturing Indonesia',  phone: '', email: 'juli.pandapotan.simarmata.a4w@denso.co.id', source: 'Referral', description: 'External Referral · Quality Lead · 2026-03-13' },
  { id: 19, contactName: 'Nabila Zara Islami',      title: 'Marketing',                           company: 'Kredivo',                         phone: '', email: 'nabila.islami@finaccel.co.id',           source: 'Website',   description: 'Website · Warm Lead · 2026-03-30' },
  { id: 20, contactName: 'andrew sulistya',         title: 'Marketing Director',                  company: 'Bernofarm',                       phone: '', email: 'andrewsulistya@bernofarm.com',           source: 'Email',     description: 'Email Marketing · 2026-03-17' },
];

export const CRM_COMPANIES: CrmCompany[] = [
  { id: 1,  leadName: 'Grab - Airport Experience Activation',         type: 'Tech / Startup',  funnelStage: 'Warm', date: '2026-03-27', email: 'parth.nigam@grabtaxi.com',         source: 'External Referral', direction: 'Inbound' },
  { id: 2,  leadName: 'DANAMON - Mobile Branch Gamification',         type: 'Finance',          funnelStage: 'Warm', date: '2026-03-15', email: 'jimmy.prawira@danamon.co.id',      source: 'Website',           direction: 'Inbound' },
  { id: 3,  leadName: 'Mekari - People Ops Game',                     type: 'Tech / SaaS',      funnelStage: 'Cold', date: '2026-03-10', email: 'elliya.wijaya@mekari.com',         source: 'Event Attend',      direction: 'Inbound' },
  { id: 4,  leadName: 'GoPay - B2B Gamification',                     type: 'Fintech',          funnelStage: 'Warm', date: '2026-01-19', email: '',                                 source: 'Internal Referral', direction: 'Inbound' },
  { id: 5,  leadName: 'Biofarma - Digital Learning',                  type: 'Pharmaceutical',   funnelStage: 'Warm', date: '2026-01-06', email: 'subhan.novianda@biofarma.co.id',   source: 'Event Attend',      direction: 'Inbound' },
  { id: 6,  leadName: 'Foom - Brand Engagement Game',                 type: 'FMCG / Vape',      funnelStage: 'Hot',  date: '2026-01-09', email: 'riyan@foom.id',                    source: 'Internal Referral', direction: 'Inbound' },
  { id: 7,  leadName: 'Hitachi Channel Solutions - HR Game',          type: 'Manufacturing',    funnelStage: 'Warm', date: '2026-01-22', email: 'bsihombing@hitachi-ch.co.id',      source: 'Website',           direction: 'Inbound' },
];

export const CRM_CONTACTS: CrmContact[] = [
  { id: 1,  contactName: 'Auliya Hidayati',          company: 'Gamification Factory (GF)', lastOpportunity: 'Account Manager - All 2026 Deals',  retainStatus: true },
  { id: 2,  contactName: 'Parth Nigam',              company: 'Grab',                      lastOpportunity: 'Magical Airport Experience',          retainStatus: true },
  { id: 3,  contactName: 'Jimmy Prawira',            company: 'Bank Danamon',              lastOpportunity: 'Mobile Branch Gamification',           retainStatus: true },
  { id: 4,  contactName: 'Stephen Angkiwirang',     company: 'GoPay',                     lastOpportunity: 'B2B Gamification Platform',            retainStatus: true },
  { id: 5,  contactName: 'Eko Ralesiya Ramadhan',   company: 'PT Akebono Brake Astra',    lastOpportunity: 'Anti-Phishing Game-based Learning',    retainStatus: true },
  { id: 6,  contactName: 'Subhan Novianda Mani',    company: 'Biofarma',                  lastOpportunity: 'Digital & IT Gamification',            retainStatus: true },
  { id: 7,  contactName: 'Riyan Nurul Hakim',        company: 'Foom',                      lastOpportunity: 'Brand Engagement Game',                 retainStatus: true },
  { id: 8,  contactName: 'Junialdi Dwija Putra',    company: 'Gamification Factory (GF)', lastOpportunity: 'Concert Experience on Roblox',         retainStatus: true },
  { id: 9,  contactName: 'Brenda Polynska Ruth',    company: 'PT Hitachi Channel Solutions', lastOpportunity: 'HR Training Game',                 retainStatus: false },
  { id: 10, contactName: 'Rene De Paus',             company: 'Design Bridge',             lastOpportunity: 'Brand Activation Project',             retainStatus: true },
  { id: 11, contactName: 'Brian Widjaja',            company: 'DBC Group',                 lastOpportunity: 'Marketing Gamification',               retainStatus: false },
  { id: 12, contactName: 'Tomy Hendrawan',           company: 'Rumah Zakat Indonesia',     lastOpportunity: 'Donor Engagement Game',                 retainStatus: true },
];
