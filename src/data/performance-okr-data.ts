// ─── Performance Management Data ─────────────────────────────────────────────
import { CREW_MEMBERS } from './crew-data';

export type PillarKey = 'P1' | 'P2' | 'P3' | 'P4';
export type BSCPerspective = 'Financial' | 'Customer' | 'Internal' | 'Learning';
export type OKRStatus = 'On Track' | 'Below' | 'Far Below' | 'Off Track' | 'Exceptional' | 'Above';
export type LevelKey = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type PDCAPhase = 'PLAN' | 'DO' | 'CHECK' | 'ACT';
export type InitiativePriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type SubmissionStatus = 'Draft' | 'Pending' | 'Manager Approved' | 'Approved' | 'Revision' | 'Rejected';

// ─── OKR Items ────────────────────────────────────────────────────────────────

export interface OKRItem {
  id: string;
  type: 'O' | 'KR';
  pillar: PillarKey;
  team: string;
  subject: string;
  metric: string;
  pic: string;
  yearlyTarget: string;
  q1Target: string;
  q2Target: string;
  q3Target: string;
  q4Target: string;
  actual?: string;
  status: OKRStatus;
}

export const OKR_ITEMS: OKRItem[] = [
  // ── P1: Growth & EBITDA ──────────────────────────────────────────────────
  { id: 'p1-o', type: 'O', pillar: 'P1', team: 'Division', subject: 'Achieve Revenue & EBITDA targets for FY2026', metric: 'IDR', pic: 'Junialdi', yearlyTarget: 'IDR 8.5B', q1Target: '1.5B', q2Target: '1.5B', q3Target: '1.5B', q4Target: '3.0B', status: 'Below' },
  { id: 'p1-kr1', type: 'KR', pillar: 'P1', team: 'Business Head', subject: 'Secure IDR 8.5B from project service & product', metric: 'Revenue (IDR)', pic: 'Junialdi', yearlyTarget: 'IDR 8.5B', q1Target: '1.5B', q2Target: '1.5B', q3Target: '1.5B', q4Target: '3.0B', actual: '0.294B', status: 'Below' },
  { id: 'p1-kr2', type: 'KR', pillar: 'P1', team: 'Business Head', subject: 'Generate IDR 3B book revenue for 2027', metric: 'Rolling Revenue', pic: 'Junialdi', yearlyTarget: 'IDR 3B', q1Target: '-', q2Target: '-', q3Target: '-', q4Target: '3.0B', status: 'Far Below' },
  { id: 'p1-kr3', type: 'KR', pillar: 'P1', team: 'Business Head', subject: 'Achieve minimum EBITDA target', metric: 'EBITDA (IDR)', pic: 'Junialdi', yearlyTarget: 'IDR 1.74B', q1Target: '59.4M', q2Target: '59.4M', q3Target: '59.4M', q4Target: '1,559M', actual: '-3,850M', status: 'Far Below' },

  // ── P2: Product Expansion ─────────────────────────────────────────────────
  { id: 'p2-o', type: 'O', pillar: 'P2', team: 'Division', subject: 'Expand product portfolio and drive digital revenue', metric: 'Multiple', pic: 'Junialdi', yearlyTarget: 'IDR 2B', q1Target: '-', q2Target: '0.5B', q3Target: '1.0B', q4Target: '0.5B', status: 'Below' },
  { id: 'p2-kr1', type: 'KR', pillar: 'P2', team: 'Business Head', subject: 'Increase revenue from GBA products', metric: 'Revenue (IDR)', pic: 'Junialdi', yearlyTarget: 'IDR 1.5B', q1Target: '-', q2Target: '-', q3Target: '750M', q4Target: '750M', status: 'Below' },
  { id: 'p2-kr2', type: 'KR', pillar: 'P2', team: 'Business Head', subject: 'Increase revenue from Roblox products', metric: 'Revenue (IDR)', pic: 'Junialdi', yearlyTarget: 'IDR 500M', q1Target: '-', q2Target: '100M', q3Target: '200M', q4Target: '200M', status: 'Below' },
  { id: 'p2-kr3', type: 'KR', pillar: 'P2', team: 'Business Head', subject: 'On-time launch of GBA', metric: '% On-time', pic: 'Junialdi', yearlyTarget: '100%', q1Target: '100%', q2Target: '100%', q3Target: '100%', q4Target: '100%', actual: '0', status: 'Below' },
  { id: 'p2-kr4', type: 'KR', pillar: 'P2', team: 'Business Head', subject: 'On-time launch of Roblox', metric: '% On-time', pic: 'Junialdi', yearlyTarget: '100%', q1Target: '100%', q2Target: '100%', q3Target: '100%', q4Target: '100%', actual: '0', status: 'Below' },
  { id: 'p2-kr5', type: 'KR', pillar: 'P2', team: 'Business Head', subject: 'Engage partners for GBA', metric: 'Partners', pic: 'Junialdi', yearlyTarget: '1', q1Target: '1', q2Target: '1', q3Target: '1', q4Target: '1', actual: '0', status: 'Below' },
  { id: 'p2-kr6', type: 'KR', pillar: 'P2', team: 'Business Head', subject: 'Expand partners for Roblox', metric: 'Partners', pic: 'Junialdi', yearlyTarget: '2', q1Target: '2', q2Target: '2', q3Target: '2', q4Target: '2', actual: '0', status: 'Below' },
  { id: 'p2-kr7', type: 'KR', pillar: 'P2', team: 'Business Head', subject: 'Improvement Program for Product Team', metric: '% Artifacts', pic: 'Junialdi', yearlyTarget: '100%', q1Target: '100%', q2Target: '100%', q3Target: '100%', q4Target: '100%', actual: '0', status: 'Below' },
  { id: 'p2-kr8', type: 'KR', pillar: 'P2', team: 'Marketing', subject: 'Roblox DAU', metric: 'Avg DAU', pic: 'Hisyam', yearlyTarget: '800', q1Target: '500', q2Target: '600', q3Target: '700', q4Target: '800', actual: '0', status: 'Far Below' },
  { id: 'p2-kr9', type: 'KR', pillar: 'P2', team: 'Marketing', subject: 'Roblox Monthly Visits', metric: 'Avg Visits', pic: 'Hisyam', yearlyTarget: '5,000', q1Target: '3,500', q2Target: '4,000', q3Target: '4,500', q4Target: '5,000', actual: '0', status: 'Far Below' },
  { id: 'p2-kr10', type: 'KR', pillar: 'P2', team: 'Marketing', subject: 'B2C marketing knowledge campaigns', metric: 'Campaigns/Qtr', pic: 'Hisyam', yearlyTarget: '6', q1Target: '2', q2Target: '2', q3Target: '1', q4Target: '1', actual: '2', status: 'On Track' },
  { id: 'p2-kr11', type: 'KR', pillar: 'P2', team: 'Marketing', subject: 'GBA quality leads', metric: 'Leads/Qtr', pic: 'Hisyam', yearlyTarget: '18', q1Target: '-', q2Target: '6', q3Target: '6', q4Target: '6', status: 'Below' },
  { id: 'p2-kr12', type: 'KR', pillar: 'P2', team: 'Tech', subject: 'Develop Talent for Roblox Game', metric: 'Talents', pic: 'Adi', yearlyTarget: '3', q1Target: '3', q2Target: '-', q3Target: '-', q4Target: '-', actual: '3', status: 'On Track' },
  { id: 'p2-kr13', type: 'KR', pillar: 'P2', team: 'Game Design', subject: 'Improve quality & creativity of designs', metric: 'Designs/Qtr', pic: 'Thommi', yearlyTarget: '24', q1Target: '6', q2Target: '6', q3Target: '6', q4Target: '6', actual: '6', status: 'On Track' },

  // ── P3: Global Market ─────────────────────────────────────────────────────
  { id: 'p3-o', type: 'O', pillar: 'P3', team: 'Division', subject: 'Expand global market presence and client base', metric: 'Multiple', pic: 'Auliya', yearlyTarget: 'IDR 3.5B', q1Target: '-', q2Target: '0.5B', q3Target: '1.5B', q4Target: '1.5B', status: 'Below' },
  { id: 'p3-kr1', type: 'KR', pillar: 'P3', team: 'Business Dev', subject: 'Secure IDR 3.5B International TCV', metric: 'TCV (IDR)', pic: 'Auliya', yearlyTarget: 'IDR 3.5B', q1Target: '-', q2Target: '500M', q3Target: '1.5B', q4Target: '1.5B', actual: '0.28B', status: 'Below' },
  { id: 'p3-kr2', type: 'KR', pillar: 'P3', team: 'Business Dev', subject: '3 global partnerships with qualified leads', metric: 'Partners/Qtr', pic: 'Auliya', yearlyTarget: '3', q1Target: '1', q2Target: '2', q3Target: '1', q4Target: '-', actual: '0', status: 'Below' },
  { id: 'p3-kr3', type: 'KR', pillar: 'P3', team: 'Business Dev', subject: '30% revenue from Repeat Clients', metric: 'Repeat %', pic: 'Auliya', yearlyTarget: '30%', q1Target: '-', q2Target: '-', q3Target: '-', q4Target: '30%', status: 'Below' },
  { id: 'p3-kr4', type: 'KR', pillar: 'P3', team: 'Business Dev', subject: 'Client satisfaction & retention (revenue)', metric: 'Revenue %', pic: 'Auliya', yearlyTarget: '30%', q1Target: '-', q2Target: '-', q3Target: '-', q4Target: '30%', status: 'Below' },
  { id: 'p3-kr5', type: 'KR', pillar: 'P3', team: 'Business Dev', subject: 'Client retention rate', metric: 'Retention %', pic: 'Auliya', yearlyTarget: '25%', q1Target: '-', q2Target: '-', q3Target: '-', q4Target: '25%', status: 'On Track' },
  { id: 'p3-kr6', type: 'KR', pillar: 'P3', team: 'Business Dev', subject: '5 International Reference Agreements', metric: 'Agreements/Qtr', pic: 'Auliya', yearlyTarget: '5', q1Target: '-', q2Target: '1', q3Target: '2', q4Target: '2', status: 'On Track' },
  { id: 'p3-kr7', type: 'KR', pillar: 'P3', team: 'Business Dev', subject: '15 SQLs from international partner', metric: 'SQLs/Qtr', pic: 'Auliya', yearlyTarget: '15', q1Target: '-', q2Target: '5', q3Target: '5', q4Target: '5', status: 'On Track' },
  { id: 'p3-kr8', type: 'KR', pillar: 'P3', team: 'BD Manager', subject: 'Update service deck 2025→2026', metric: 'Deck Ready', pic: 'Bima', yearlyTarget: '1', q1Target: '1', q2Target: '1', q3Target: '1', q4Target: '1', actual: '0', status: 'Below' },
  { id: 'p3-kr9', type: 'KR', pillar: 'P3', team: 'BD Manager', subject: 'Increase cold lead generation', metric: '% Leads', pic: 'Bima', yearlyTarget: '10%', q1Target: '10%', q2Target: '10%', q3Target: '10%', q4Target: '10%', actual: '0', status: 'Below' },
  { id: 'p3-kr10', type: 'KR', pillar: 'P3', team: 'BD Manager', subject: 'Create 3-4 demos for key offerings', metric: 'Demos', pic: 'Bima', yearlyTarget: '4', q1Target: '2', q2Target: '2', q3Target: '-', q4Target: '-', actual: '0', status: 'Below' },
  { id: 'p3-kr11', type: 'KR', pillar: 'P3', team: 'BD Manager', subject: 'Reduce proposal completion time', metric: 'Days', pic: 'Bima', yearlyTarget: '7', q1Target: '7', q2Target: '7', q3Target: '7', q4Target: '7', actual: '0', status: 'Below' },
  { id: 'p3-kr12', type: 'KR', pillar: 'P3', team: 'BD Manager', subject: 'On-time proposal submission rate', metric: '% On-time', pic: 'Bima', yearlyTarget: '100%', q1Target: '100%', q2Target: '100%', q3Target: '100%', q4Target: '100%', actual: '0', status: 'Below' },
  { id: 'p3-kr13', type: 'KR', pillar: 'P3', team: 'BD Manager', subject: 'Increase proposal win rate', metric: 'Win Ratio', pic: 'Bima', yearlyTarget: '40%', q1Target: '40%', q2Target: '40%', q3Target: '40%', q4Target: '40%', actual: '0', status: 'Below' },
  { id: 'p3-kr14', type: 'KR', pillar: 'P3', team: 'Product', subject: 'Optimizing offering (actual pricing)', metric: 'Pricing', pic: 'Ihsan', yearlyTarget: '1', q1Target: '1', q2Target: '-', q3Target: '-', q4Target: '-', actual: '0', status: 'Below' },
  { id: 'p3-kr15', type: 'KR', pillar: 'P3', team: 'Product', subject: 'Modular Gamification Framework', metric: '% Built', pic: 'Ihsan', yearlyTarget: '100%', q1Target: '30%', q2Target: '45%', q3Target: '60%', q4Target: '75%', actual: '0', status: 'Below' },
  { id: 'p3-kr16', type: 'KR', pillar: 'P3', team: 'Product', subject: 'Standardize Delivery Process', metric: '% Standard', pic: 'Ihsan', yearlyTarget: '100%', q1Target: '70%', q2Target: '90%', q3Target: '100%', q4Target: '100%', actual: '70%', status: 'On Track' },
  { id: 'p3-kr17', type: 'KR', pillar: 'P3', team: 'Game Design', subject: 'Improve game designer capability (workshops)', metric: 'Workshops/Qtr', pic: 'Thommi', yearlyTarget: '12', q1Target: '3', q2Target: '3', q3Target: '3', q4Target: '3', actual: '0', status: 'Below' },
  { id: 'p3-kr18', type: 'KR', pillar: 'P3', team: 'Business Head', subject: 'TNA Leadership completion', metric: '% Completion', pic: 'Junialdi', yearlyTarget: '90%', q1Target: '-', q2Target: '90%', q3Target: '90%', q4Target: '90%', status: 'On Track' },
  { id: 'p3-kr19', type: 'KR', pillar: 'P3', team: 'Business Head', subject: 'TNA Group Leader completion', metric: '% Completion', pic: 'Junialdi', yearlyTarget: '90%', q1Target: '-', q2Target: '90%', q3Target: '90%', q4Target: '90%', status: 'On Track' },
  { id: 'p3-kr20', type: 'KR', pillar: 'P3', team: 'Marketing', subject: 'Quality B2B leads', metric: 'Leads/Qtr', pic: 'Hisyam', yearlyTarget: '96', q1Target: '24', q2Target: '24', q3Target: '24', q4Target: '24', actual: '17', status: 'Below' },

  // ── P4: Cost Efficiency ────────────────────────────────────────────────────
  { id: 'p4-o', type: 'O', pillar: 'P4', team: 'Division', subject: 'Optimize cost efficiency and operational excellence', metric: 'Multiple', pic: 'Sandi', yearlyTarget: 'Various', q1Target: '-', q2Target: '-', q3Target: '-', q4Target: '-', status: 'On Track' },
  { id: 'p4-kr1', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Maintenance Project Manpower Efficiency', metric: '% leadership crew properly allocated to maintenance projects', pic: 'Sandi', yearlyTarget: '75%', q1Target: '75%', q2Target: '75%', q3Target: '75%', q4Target: '75%', actual: '0', status: 'Below' },
  { id: 'p4-kr2', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Vendor Performance Standardization', metric: '% vendors with scoring (assessment & delivery phases)', pic: 'Sandi', yearlyTarget: '100%', q1Target: '50%', q2Target: '100%', q3Target: '100%', q4Target: '100%', actual: '0', status: 'Below' },
  { id: 'p4-kr3', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Vendor Database & Specialization', metric: '% vendors listed in specialization database', pic: 'Sandi', yearlyTarget: '100%', q1Target: '75%', q2Target: '100%', q3Target: '100%', q4Target: '100%', actual: '0', status: 'Below' },
  { id: 'p4-kr4', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Plasma Cost Management', metric: '% plasma budget within allocated budget per quarter', pic: 'Sandi', yearlyTarget: '95%', q1Target: '95%', q2Target: '95%', q3Target: '95%', q4Target: '95%', actual: '0', status: 'Below' },
  { id: 'p4-kr5', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Infrastructure & Server Cost Control', metric: '% server budget within allocated budget per quarter', pic: 'Sandi', yearlyTarget: '95%', q1Target: '95%', q2Target: '95%', q3Target: '95%', q4Target: '95%', actual: '0', status: 'Below' },
  { id: 'p4-kr6', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Team Building & Division Vibes (Active Participant Rate)', metric: '% Participation', pic: 'Ihsan', yearlyTarget: '65%', q1Target: '50%', q2Target: '60%', q3Target: '70%', q4Target: '80%', status: 'On Track' },
  { id: 'p4-kr7', type: 'KR', pillar: 'P4', team: 'Product', subject: 'High Performance Crew Engagement (Survey)', metric: '% Engaged', pic: 'Ihsan', yearlyTarget: '65%', q1Target: '50%', q2Target: '60%', q3Target: '70%', q4Target: '80%', status: 'On Track' },
  { id: 'p4-kr8', type: 'KR', pillar: 'P4', team: 'Production', subject: 'Project Delivery On-Timeness', metric: '% On-time', pic: 'Ihsan', yearlyTarget: '90%', q1Target: '90%', q2Target: '90%', q3Target: '90%', q4Target: '90%', actual: '87%', status: 'On Track' },
  { id: 'p4-kr9', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'Modular Game Mechanic extraction', metric: '% Extraction', pic: 'Adi', yearlyTarget: '100%', q1Target: '70%', q2Target: '100%', q3Target: '-', q4Target: '-', actual: '0', status: 'Below' },
  { id: 'p4-kr10', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'Code Quality Standard (clean code)', metric: '% Clean Code', pic: 'Adi', yearlyTarget: '100%', q1Target: '60%', q2Target: '80%', q3Target: '100%', q4Target: '-', actual: '0', status: 'Below' },
  { id: 'p4-kr11', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'AI — Tech pipeline standards', metric: 'Standards/Qtr', pic: 'Adi', yearlyTarget: '6', q1Target: '5', q2Target: '1', q3Target: '-', q4Target: '-', actual: '0', status: 'Below' },
  { id: 'p4-kr12', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'AI — Art pipeline standards', metric: 'Standards/Qtr', pic: 'Adi', yearlyTarget: '6', q1Target: '2', q2Target: '2', q3Target: '2', q4Target: '-', actual: '0', status: 'Below' },
  { id: 'p4-kr13', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'AI — Production pipeline standards', metric: 'Standards/Qtr', pic: 'Adi', yearlyTarget: '6', q1Target: '3', q2Target: '2', q3Target: '1', q4Target: '-', actual: '0', status: 'Below' },
  { id: 'p4-kr14', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'AI workforce — Technical crew using AI', metric: 'Crew Using AI', pic: 'Adi', yearlyTarget: '5', q1Target: '4', q2Target: '5', q3Target: '-', q4Target: '-', actual: '0', status: 'Below' },
  { id: 'p4-kr15', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'AI workforce — Artist crew using AI', metric: 'Crew/Qtr', pic: 'Adi', yearlyTarget: '4', q1Target: '1', q2Target: '1', q3Target: '1', q4Target: '1', actual: '0', status: 'Below' },
  { id: 'p4-kr16', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'AI workforce — Production crew using AI', metric: 'Crew Using AI', pic: 'Adi', yearlyTarget: '3', q1Target: '3', q2Target: '-', q3Target: '-', q4Target: '-', actual: '0', status: 'Below' },
  { id: 'p4-kr17', type: 'KR', pillar: 'P4', team: 'Art', subject: 'AI Art Pipeline — Concept Art', metric: '% Pipeline', pic: 'Putri F.', yearlyTarget: '100%', q1Target: '50%', q2Target: '100%', q3Target: '-', q4Target: '-', actual: '50%', status: 'On Track' },
  { id: 'p4-kr18', type: 'KR', pillar: 'P4', team: 'Art', subject: 'AI Art Pipeline — Asset Creation', metric: '% Pipeline', pic: 'Putri F.', yearlyTarget: '100%', q1Target: '-', q2Target: '50%', q3Target: '100%', q4Target: '-', status: 'On Track' },
  { id: 'p4-kr18b', type: 'KR', pillar: 'P4', team: 'Art', subject: 'AI Art Pipeline — 3rd Category', metric: '% Pipeline', pic: 'Putri F.', yearlyTarget: '100%', q1Target: '-', q2Target: '-', q3Target: '50%', q4Target: '100%', status: 'On Track' },
  { id: 'p4-kr19', type: 'KR', pillar: 'P4', team: 'Art', subject: 'AI crew for mockup presales', metric: 'Mockups/Qtr', pic: 'Putri F.', yearlyTarget: '6', q1Target: '1', q2Target: '1', q3Target: '2', q4Target: '2', actual: '1', status: 'On Track' },
  { id: 'p4-kr20', type: 'KR', pillar: 'P4', team: 'Game Design', subject: 'Development documentation & feature bank alignment', metric: '% Aligned', pic: 'Thommi', yearlyTarget: '100%', q1Target: '25%', q2Target: '50%', q3Target: '100%', q4Target: '100%', actual: '25%', status: 'On Track' },
  { id: 'p4-kr21', type: 'KR', pillar: 'P4', team: 'QA', subject: 'Delivery Reliability', metric: '% projects delivered on-time without quality issues', pic: 'Marlin', yearlyTarget: '90%', q1Target: '90%', q2Target: '90%', q3Target: '90%', q4Target: '90%', actual: '0', status: 'Below' },
  { id: 'p4-kr22', type: 'KR', pillar: 'P4', team: 'Marketing', subject: 'Marketing Spend Control', metric: '% Budget', pic: 'Hisyam', yearlyTarget: '95%', q1Target: '95%', q2Target: '95%', q3Target: '95%', q4Target: '95%', actual: '95%', status: 'On Track' },
];

// ─── Division KPIs (L1-L5) ────────────────────────────────────────────────────

export interface DivisionKPI {
  id: number;
  perspective: BSCPerspective;
  name: string;
  unit: string;
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  l5: number;
  actual: number;
  weight: number; // percentage
  higherIsBetter: boolean;
}

export const DIVISION_KPIS: DivisionKPI[] = [
  { id: 1, perspective: 'Financial', name: 'Revenue Growth', unit: 'IDR B', l1: 1.0, l2: 2.5, l3: 4.0, l4: 5.5, l5: 6.0, actual: 0.294, weight: 20, higherIsBetter: true },
  { id: 2, perspective: 'Financial', name: 'EBITDA', unit: 'IDR M', l1: 0, l2: 50, l3: 150, l4: 200, l5: 237, actual: -3850, weight: 15, higherIsBetter: true },
  { id: 3, perspective: 'Financial', name: 'Project Margin', unit: '%', l1: 50, l2: 60, l3: 70, l4: 80, l5: 90, actual: 89, weight: 10, higherIsBetter: true },
  { id: 4, perspective: 'Customer', name: 'Quality B2B Leads', unit: 'Leads/Yr', l1: 20, l2: 40, l3: 60, l4: 80, l5: 96, actual: 17, weight: 10, higherIsBetter: true },
  { id: 5, perspective: 'Customer', name: 'Repeat Client Revenue', unit: '%', l1: 5, l2: 10, l3: 20, l4: 25, l5: 30, actual: 12, weight: 8, higherIsBetter: true },
  { id: 6, perspective: 'Customer', name: 'Proposal Win Rate', unit: '%', l1: 15, l2: 25, l3: 30, l4: 35, l5: 40, actual: 37, weight: 7, higherIsBetter: true },
  { id: 7, perspective: 'Internal', name: 'On-Time Delivery', unit: '%', l1: 60, l2: 70, l3: 80, l4: 85, l5: 90, actual: 87, weight: 8, higherIsBetter: true },
  { id: 8, perspective: 'Internal', name: 'Roblox DAU', unit: 'Users', l1: 100, l2: 250, l3: 400, l4: 550, l5: 650, actual: 0, weight: 5, higherIsBetter: true },
  { id: 9, perspective: 'Internal', name: 'Roblox Visits', unit: 'Visits', l1: 1000, l2: 2000, l3: 3000, l4: 3750, l5: 4250, actual: 0, weight: 5, higherIsBetter: true },
  { id: 10, perspective: 'Internal', name: 'GBA Quality Leads', unit: 'Leads', l1: 4, l2: 8, l3: 14, l4: 20, l5: 24, actual: 7, weight: 5, higherIsBetter: true },
  { id: 11, perspective: 'Learning', name: 'Training Budget Utilization', unit: '%', l1: 20, l2: 40, l3: 60, l4: 80, l5: 100, actual: 35, weight: 4, higherIsBetter: true },
  { id: 12, perspective: 'Learning', name: 'AI Tool Adoption', unit: '%', l1: 20, l2: 40, l3: 60, l4: 80, l5: 100, actual: 65, weight: 3, higherIsBetter: true },
];

// ─── Routine Metrics ──────────────────────────────────────────────────────────

export interface RoutineMetric {
  id: string;
  metric: string;
  category: 'Sales' | 'Marketing' | 'Product' | 'Delivery';
  w1: number;
  w2: number;
  w3: number;
  w4: number;
  target: number;
  unit: string;
  higherIsBetter: boolean;
}

export const ROUTINE_METRICS: RoutineMetric[] = [
  { id: 'rm1', metric: 'New Leads Generated', category: 'Sales', w1: 8, w2: 12, w3: 10, w4: 14, target: 10, unit: 'Leads', higherIsBetter: true },
  { id: 'rm2', metric: 'Proposals Sent', category: 'Sales', w1: 3, w2: 4, w3: 3, w4: 5, target: 4, unit: 'Count', higherIsBetter: true },
  { id: 'rm3', metric: 'Follow-up Meetings', category: 'Sales', w1: 5, w2: 6, w3: 4, w4: 7, target: 6, unit: 'Meetings', higherIsBetter: true },
  { id: 'rm4', metric: 'Email Campaign CTR', category: 'Marketing', w1: 28, w2: 32, w3: 35, w4: 40, target: 30, unit: '%', higherIsBetter: true },
  { id: 'rm5', metric: 'Content Pieces Published', category: 'Marketing', w1: 3, w2: 4, w3: 3, w4: 4, target: 4, unit: 'Pieces', higherIsBetter: true },
  { id: 'rm6', metric: 'Sprint Velocity', category: 'Product', w1: 32, w2: 38, w3: 35, w4: 40, target: 35, unit: 'SP', higherIsBetter: true },
  { id: 'rm7', metric: 'Delivery On-Time Rate', category: 'Delivery', w1: 85, w2: 88, w3: 87, w4: 90, target: 85, unit: '%', higherIsBetter: true },
];

// ─── Initiatives ──────────────────────────────────────────────────────────────

export interface Initiative {
  id: string;
  title: string;
  phase: PDCAPhase;
  pic: string;
  linkedOKR: PillarKey;
  linkedOKRLabel: string;
  priority: InitiativePriority;
  startDate: string;
  dueDate: string;
  description: string;
  notionPageId?: string;
}

export const INITIATIVES: Initiative[] = [
  // ── P1: Revenue & EBITDA (Business Head: Junialdi) ──────────────────────
  { id: 'init-bh-1', title: 'Secure Minimum IDR 1.5B Q1 Revenue', phase: 'DO', pic: 'Junialdi', linkedOKR: 'P1', linkedOKRLabel: 'P1: Revenue & EBITDA', priority: 'Critical', startDate: '2026-01-01', dueDate: '2026-03-31', description: 'Business Head to secure minimum IDR 1.5 Billion from project service in Q1 2026 through active BD, proposal, and client management.' },
  { id: 'init-bh-2', title: 'Achieve Q1 EBITDA Target (IDR 59.4M)', phase: 'DO', pic: 'Junialdi', linkedOKR: 'P1', linkedOKRLabel: 'P1: Revenue & EBITDA', priority: 'Critical', startDate: '2026-01-01', dueDate: '2026-03-31', description: 'Achieve minimum EBITDA target of IDR 59.4M in Q1 2026 through cost efficiency and revenue growth strategy.' },
  { id: 'init-bca', title: 'BCA Periode 5 Delivery', phase: 'DO', pic: 'Thommi', linkedOKR: 'P1', linkedOKRLabel: 'P1: Revenue & EBITDA', priority: 'High', startDate: '2026-02-01', dueDate: '2026-04-30', description: 'Complete delivery of BCA Period 5 project with all milestones and client sign-off.' },
  { id: 'init-dana', title: 'DANA Last War Post-Launch Support', phase: 'CHECK', pic: 'Marlin', linkedOKR: 'P1', linkedOKRLabel: 'P1: Revenue & EBITDA', priority: 'Medium', startDate: '2026-02-15', dueDate: '2026-03-15', description: 'Monitor and resolve post-launch bugs and performance issues for DANA Last War.' },

  // ── P2: Product Expansion ─────────────────────────────────────────────────
  { id: 'init-578', title: 'Ensure On-Time Launch of Roblox Products', phase: 'DO', pic: 'Junialdi', linkedOKR: 'P2', linkedOKRLabel: 'P2: Product Expansion', priority: 'High', startDate: '2026-01-01', dueDate: '2026-01-31', description: 'Develop Direction PRD, validate Roblox market, plan GTM strategy, and develop milestone for Roblox experiences. (Notion #578, PIC: Junialdi + Bima)' },
  { id: 'init-567', title: 'Ensure On-Time Launch of GBA Products', phase: 'PLAN', pic: 'Junialdi', linkedOKR: 'P2', linkedOKRLabel: 'P2: Product Expansion', priority: 'High', startDate: '2026-01-20', dueDate: '2026-04-30', description: 'Complete GBA product PRD, market validation, GTM strategy, and milestone development for product launch. (Notion #567)' },
  { id: 'init-580', title: 'Expand Partners for Roblox Development', phase: 'DO', pic: 'Junialdi', linkedOKR: 'P2', linkedOKRLabel: 'P2: Product Expansion', priority: 'High', startDate: '2026-01-01', dueDate: '2026-01-31', description: 'Offer 3 game studio development partnerships, sign contract with 1 Roblox development partner. (Notion #580)' },
  { id: 'init-gba-partner', title: 'Engage Partners for GBA Development', phase: 'DO', pic: 'Junialdi', linkedOKR: 'P2', linkedOKRLabel: 'P2: Product Expansion', priority: 'High', startDate: '2026-01-01', dueDate: '2026-01-31', description: 'Sign contract with GBA expert partner for game-based assessment product development.' },
  { id: 'init-621', title: 'Improvement Program for Product Team & PO', phase: 'DO', pic: 'Junialdi', linkedOKR: 'P2', linkedOKRLabel: 'P2: Product Expansion', priority: 'Medium', startDate: '2026-01-01', dueDate: '2026-02-27', description: 'Develop competency checklist and artifact checklist for Product Owners; audit artifact compliance. (Notion #621)' },
  { id: 'init-617', title: 'Improve Quality & Creativity of Produced Designs', phase: 'PLAN', pic: 'Thommi', linkedOKR: 'P2', linkedOKRLabel: 'P2: Product Expansion', priority: 'High', startDate: '2026-01-01', dueDate: '2026-03-31', description: 'Document 6 game ideas in Game Ideas Bank per quarter; improve design quality standards. (Notion #617)' },
  { id: 'init-594', title: 'Develop Talent Capability for Roblox Game', phase: 'PLAN', pic: 'Adi', linkedOKR: 'P2', linkedOKRLabel: 'P2: Product Expansion', priority: 'High', startDate: '2026-01-01', dueDate: '2026-03-31', description: 'Develop 3 technical talents with Roblox game development capability by Q1. (Notion #594)' },
  { id: 'init-634', title: 'Build Daily Usage Habits for Roblox Product', phase: 'DO', pic: 'Hisyam', linkedOKR: 'P2', linkedOKRLabel: 'P2: Product Expansion', priority: 'High', startDate: '2026-01-01', dueDate: '2026-02-01', description: 'Drive Roblox DAU to 500+ through targeted community engagement, content strategy, and player retention. (Notion #634)' },
  { id: 'init-635', title: 'Increase Traffic into Roblox Experience', phase: 'PLAN', pic: 'Hisyam', linkedOKR: 'P2', linkedOKRLabel: 'P2: Product Expansion', priority: 'High', startDate: '2026-01-01', dueDate: '2026-02-01', description: 'Grow Roblox monthly visits to 3,500+ through SEO, social media, and event-based marketing. (Notion #635)' },
  { id: 'init-636', title: 'Convert Leads to Quality Leads for GBA', phase: 'PLAN', pic: 'Hisyam', linkedOKR: 'P2', linkedOKRLabel: 'P2: Product Expansion', priority: 'Medium', startDate: '2026-01-01', dueDate: '2026-01-31', description: 'Generate quality B2C leads for game-based assessment product through targeted campaigns. (Notion #636)' },

  // ── P3: Global Market ─────────────────────────────────────────────────────
  { id: 'init-523', title: 'Secure Rp 3.5B International Project TCV', phase: 'DO', pic: 'Auliya', linkedOKR: 'P3', linkedOKRLabel: 'P3: Global Market', priority: 'Critical', startDate: '2026-01-01', dueDate: '2026-12-31', description: 'Conduct GTM for 2 priority countries (Dubai & Saudi Arabia), develop localized sales kit, map top 20 target agencies. (Notion #523)' },
  { id: 'init-524', title: 'Secure 3 Global Partnerships with Qualified Leads', phase: 'PLAN', pic: 'Auliya', linkedOKR: 'P3', linkedOKRLabel: 'P3: Global Market', priority: 'High', startDate: '2026-01-01', dueDate: '2026-09-30', description: 'Build plug-and-play sales kit, implement tiered engagement strategy, map digital agencies in Dubai and Saudi Arabia. (Notion #524)' },
  { id: 'init-525', title: 'Achieve 30% Revenue from Repeat Clients', phase: 'DO', pic: 'Auliya', linkedOKR: 'P3', linkedOKRLabel: 'P3: Global Market', priority: 'High', startDate: '2026-01-01', dueDate: '2026-12-31', description: 'Implement CSAT/NPS tracking >4.5, strategic reviews with top 20% clients, loyalty perks for repeat contracts. (Notion #525)' },
  { id: 'init-526', title: 'Secure 5 International Reference Accounts', phase: 'PLAN', pic: 'Auliya', linkedOKR: 'P3', linkedOKRLabel: 'P3: Global Market', priority: 'High', startDate: '2026-01-01', dueDate: '2026-12-31', description: 'Add marketing cooperation clauses, train BD/sales on reference process, create "Who to call" reference list. (Notion #526)' },
  { id: 'init-527', title: 'Generate 15 SQLs from International Engagements', phase: 'DO', pic: 'Auliya', linkedOKR: 'P3', linkedOKRLabel: 'P3: Global Market', priority: 'High', startDate: '2026-01-01', dueDate: '2026-12-31', description: 'Identify top 5 regional conferences, implement pre-event outreach, automate post-event email follow-up within 24h. (Notion #527)' },
  { id: 'init-628', title: 'Update 2025 Service Deck to 2026', phase: 'PLAN', pic: 'Bima', linkedOKR: 'P3', linkedOKRLabel: 'P3: Global Market', priority: 'High', startDate: '2026-01-01', dueDate: '2026-03-31', description: 'Create new service deck concept, develop "What If" question deck, build service deck 2026 prototype, update website. (Notion #628)' },
  { id: 'init-629', title: 'Increase Cold Lead Generation via Service Deck', phase: 'PLAN', pic: 'Bima', linkedOKR: 'P3', linkedOKRLabel: 'P3: Global Market', priority: 'High', startDate: '2026-01-01', dueDate: '2026-12-31', description: 'Leverage 2026 service deck to increase cold lead generation rate by 10%; improve online visibility via SEO. (Notion #629)' },
  { id: 'init-630', title: 'Strengthen Service Deck with Key Offering Demos', phase: 'PLAN', pic: 'Bima', linkedOKR: 'P3', linkedOKRLabel: 'P3: Global Market', priority: 'Medium', startDate: '2026-01-01', dueDate: '2026-06-30', description: 'Define key offerings, create demos 1 & 2 in Q1 (Mar), demos 3 & 4 in Q2 (Jun). (Notion #630)' },
  { id: 'init-638', title: 'Increase Quality Leads for B2B Services', phase: 'DO', pic: 'Hisyam', linkedOKR: 'P3', linkedOKRLabel: 'P3: Global Market', priority: 'High', startDate: '2026-01-01', dueDate: '2026-12-31', description: 'Generate 24 quality B2B leads per quarter through email marketing, LinkedIn Premium, and event campaigns. (Notion #638)' },
  { id: 'init-618', title: 'Improve Game Designer Capability', phase: 'PLAN', pic: 'Thommi', linkedOKR: 'P3', linkedOKRLabel: 'P3: Global Market', priority: 'Medium', startDate: '2026-01-01', dueDate: '2026-03-31', description: 'Run 3 monthly workshops for game designers; improve presales discussion and performance tracking. (Notion #618)' },
  { id: 'init-429', title: 'Optimizing Offering — Actual Pricing Based on Development', phase: 'ACT', pic: 'Ihsan', linkedOKR: 'P3', linkedOKRLabel: 'P3: Global Market', priority: 'High', startDate: '2026-01-01', dueDate: '2026-02-28', description: 'Calculate actual pricing from completed 2025 projects, create modular package pricing, populate pricing database. (Notion #429)' },

  // ── P4: Cost Efficiency ───────────────────────────────────────────────────
  { id: 'init-463', title: 'Leadership Support Maintenance Project', phase: 'DO', pic: 'Sandi', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'High', startDate: '2026-01-01', dueDate: '2026-03-31', description: 'Establish Internal Maintenance SLA, develop tiered server cost calculation model, implement automated reminder system, maintain project list. (Notion #463)' },
  { id: 'init-425', title: 'Standardize the Entire Delivery Process', phase: 'DO', pic: 'Ihsan', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'High', startDate: '2026-01-01', dueDate: '2026-12-31', description: 'Update project management template, brief all producers for template usage, track PM compliance and reporting. (Notion #425)' },
  { id: 'init-433', title: 'Build a Modular, Reusable Gamification Framework', phase: 'PLAN', pic: 'Ihsan', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'High', startDate: '2026-01-01', dueDate: '2026-06-30', description: 'List modular features, populate art/design/tech/QA/production knowledge, estimation, and checklists. (Notion #433)' },
  { id: 'init-434', title: 'Project Delivery On-Timeness (All Projects)', phase: 'PLAN', pic: 'Ihsan', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'High', startDate: '2026-01-01', dueDate: '2026-12-31', description: 'Track and ensure all projects are delivered on time — target: 100% on-time delivery rate. (Notion #434)' },
  { id: 'init-437', title: 'High Performance & Resilience Crew Program', phase: 'PLAN', pic: 'Ihsan', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'Medium', startDate: '2026-01-01', dueDate: '2026-12-31', description: 'Increase crew engagement via form submission surveys and fun team building activities. (Notion #437)' },
  { id: 'init-614', title: 'Build AI-Ready Workforce in Production', phase: 'DO', pic: 'Adi', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'High', startDate: '2026-01-01', dueDate: '2026-01-28', description: 'Create SOP for AI usage in Production, train production crew on AI tools and workflows. (Notion #614)' },
  { id: 'init-597', title: 'AI with Human Touch — Tech Pipeline', phase: 'PLAN', pic: 'Adi', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'High', startDate: '2026-01-01', dueDate: '2026-01-30', description: 'Develop 5 AI-with-human-touch standards for the Tech pipeline to improve efficiency. (Notion #597)' },
  { id: 'init-601', title: 'AI with Human Touch — Art Pipeline', phase: 'PLAN', pic: 'Adi', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'High', startDate: '2026-01-01', dueDate: '2026-01-30', description: 'Develop 2 AI-with-human-touch standards for the Art pipeline; train artist crew. (Notion #601)' },
  { id: 'init-605', title: 'AI with Human Touch — Production Pipeline', phase: 'PLAN', pic: 'Adi', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'High', startDate: '2026-01-01', dueDate: '2026-01-30', description: 'Develop 3 AI-with-human-touch standards for the Production pipeline. (Notion #605)' },
  { id: 'init-620', title: 'Improve Development Documentation & Feature Bank', phase: 'PLAN', pic: 'Thommi', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'Medium', startDate: '2026-01-01', dueDate: '2026-03-31', description: 'Improve development documentation and align feature bank for design consistency and cost efficiency. (Notion #620)' },
  { id: 'init-642', title: 'Delivery Reliability — QA Quality Gate', phase: 'DO', pic: 'Marlin', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'High', startDate: '2026-01-01', dueDate: '2026-03-31', description: 'Ensure 90% of all projects are delivered on-time without quality issues in Q1 2026. Define QA quality gate criteria, implement pre-release checklist, track and report delivery reliability per project. (OKR p4-kr21)' },

  // ── Putri F.: Art Director — AI Art Pipeline ──────────────────────────────
  { id: 'init-putri-1', title: 'AI Art Pipeline — Concept Art Implementation', phase: 'DO', pic: 'Putri F.', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'High', startDate: '2026-01-01', dueDate: '2026-06-30', description: 'Implement AI-with-human-touch pipeline for Concept Art: standardize AI tool usage, document workflow, achieve 50% AI-assisted pipeline by Q1 and 100% by Q2. (OKR p4-kr17)' },
  { id: 'init-putri-2', title: 'AI Art Pipeline — Asset Creation Implementation', phase: 'PLAN', pic: 'Putri F.', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'High', startDate: '2026-04-01', dueDate: '2026-12-31', description: 'Implement AI-with-human-touch pipeline for Asset Creation: standardize AI-assisted asset workflow, target 50% by Q2 and 100% by Q4. (OKR p4-kr18)' },
  { id: 'init-putri-3', title: 'AI Mockup Creation for Presales', phase: 'DO', pic: 'Putri F.', linkedOKR: 'P2', linkedOKRLabel: 'P2: Product Expansion', priority: 'High', startDate: '2026-01-01', dueDate: '2026-12-31', description: 'Leverage AI tools to deliver mockups for presales pitches — target 1 mockup Q1, 2 Q2, 4 Q3, 6 Q4. Reduces presales production time and cost. (OKR p4-kr19)' },
  { id: 'init-putri-4', title: 'GF Art Style Book — Pre-Sales Reference Guide', phase: 'DO', pic: 'Putri F.', linkedOKR: 'P2', linkedOKRLabel: 'P2: Product Expansion', priority: 'High', startDate: '2026-01-01', dueDate: '2026-03-31', description: 'Develop a comprehensive Gamification Division Art Style Book for Q1 2026 to support pre-sales pitches. Documents GF visual language, art direction standards, character/UI style guides, and sample outputs — enabling BD team to pitch design quality confidently to clients.' },

  // ── Sandi: Production Director — Team & Crew Development ─────────────────
  { id: 'init-sandi-team', title: 'Quarterly Team Building Activity Program', phase: 'DO', pic: 'Sandi', linkedOKR: 'P4', linkedOKRLabel: 'P4: Cost Efficiency', priority: 'Medium', startDate: '2026-01-01', dueDate: '2026-12-31', description: 'Execute quarterly team building activities (Q1 Done, Q2-Q4 planned) and gamification engagement program to improve crew active participation rate. (Notion #568-574)' },
];

// ─── Performance Review Data ──────────────────────────────────────────────────

export interface TeamMemberPerformance {
  id: string;
  name: string;
  role: string;
  okrScore: number;    // %
  kpiLevel: string;   // L1-L5
  kpiScore: number;   // numeric 1-5
  score360: number;   // /5
  overall: number;    // composite
  tier: string;
}

export const TEAM_PERFORMANCE: TeamMemberPerformance[] = [
  { id: 'hisyam',  name: 'Hisyam Hesbi Wijonarko',  role: 'Marketing',           okrScore: 35, kpiLevel: 'L2', kpiScore: 2, score360: 3.8, overall: 30, tier: 'Below' },
  { id: 'marlin',  name: 'Magdalena Marlin Amanda',  role: 'QA Lead',             okrScore: 20, kpiLevel: 'L2', kpiScore: 2, score360: 3.9, overall: 21, tier: 'Below' },
  { id: 'sandi',   name: 'Sandi Rusnandi',           role: 'Production Director', okrScore: 15, kpiLevel: 'L1', kpiScore: 1, score360: 3.8, overall: 14, tier: 'Below' },
  { id: 'putri-f', name: 'Putri Febriani Lestari',  role: 'Art Director',        okrScore: 15, kpiLevel: 'L1', kpiScore: 1, score360: 3.7, overall: 14, tier: 'Below' },
  { id: 'auliya',  name: 'Nur Auliya Hidayati',      role: 'Sr. BD Manager',      okrScore: 12, kpiLevel: 'L1', kpiScore: 1, score360: 3.9, overall: 12, tier: 'Below' },
  { id: 'bima',    name: 'Bima Aryuna',              role: 'BD Manager',          okrScore: 12, kpiLevel: 'L1', kpiScore: 1, score360: 3.6, overall: 11, tier: 'Below' },
  { id: 'thommi',  name: 'Muhammad Thommi Ilman',    role: 'Game Design Manager', okrScore: 10, kpiLevel: 'L1', kpiScore: 1, score360: 3.8, overall: 10, tier: 'Below' },
  { id: 'adi',     name: 'Adi Gumelar',              role: 'Tech Director',       okrScore: 10, kpiLevel: 'L1', kpiScore: 1, score360: 3.7, overall: 10, tier: 'Below' },
];

export interface Feedback360 {
  id: string;
  name: string;
  leadership: number;
  communication: number;
  teamwork: number;
  technical: number;
  innovation: number;
  delivery: number;
  avg: number;
}

export const FEEDBACK_360: Feedback360[] = [
  { id: 'auliya',  name: 'Nur Auliya Hidayati',     leadership: 4.5, communication: 4.2, teamwork: 4.0, technical: 3.8, innovation: 4.3, delivery: 4.2, avg: 4.17 },
  { id: 'bima',    name: 'Bima Aryuna',             leadership: 3.8, communication: 4.0, teamwork: 4.2, technical: 3.5, innovation: 3.7, delivery: 4.1, avg: 3.88 },
  { id: 'sandi',   name: 'Sandi Rusnandi',          leadership: 4.2, communication: 3.9, teamwork: 4.0, technical: 4.5, innovation: 4.3, delivery: 4.0, avg: 4.15 },
  { id: 'thommi',  name: 'Muhammad Thommi Ilman',   leadership: 4.0, communication: 4.1, teamwork: 4.5, technical: 4.6, innovation: 4.4, delivery: 4.2, avg: 4.30 },
  { id: 'adi',     name: 'Adi Gumelar',             leadership: 3.9, communication: 3.8, teamwork: 4.0, technical: 4.7, innovation: 4.2, delivery: 3.9, avg: 4.08 },
  { id: 'marlin',  name: 'Magdalena Marlin Amanda', leadership: 4.3, communication: 4.2, teamwork: 4.4, technical: 4.5, innovation: 4.3, delivery: 4.6, avg: 4.38 },
  { id: 'putri-f', name: 'Putri Febriani Lestari', leadership: 4.0, communication: 4.1, teamwork: 4.3, technical: 4.2, innovation: 4.0, delivery: 4.1, avg: 4.12 },
  { id: 'hisyam',  name: 'Hisyam Hesbi Wijonarko', leadership: 3.8, communication: 4.3, teamwork: 4.1, technical: 3.7, innovation: 4.2, delivery: 3.9, avg: 4.00 },
];

// ─── Individual BSC KPIs per person ──────────────────────────────────────────

export interface PersonKPI {
  perspective: BSCPerspective;
  name: string;
  weight: number;
  uom: string;
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  l5: number;
  actual: number;
  level: LevelKey;
  higherIsBetter?: boolean;
}

export const PERSON_KPIS: Record<string, PersonKPI[]> = {
  // ── P3 Pillar Owner: Global Market ────────────────────────────────────────
  auliya: [
    // P1-KR1 contribution: Q1 domestic revenue pipeline — Not Started
    { perspective: 'Financial', name: 'Revenue from New Business (P1-KR1)', weight: 25, uom: 'IDR M', l1: 100, l2: 250, l3: 500, l4: 700, l5: 900, actual: 0, level: 'L1', higherIsBetter: true },
    // P3-KR1: International TCV — starts Q2, Q1 target = 1 qualified lead/partnership
    { perspective: 'Financial', name: 'International TCV Pipeline (P3-KR1)', weight: 15, uom: 'IDR M', l1: 0, l2: 100, l3: 300, l4: 500, l5: 800, actual: 0, level: 'L1', higherIsBetter: true },
    // P3-KR2: Global partnerships Q1 target = 1 — Not Started
    { perspective: 'Customer', name: 'Global Partnerships Secured (P3-KR2)', weight: 15, uom: 'Count', l1: 0, l2: 1, l3: 2, l4: 3, l5: 4, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Customer', name: 'Proposal Win Rate', weight: 10, uom: '%', l1: 15, l2: 25, l3: 30, l4: 35, l5: 40, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Customer', name: 'Client Satisfaction Score', weight: 10, uom: '/5', l1: 2.5, l2: 3.0, l3: 3.5, l4: 4.0, l5: 4.5, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Internal', name: 'Pipeline Coverage Ratio', weight: 10, uom: 'x', l1: 1.0, l2: 2.0, l3: 3.0, l4: 4.0, l5: 5.0, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Internal', name: 'Deal Cycle Time', weight: 10, uom: 'Days', l1: 120, l2: 90, l3: 75, l4: 60, l5: 45, actual: 0, level: 'L1', higherIsBetter: false },
    { perspective: 'Learning', name: 'AI Tools Proficiency', weight: 5, uom: '%', l1: 20, l2: 40, l3: 60, l4: 80, l5: 100, actual: 0, level: 'L1', higherIsBetter: true },
  ],
  // ── BD Manager: supports Auliya (P3) & revenue pipeline ────────────────
  bima: [
    // Q1 contribution to P1-KR1 revenue — Not Started
    { perspective: 'Financial', name: 'Revenue from Managed Deals (P1-KR1)', weight: 25, uom: 'IDR M', l1: 50, l2: 100, l3: 200, l4: 350, l5: 500, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Customer', name: 'New Client Acquisition', weight: 15, uom: 'Clients', l1: 1, l2: 2, l3: 3, l4: 5, l5: 7, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Customer', name: 'Proposal Quality Score', weight: 15, uom: '/5', l1: 2.0, l2: 2.5, l3: 3.5, l4: 4.0, l5: 4.5, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Internal', name: 'Proposals Submitted (Q1 Target: 6)', weight: 15, uom: 'Count', l1: 2, l2: 4, l3: 6, l4: 8, l5: 10, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Internal', name: 'Follow-up Response Time', weight: 10, uom: 'Hrs', l1: 72, l2: 48, l3: 24, l4: 12, l5: 6, actual: 0, level: 'L1', higherIsBetter: false },
    { perspective: 'Internal', name: 'CRM Data Accuracy', weight: 10, uom: '%', l1: 60, l2: 70, l3: 80, l4: 90, l5: 100, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Learning', name: 'Product & Portfolio Knowledge', weight: 10, uom: '%', l1: 40, l2: 55, l3: 70, l4: 85, l5: 95, actual: 0, level: 'L1', higherIsBetter: true },
  ],
  // ── P4 Pillar Owner: Cost Efficiency & Production ──────────────────────
  sandi: [
    // P4-KR1: Maintenance Project Manpower Efficiency — Q1 target 75%
    { perspective: 'Internal', name: 'Maintenance Project Manpower Efficiency (P4-KR1)', weight: 20, uom: '%', l1: 30, l2: 55, l3: 75, l4: 85, l5: 95, actual: 0, level: 'L1', higherIsBetter: true },
    // P4-KR2: Vendor Performance Standardization — Q1 target 50%, yearly 100%
    { perspective: 'Internal', name: 'Vendor Performance Standardization (P4-KR2)', weight: 20, uom: '%', l1: 10, l2: 25, l3: 50, l4: 75, l5: 100, actual: 0, level: 'L1', higherIsBetter: true },
    // P4-KR3: Vendor Database & Specialization — Q1 target 75%, yearly 100%
    { perspective: 'Internal', name: 'Vendor Database & Specialization (P4-KR3)', weight: 20, uom: '%', l1: 25, l2: 50, l3: 75, l4: 88, l5: 100, actual: 0, level: 'L1', higherIsBetter: true },
    // P4-KR4: Plasma Cost Management — Q1 target 95%
    { perspective: 'Internal', name: 'Plasma Cost Management (P4-KR4)', weight: 20, uom: '%', l1: 60, l2: 80, l3: 95, l4: 98, l5: 100, actual: 0, level: 'L1', higherIsBetter: true },
    // P4-KR5: Infrastructure & Server Cost Control — Q1 target 95%
    { perspective: 'Internal', name: 'Infrastructure & Server Cost Control (P4-KR5)', weight: 20, uom: '%', l1: 60, l2: 80, l3: 95, l4: 98, l5: 100, actual: 0, level: 'L1', higherIsBetter: true },
  ],
  // ── Game Design Manager: P2 Product Launches ─────────────────────────
  thommi: [
    // P2-KR: GBA product delivery — Not Started
    { perspective: 'Financial', name: 'GBA/Product Delivery Revenue (P2-KR)', weight: 20, uom: 'IDR M', l1: 100, l2: 250, l3: 500, l4: 750, l5: 1000, actual: 0, level: 'L1', higherIsBetter: true },
    // P2: Roblox DAU — Not Started (Roblox product not launched yet)
    { perspective: 'Customer', name: 'Roblox DAU (P2-KR)', weight: 15, uom: 'Users', l1: 100, l2: 250, l3: 400, l4: 550, l5: 650, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Customer', name: 'Design Quality Score', weight: 10, uom: '/5', l1: 2.5, l2: 3.0, l3: 3.5, l4: 4.0, l5: 4.5, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Customer', name: 'Design Revision Rounds', weight: 10, uom: 'Rounds', l1: 6, l2: 5, l3: 4, l4: 3, l5: 2, actual: 0, level: 'L1', higherIsBetter: false },
    { perspective: 'Internal', name: 'Feature On-Time Delivery (P2-KR)', weight: 20, uom: '%', l1: 60, l2: 70, l3: 80, l4: 90, l5: 95, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Internal', name: 'GDD Documentation Coverage', weight: 10, uom: '%', l1: 40, l2: 60, l3: 75, l4: 85, l5: 95, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Learning', name: 'Design Innovation Score', weight: 10, uom: 'Score', l1: 1, l2: 2, l3: 3, l4: 4, l5: 5, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Learning', name: 'Mentoring Hours', weight: 5, uom: 'Hrs', l1: 4, l2: 8, l3: 12, l4: 16, l5: 20, actual: 0, level: 'L1', higherIsBetter: true },
  ],
  // ── Tech Director: P4 Tech Cost & Pipeline ───────────────────────────
  adi: [
    // P4-KR: Server cost optimization — Not Started
    { perspective: 'Financial', name: 'Server Cost Optimization (P4-KR)', weight: 20, uom: 'IDR M', l1: 120, l2: 110, l3: 100, l4: 90, l5: 80, actual: 0, level: 'L1', higherIsBetter: false },
    { perspective: 'Customer', name: 'System Uptime', weight: 15, uom: '%', l1: 95, l2: 97, l3: 99, l4: 99.5, l5: 99.9, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Internal', name: 'Deployment Frequency', weight: 10, uom: '/wk', l1: 1, l2: 2, l3: 3, l4: 5, l5: 7, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Internal', name: 'Code Review Turnaround', weight: 10, uom: 'Hrs', l1: 48, l2: 24, l3: 12, l4: 8, l5: 4, actual: 0, level: 'L1', higherIsBetter: false },
    // P4-KR: Tech debt & pipeline standard compliance — Not Started
    { perspective: 'Internal', name: 'Tech Pipeline Standards (P4-KR)', weight: 15, uom: '%', l1: 40, l2: 60, l3: 80, l4: 90, l5: 100, actual: 0, level: 'L1', higherIsBetter: true },
    // P4-KR: AI workforce adoption — Not Started
    { perspective: 'Learning', name: 'AI/Automation Adoption (P4-KR)', weight: 15, uom: '%', l1: 20, l2: 40, l3: 60, l4: 80, l5: 100, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Learning', name: 'Tech Stack Modernization', weight: 10, uom: 'Score', l1: 1, l2: 2, l3: 3, l4: 4, l5: 5, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Internal', name: 'Tech Debt Reduction', weight: 5, uom: '%', l1: 5, l2: 10, l3: 20, l4: 30, l5: 40, actual: 0, level: 'L1', higherIsBetter: true },
  ],
  // ── Art Director: P4 AI Art Pipeline ────────────────────────────────
  'putri-f': [
    // P4-KR17: AI-assisted concept art pipeline — Not Started
    { perspective: 'Financial', name: 'AI Art Pipeline Cost Efficiency (P4-KR17)', weight: 20, uom: '%', l1: 10, l2: 25, l3: 50, l4: 70, l5: 90, actual: 0, level: 'L1', higherIsBetter: true },
    // P2/P4: AI mockup for presales — Not Started
    { perspective: 'Customer', name: 'AI Presales Mockups Delivered (P4-KR19)', weight: 15, uom: 'Count', l1: 0, l2: 1, l3: 2, l4: 4, l5: 6, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Customer', name: 'Art Quality Score', weight: 15, uom: '/5', l1: 2.5, l2: 3.0, l3: 3.5, l4: 4.0, l5: 4.5, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Internal', name: 'Asset Delivery On-Time', weight: 20, uom: '%', l1: 60, l2: 70, l3: 80, l4: 90, l5: 95, actual: 0, level: 'L1', higherIsBetter: true },
    // GF Art Style Book — Not Started
    { perspective: 'Internal', name: 'GF Art Style Book Progress (P2)', weight: 15, uom: '%', l1: 20, l2: 40, l3: 80, l4: 90, l5: 100, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Learning', name: 'Team AI Tools Adoption (P4-KR18)', weight: 15, uom: '%', l1: 10, l2: 25, l3: 50, l4: 70, l5: 90, actual: 0, level: 'L1', higherIsBetter: true },
  ],
  // ── QA Lead: single KR — Delivery Reliability ───────────────────────
  marlin: [
    // P4-KR21: Delivery Reliability — Q1 target 90%
    { perspective: 'Internal', name: 'Delivery Reliability (P4-KR21)', weight: 100, uom: '%', l1: 50, l2: 70, l3: 90, l4: 95, l5: 100, actual: 0, level: 'L1', higherIsBetter: true },
  ],
  // ── Marketing: P2/P3 Leads & Campaigns ──────────────────────────────
  hisyam: [
    // P4: Marketing spend efficiency — Not Started
    { perspective: 'Financial', name: 'Marketing ROI (P4-KR)', weight: 15, uom: '%', l1: 50, l2: 100, l3: 200, l4: 300, l5: 400, actual: 0, level: 'L1', higherIsBetter: true },
    // P2/P3-KR: B2B leads — Q1 actual 17 vs target 24
    { perspective: 'Customer', name: 'Quality B2B Leads (P2/P3-KR)', weight: 25, uom: 'Leads/Q', l1: 8, l2: 14, l3: 18, l4: 22, l5: 24, actual: 17, level: 'L2', higherIsBetter: true },
    { perspective: 'Customer', name: 'Email Open Rate', weight: 10, uom: '%', l1: 15, l2: 20, l3: 30, l4: 35, l5: 40, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Customer', name: 'Email Click Rate', weight: 10, uom: '%', l1: 10, l2: 20, l3: 30, l4: 40, l5: 50, actual: 0, level: 'L1', higherIsBetter: true },
    // Campaign execution — Not Started
    { perspective: 'Internal', name: 'Campaign Execution Rate', weight: 10, uom: '%', l1: 50, l2: 65, l3: 80, l4: 90, l5: 100, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Internal', name: 'Content Production', weight: 10, uom: 'Pcs/Mo', l1: 4, l2: 8, l3: 12, l4: 16, l5: 20, actual: 0, level: 'L1', higherIsBetter: true },
    { perspective: 'Internal', name: 'Lead Response Time', weight: 10, uom: 'Hrs', l1: 48, l2: 24, l3: 12, l4: 6, l5: 2, actual: 0, level: 'L1', higherIsBetter: false },
    { perspective: 'Learning', name: 'Marketing Tool Mastery', weight: 10, uom: '%', l1: 30, l2: 50, l3: 70, l4: 85, l5: 95, actual: 0, level: 'L1', higherIsBetter: true },
  ],
  // ── Division Head: P1 Revenue & EBITDA ──────────────────────────────
  junialdi: [
    // P1-KR1: Q1 revenue target = IDR 1.5B
    { perspective: 'Financial', name: 'Division Revenue (P1-KR1, Q1 Target: 1.5B)', weight: 25, uom: 'IDR B', l1: 0.3, l2: 0.8, l3: 1.5, l4: 2.0, l5: 2.5, actual: 0.294, level: 'L1', higherIsBetter: true },
    // P1-KR3: Q1 EBITDA target = IDR 59.4M
    { perspective: 'Financial', name: 'EBITDA Achievement (P1-KR3, Q1 Target: 59.4M)', weight: 20, uom: 'IDR M', l1: -200, l2: 0, l3: 59.4, l4: 100, l5: 150, actual: -3850, level: 'L1', higherIsBetter: true },
    // P3: Key account retention for repeat revenue
    { perspective: 'Customer', name: 'Key Account Retention', weight: 15, uom: '%', l1: 60, l2: 70, l3: 80, l4: 90, l5: 95, actual: 78, level: 'L3', higherIsBetter: true },
    // P4: Manpower cost efficiency
    { perspective: 'Internal', name: 'Manpower Cost Efficiency (P4-KR1)', weight: 15, uom: '%', l1: 60, l2: 70, l3: 80, l4: 90, l5: 95, actual: 75, level: 'L2', higherIsBetter: true },
    // P2: Strategic initiative completion rate (GBA, Roblox, partnerships)
    { perspective: 'Internal', name: 'Strategic Init. Completion (P2/P3)', weight: 10, uom: '%', l1: 40, l2: 55, l3: 70, l4: 85, l5: 95, actual: 65, level: 'L2', higherIsBetter: true },
    // Learning: org & team development score
    { perspective: 'Learning', name: 'Organization Development Score', weight: 15, uom: 'Score', l1: 1, l2: 2, l3: 3, l4: 4, l5: 5, actual: 3.5, level: 'L3', higherIsBetter: true },
  ],
};

// ─── OKR → PersonKPI Auto-Derivation ─────────────────────────────────────────

/** Maps OKR PIC display names (as used in OKR_ITEMS.pic) → crew member IDs */
export const PIC_TO_CREW_ID: Record<string, string> = {
  'Junialdi': 'junialdi',
  'Auliya':   'auliya',
  'Bima':     'bima',
  'Sandi':    'sandi',
  'Thommi':   'thommi',
  'Adi':      'adi',
  'Putri F.': 'putri-f',
  'Marlin':   'marlin',
  'Hisyam':   'hisyam',
  'Ihsan':    'ihsan',
  'Agung':    'agung',
  'Faisal':   'faisal',
};

/** Reverse lookup: crew ID → OKR PIC display name */
export const CREW_ID_TO_PIC: Record<string, string> = Object.fromEntries(
  Object.entries(PIC_TO_CREW_ID).map(([k, v]) => [v, k])
);

function _parseOKRValue(s: string): number | null {
  if (!s || s === '-') return null;
  const c = s.trim().replace(/,/g, '').replace(/IDR\s*/i, '');
  if (/^-?[0-9.]+B$/i.test(c)) return parseFloat(c);   // e.g. "1.5B"
  if (/^-?[0-9.]+M$/i.test(c)) return parseFloat(c);   // e.g. "59.4M"
  if (/^-?[0-9.]+%$/.test(c)) return parseFloat(c);    // e.g. "100%"
  const n = parseFloat(c);
  return isNaN(n) ? null : n;
}

function _deriveUOM(targetStr: string, metric: string): string {
  const c = targetStr.trim().replace(/,/g, '');
  if (/[0-9]B$/i.test(c)) return 'IDR B';
  if (/[0-9]M$/i.test(c)) return 'IDR M';
  if (/[0-9]%$/.test(c))  return '%';
  return metric; // use the KR metric field as fallback UOM
}

function _pillarToPerspective(pillar: PillarKey): BSCPerspective {
  if (pillar === 'P1') return 'Financial';
  if (pillar === 'P4') return 'Internal';
  return 'Customer'; // P2 and P3 → customer/market focus
}

function _isLowerBetter(subject: string, metric: string): boolean {
  const text = `${subject} ${metric}`.toLowerCase();
  return /\b(days?|time|cost|expense|reduction|turnaround)\b/.test(text) &&
    !/\b(on-?time|saving|saving|utilization)\b/.test(text);
}

function _scaleFromL3(
  l3: number,
  h: boolean // higherIsBetter
): { l1: number; l2: number; l4: number; l5: number } {
  if (h) {
    return { l1: +(l3 * 0.30).toFixed(4), l2: +(l3 * 0.60).toFixed(4),
             l4: +(l3 * 1.25).toFixed(4), l5: +(l3 * 1.50).toFixed(4) };
  }
  // Lower is better: L1 = worst (highest), L5 = best (lowest)
  return { l1: +(l3 * 1.70).toFixed(4), l2: +(l3 * 1.30).toFixed(4),
           l4: +(l3 * 0.75).toFixed(4), l5: +(l3 * 0.50).toFixed(4) };
}

/**
 * Automatically derives PersonKPI[] for a person from OKR_ITEMS KR data.
 * - Each KR where `pic === person's display name` becomes one KPI card.
 * - The quarter's target is used as L3 (on-track threshold).
 * - KRs with no target ('-') for the selected quarter are skipped.
 * - Weights are distributed equally across all KRs for the person.
 */
/** KPI for crew-tier members: one simple Task Completion Rate card. */
function crewTaskKPI(): PersonKPI[] {
  return [{
    perspective: 'Internal',
    name: 'Task Completion Rate',
    weight: 100,
    uom: '%',
    l1: 50, l2: 70, l3: 90, l4: 95, l5: 100,
    actual: 0,
    level: 'L1',
    higherIsBetter: true,
  }];
}

export function derivePersonKPIsFromOKR(
  personId: string,
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
): PersonKPI[] {
  // Crew-tier members only track Task Completion Rate
  const member = CREW_MEMBERS.find(m => m.id === personId);
  if (member?.tier === 'crew') return crewTaskKPI();

  const picName = CREW_ID_TO_PIC[personId];
  if (!picName) {
    const staticKPIs = PERSON_KPIS[personId];
    // No OKR items and no static data → fall back to crew Task Completion Rate
    return staticKPIs && staticKPIs.length > 0 ? staticKPIs : crewTaskKPI();
  }

  const krItems = OKR_ITEMS.filter(
    item => item.type === 'KR' && item.pic === picName
  );

  const result: PersonKPI[] = [];
  const baseWeight = Math.max(5, Math.floor(100 / Math.max(krItems.length, 1)));

  for (const kr of krItems) {
    const targetStr =
      quarter === 'Q1' ? kr.q1Target :
      quarter === 'Q2' ? kr.q2Target :
      quarter === 'Q3' ? kr.q3Target :
      kr.q4Target;

    const l3 = _parseOKRValue(targetStr);
    if (l3 === null || l3 === 0) continue; // no target this quarter — skip

    const h = !_isLowerBetter(kr.subject, kr.metric);
    const uom = _deriveUOM(targetStr, kr.metric);
    const { l1, l2, l4, l5 } = _scaleFromL3(l3, h);
    const actual = _parseOKRValue(kr.actual ?? '') ?? 0;

    result.push({
      perspective: _pillarToPerspective(kr.pillar),
      name: `${kr.subject} (${kr.id.toUpperCase()})`,
      weight: baseWeight,
      uom,
      l1, l2, l3, l4, l5,
      actual,
      level: calcLevel(actual, { l1, l2, l3, l4, l5, higherIsBetter: h }),
      higherIsBetter: h,
    });
  }

  // Prefer static PERSON_KPIS when defined (they have full BSC scorecard);
  // only use OKR-derived KRs when no static data exists for this person.
  const staticKPIs = PERSON_KPIS[personId];
  if (staticKPIs && staticKPIs.length > 0) return staticKPIs;
  return result.length > 0 ? result : crewTaskKPI();
}

// ─── KPI Submission Data ──────────────────────────────────────────────────────

export interface KPISubmission {
  id: number;
  person: string;
  quarter: string;
  status: SubmissionStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewer: string | null;
  kpiCount: number;
  comments: string;
  scores: Record<string, { actual: number; level: string; evidence: string; note: string; attachments: Array<{ name: string; size: string }> }>;
}

// Empty — all submissions start from scratch; no pre-filled/sample data
export const INITIAL_SUBMISSIONS: KPISubmission[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function calcLevel(actual: number, kpi: { l1: number; l2: number; l3: number; l4: number; l5: number; higherIsBetter?: boolean }): LevelKey {
  const h = kpi.higherIsBetter !== false;
  if (h) {
    if (actual >= kpi.l5) return 'L5';
    if (actual >= kpi.l4) return 'L4';
    if (actual >= kpi.l3) return 'L3';
    if (actual >= kpi.l2) return 'L2';
    return 'L1';
  } else {
    if (actual <= kpi.l5) return 'L5';
    if (actual <= kpi.l4) return 'L4';
    if (actual <= kpi.l3) return 'L3';
    if (actual <= kpi.l2) return 'L2';
    return 'L1';
  }
}

export const LEVEL_COLORS: Record<LevelKey, string> = {
  L1: 'bg-red-500/20 text-red-400 border-red-500/30',
  L2: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  L3: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  L4: 'bg-green-500/20 text-green-400 border-green-500/30',
  L5: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export const LEVEL_LABELS: Record<LevelKey, string> = {
  L1: 'Far Below', L2: 'Below', L3: 'On Track', L4: 'Above', L5: 'Exceptional',
};

export const STATUS_COLORS: Record<OKRStatus, string> = {
  'Exceptional': 'bg-blue-500/20 text-blue-400',
  'Above': 'bg-green-500/20 text-green-400',
  'On Track': 'bg-amber-500/20 text-amber-400',
  'Below': 'bg-orange-500/20 text-orange-400',
  'Far Below': 'bg-red-500/20 text-red-400',
  'Off Track': 'bg-red-700/20 text-red-500',
};

export const PILLAR_COLORS: Record<PillarKey, { bg: string; text: string; border: string; label: string }> = {
  P1: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'P1: Growth & EBITDA' },
  P2: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'P2: Product Expansion' },
  P3: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', label: 'P3: Global Market' },
  P4: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'P4: Cost Efficiency' },
};

// Derived from CREW_MEMBERS so new members are picked up automatically
export const PERSON_LIST = CREW_MEMBERS.map(m => ({
  id: m.id,
  name: m.name,
  role: m.role,
}));
