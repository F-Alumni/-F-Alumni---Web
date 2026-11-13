export interface CampusOption {
  value: string
  label: string
  shortLabel: string
}

export const FPT_CAMPUSES: readonly CampusOption[] = [
  { value: 'FU-HL', label: 'FPT Hòa Lạc (Hà Nội)', shortLabel: 'Hòa Lạc' },
  { value: 'FU-HCM', label: 'FPT TP. Hồ Chí Minh', shortLabel: 'TP.HCM' },
  { value: 'FU-DN', label: 'FPT Đà Nẵng', shortLabel: 'Đà Nẵng' },
  { value: 'FU-CT', label: 'FPT Cần Thơ', shortLabel: 'Cần Thơ' },
  { value: 'FU-QN', label: 'FPT Quy Nhơn', shortLabel: 'Quy Nhơn' },
] as const

const CAMPUS_ALIAS_MAP: Record<string, string> = {
  'fu-hl': 'FU-HL',
  hl: 'FU-HL',
  hn: 'FU-HL',
  hanoi: 'FU-HL',
  'ha noi': 'FU-HL',
  'hà nội': 'FU-HL',
  'hoa lac': 'FU-HL',
  'hòa lạc': 'FU-HL',
  'fpt hoa lac (hanoi)': 'FU-HL',
  'hoa lac campus': 'FU-HL',
  'fu-hcm': 'FU-HCM',
  hcm: 'FU-HCM',
  tphcm: 'FU-HCM',
  'ho chi minh': 'FU-HCM',
  'hồ chí minh': 'FU-HCM',
  'tp. ho chi minh': 'FU-HCM',
  'tp.hcm': 'FU-HCM',
  'fpt tp. ho chi minh': 'FU-HCM',
  'ho chi minh campus': 'FU-HCM',
  'fu-dn': 'FU-DN',
  dn: 'FU-DN',
  danang: 'FU-DN',
  'da nang': 'FU-DN',
  'đà nẵng': 'FU-DN',
  'fpt da nang': 'FU-DN',
  'da nang campus': 'FU-DN',
  'fu-ct': 'FU-CT',
  ct: 'FU-CT',
  cantho: 'FU-CT',
  'can tho': 'FU-CT',
  'cần thơ': 'FU-CT',
  'fpt can tho': 'FU-CT',
  'can tho campus': 'FU-CT',
  'fu-qn': 'FU-QN',
  qn: 'FU-QN',
  quynhon: 'FU-QN',
  'quy nhon': 'FU-QN',
  'quy nhơn': 'FU-QN',
  'fpt quy nhon': 'FU-QN',
  'quy nhon campus': 'FU-QN',
}

export function normalizeCampusCode(raw?: string | null): string {
  if (!raw || raw.trim().toLowerCase() === 'all') return 'All'
  const cleaned = raw.trim().toLowerCase()
  return CAMPUS_ALIAS_MAP[cleaned] ?? raw.trim()
}

export function formatCampusLabel(raw?: string | null): string {
  if (!raw) return 'Tất cả cơ sở'
  if (raw.trim().toLowerCase() === 'all') return 'Toàn quốc (5 Cơ sở)'
  const canonical = normalizeCampusCode(raw)
  const matched = FPT_CAMPUSES.find((c) => c.value === canonical)
  return matched ? matched.shortLabel : raw
}
