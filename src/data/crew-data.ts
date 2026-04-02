export type CrewTier = 'leadership' | 'group-leader' | 'crew';

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  isAdmin: boolean;
  reportsTo: string | null;   // id of direct superior (atasan), null = top-level
  department: string;
  tier: CrewTier;              // organizational tier: leadership / group-leader / crew
  code?: string;               // fixed login verification code (overrides random generated)
}

export const CREW_MEMBERS: CrewMember[] = [
  // ── Division Head (Leadership) ──────────────────────────────────
  { id: 'junialdi', name: 'Junialdi Dwija Putra', role: 'Division Head, Gamification',         isAdmin: true,  reportsTo: null,       department: 'Management',         tier: 'leadership',   code: 'CUAN0'  },

  // ── Art Department ─────────────────────────────────────────
  { id: 'putri-f',  name: 'Putri Febriani Lestari',       role: 'Associate Director, Art',         isAdmin: false, reportsTo: 'junialdi', department: 'Art',                tier: 'leadership',   code: 'ART01'  },
  { id: 'maghfira', name: 'Maghfira Ramadhanti',           role: 'Associate Lead, Artist',          isAdmin: false, reportsTo: 'putri-f',  department: 'Art',                tier: 'group-leader', code: 'ART02'  },
  { id: 'renindya', name: 'Renindya Cahaya Hermara.M',     role: 'Technical Artist',                isAdmin: false, reportsTo: 'putri-f',  department: 'Art',                tier: 'crew',         code: 'ART03'  },
  { id: 'adli',     name: 'Adli Kusuma Basri',             role: 'Jr. 2D Artist',                   isAdmin: false, reportsTo: 'maghfira', department: 'Art',                tier: 'crew',         code: 'ART04'  },
  { id: 'tian',     name: 'Tian Andika Pratama',           role: 'Graphic Designer',                isAdmin: false, reportsTo: 'putri-f',  department: 'Art',                tier: 'crew',         code: 'ART05'  },

  // ── Business Development & Marketing ───────────────────────
  { id: 'auliya',   name: 'Nur Auliya Hidayati',           role: 'Sr. Business Development Manager', isAdmin: false, reportsTo: 'junialdi', department: 'Business Development', tier: 'leadership',  code: 'BD001'  },
  { id: 'bima',     name: 'Bima Aryuna',                   role: 'Business Development Manager',    isAdmin: false, reportsTo: 'auliya',   department: 'Business Development', tier: 'group-leader', code: 'BD002'  },
  { id: 'hisyam',   name: 'Hisyam Hesbi Wijonarko',        role: 'B2B Marketing Executive',         isAdmin: false, reportsTo: 'auliya',   department: 'Marketing',          tier: 'group-leader', code: 'MKT01'  },

  // ── Game Design ────────────────────────────────────────────
  { id: 'thommi',   name: 'Muhammad Thommi Ilman',         role: 'Manager, Game Design',            isAdmin: false, reportsTo: 'junialdi', department: 'Game Design',        tier: 'leadership',   code: 'GD001'  },
  { id: 'agung',    name: 'Agung Budhi Prakoso',           role: 'Game Designer',                   isAdmin: false, reportsTo: 'thommi',   department: 'Game Design',        tier: 'crew',         code: 'GD002'  },

  // ── Production ─────────────────────────────────────────────
  { id: 'sandi',    name: 'Sandi Rusnandi',                role: '(Acting) Director, Production',   isAdmin: false, reportsTo: 'junialdi', department: 'Production',         tier: 'leadership',   code: 'PRD01'  },
  { id: 'ihsan',    name: 'Ihsan Fajari',                  role: 'Associate Director, Production',  isAdmin: false, reportsTo: 'sandi',    department: 'Production',         tier: 'group-leader', code: 'PRD02'  },

  // ── Technology ─────────────────────────────────────────────
  { id: 'adi',      name: 'Adi Gumelar',                   role: '(Acting) Director, Tech',         isAdmin: false, reportsTo: 'junialdi', department: 'Technology',         tier: 'leadership',   code: 'TCH01'  },
  { id: 'faisal',   name: 'Faisal Rahman',                 role: 'Web Frontend Programmer',         isAdmin: false, reportsTo: 'adi',      department: 'Technology',         tier: 'group-leader', code: 'TCH02'  },
  { id: 'hari',     name: 'Hari Anugrah Tri Abadi',        role: 'Jr. Web Frontend Programmer',     isAdmin: false, reportsTo: 'faisal',   department: 'Technology',         tier: 'crew',         code: 'TCH03'  },
  { id: 'firdaus',  name: 'Firdaus Perdana Yusuf',         role: 'Jr. Game Programmer',             isAdmin: false, reportsTo: 'adi',      department: 'Technology',         tier: 'crew',         code: 'TCH04'  },
  { id: 'ubassy',   name: 'Ubassy Abdillah',               role: 'Jr. Game Programmer',             isAdmin: false, reportsTo: 'adi',      department: 'Technology',         tier: 'crew',         code: 'TCH05'  },

  // ── Quality ────────────────────────────────────────────────
  { id: 'marlin',   name: 'Magdalena Marlin Amanda',       role: 'Lead, Quality',                   isAdmin: false, reportsTo: 'sandi',    department: 'Quality',            tier: 'group-leader', code: 'QA001'  },
  { id: 'bagus',    name: 'Bagus Insan Zarfani',           role: 'Quality Assurance',               isAdmin: false, reportsTo: 'marlin',   department: 'Quality',            tier: 'crew',         code: 'QA002'  },
];

export type ViewId = 'revenue-performance' | 'quality-leads' | 'crm-pipeline' | 'marketing-leads' | 'weekly-reports';

export const VIEW_LABELS: Record<ViewId, string> = {
  'revenue-performance': 'Revenue Performance',
  'quality-leads': 'Quality Leads',
  'crm-pipeline': 'CRM Pipeline',
  'marketing-leads': 'Marketing & Leads',
  'weekly-reports': 'Weekly Reports',
};

// Hierarchy helpers
export function getDirectReports(memberId: string): CrewMember[] {
  return CREW_MEMBERS.filter(m => m.reportsTo === memberId);
}

export function getSuperior(memberId: string): CrewMember | null {
  const member = CREW_MEMBERS.find(m => m.id === memberId);
  if (!member?.reportsTo) return null;
  return CREW_MEMBERS.find(m => m.id === member.reportsTo) || null;
}

export function getAllSubordinates(memberId: string): CrewMember[] {
  const result: CrewMember[] = [];
  const queue = getDirectReports(memberId);
  while (queue.length) {
    const current = queue.shift()!;
    result.push(current);
    queue.push(...getDirectReports(current.id));
  }
  return result;
}

export function getHierarchyLevel(memberId: string): number {
  let level = 0;
  let current = CREW_MEMBERS.find(m => m.id === memberId);
  while (current?.reportsTo) {
    level++;
    current = CREW_MEMBERS.find(m => m.id === current!.reportsTo);
  }
  return level;
}

// Tier helpers
export function getByTier(tier: CrewTier): CrewMember[] {
  return CREW_MEMBERS.filter(m => m.tier === tier);
}

export function getLeadership(): CrewMember[] {
  return getByTier('leadership');
}

export function getGroupLeaders(): CrewMember[] {
  return getByTier('group-leader');
}

export function getCrew(): CrewMember[] {
  return getByTier('crew');
}

export const DEPARTMENTS = [...new Set(CREW_MEMBERS.map(m => m.department))];

// Default access: BD/Marketing roles get more access, others get basic
export function getDefaultAccessMap(): Record<string, ViewId[]> {
  const map: Record<string, ViewId[]> = {};
  for (const member of CREW_MEMBERS) {
    if (member.isAdmin) {
      map[member.id] = ['revenue-performance', 'quality-leads', 'crm-pipeline', 'marketing-leads', 'weekly-reports'];
    } else if (
      member.role.toLowerCase().includes('business development') ||
      member.role.toLowerCase().includes('marketing') ||
      member.role.toLowerCase().includes('director')
    ) {
      map[member.id] = ['revenue-performance', 'quality-leads', 'crm-pipeline', 'marketing-leads', 'weekly-reports'];
    } else {
      map[member.id] = ['revenue-performance', 'weekly-reports'];
    }
  }
  return map;
}
