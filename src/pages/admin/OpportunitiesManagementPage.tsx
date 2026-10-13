import { useState, type FC, type FormEvent } from 'react'
import {
  IconPlus,
  IconBriefcase,
  IconSchool,
  IconBuilding,
  IconMapPin,
  IconEye,
  IconCheck,
  IconX,
  IconBook,
  IconCircleCheck,
  IconCalendar,
  IconUsers,
  IconSparkles,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { PageHeader, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'
import { USER_TYPES } from '@/constants/userTypes'

export type OpportunityType = 'JOB' | 'INTERNSHIP' | 'SCHOLARSHIP' | 'CAPSTONE_PROJECT' | 'RESEARCH_ASSISTANT'

export interface OpportunityRecord {
  id: string
  title: string
  company: string
  type: OpportunityType
  location: string
  postedBy: string
  department?: string
  targetCohort?: string
  applicantsCount: number
  status: 'active' | 'pending' | 'inactive'
  deadline: string
  description?: string
  contactEmail?: string
  isAcademicVerified?: boolean
}

export const OpportunitiesManagementPage: FC = () => {
  const { role, userType, currentUser } = useAuthStore()
  const isFaculty = role !== 'ADMIN' && role !== 'MODERATOR' && userType === USER_TYPES.FACULTY

  // State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityRecord | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form Fields
  const [title, setTitle] = useState('')
  const [oppType, setOppType] = useState<OpportunityType>('CAPSTONE_PROJECT')
  const [company] = useState('FPT University - Software Engineering Lab')
  const [department, setDepartment] = useState('Software Engineering')
  const [targetCohort, setTargetCohort] = useState('K17, K18')
  const [location, setLocation] = useState('Hoa Lac Campus')
  const [deadline, setDeadline] = useState('2026-11-30')
  const [contactEmail, setContactEmail] = useState(currentUser?.email || 'faculty.se@fpt.edu.vn')
  const [description, setDescription] = useState('')

  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([
    {
      id: 'OPP-01',
      title: 'Junior React & Node.js Engineer (Graduate Hire)',
      company: 'FPT Software Da Nang',
      type: 'JOB',
      location: 'Da Nang (F-Complex)',
      postedBy: 'Hoang Minh (K12 SE)',
      applicantsCount: 42,
      status: 'active',
      deadline: '2026-11-15',
      description: 'Full-time junior software engineer position for recent FPT graduates with strong JavaScript/TypeScript skills.',
      contactEmail: 'recruitment.danang@fpt.com',
    },
    {
      id: 'OPP-02',
      title: 'AI Research Assistant (Spring 2026 Capstone & OJT)',
      company: 'FPT AI Lab & Research Center',
      type: 'RESEARCH_ASSISTANT',
      location: 'Hanoi (Hoa Lac Campus)',
      postedBy: 'Dr. Le Van Phuc',
      department: 'Software Engineering',
      targetCohort: 'K17, K18',
      applicantsCount: 18,
      status: 'active',
      deadline: '2026-10-30',
      description: 'Join faculty research on Large Language Model optimization for academic tutoring in Vietnamese universities.',
      contactEmail: 'phuclv@fe.edu.vn',
      isAcademicVerified: true,
    },
    {
      id: 'OPP-03',
      title: 'FPT Alumni Global Master Fellowship 2026',
      company: 'FPT University Global Alumni Fund',
      type: 'SCHOLARSHIP',
      location: 'Tokyo, Japan',
      postedBy: 'Tokyo Alumni Chapter',
      applicantsCount: 7,
      status: 'pending',
      deadline: '2026-12-01',
      description: '$15,000 scholarship fellowship for outstanding engineering alumni pursuing graduate studies abroad.',
      contactEmail: 'scholarship@alumni.fpt.edu.vn',
    },
    {
      id: 'OPP-04',
      title: 'Automated Code Review Capstone Mentorship (Fall 2026)',
      company: 'Department of Software Engineering',
      type: 'CAPSTONE_PROJECT',
      location: 'Hoa Lac Campus',
      postedBy: 'Dr. Nguyen Van Faculty',
      department: 'Software Engineering',
      targetCohort: 'K17 Seniors',
      applicantsCount: 14,
      status: 'active',
      deadline: '2026-11-20',
      description: 'Department sponsored capstone project with industry mentor supervision and high performance computing resource grant.',
      contactEmail: 'faculty.se@fpt.edu.vn',
      isAcademicVerified: true,
    },
  ])

  const handleCreateOpportunity = (e: FormEvent) => {
    e.preventDefault()

    const newOpp: OpportunityRecord = {
      id: `OPP-0${opportunities.length + 1}`,
      title: title.trim(),
      company: company.trim(),
      type: oppType,
      location: location.trim(),
      postedBy: currentUser?.name || 'Faculty Coordinator',
      department: department.trim(),
      targetCohort: targetCohort.trim(),
      applicantsCount: 0,
      status: 'active',
      deadline,
      description: description.trim(),
      contactEmail: contactEmail.trim(),
      isAcademicVerified: true,
    }

    setOpportunities([newOpp, ...opportunities])
    setIsModalOpen(false)
    setTitle('')
    setDescription('')

    setToastMessage(`Academic Opportunity "${newOpp.title}" published successfully!`)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const columns: Column<OpportunityRecord>[] = [
    {
      key: 'title',
      header: 'Opportunity Title & Host',
      render: (o) => (
        <div className="flex flex-col max-w-sm">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 line-clamp-1">{o.title}</span>
            {o.isAcademicVerified && (
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 shrink-0">
                Verified Academic
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <IconBuilding size={13} stroke={1.8} className="text-slate-400" />
            {o.company}
          </span>
          {o.targetCohort && (
            <span className="text-[10px] text-brand-secondary font-medium">
              Cohort: {o.targetCohort} • {o.department}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Category Type',
      render: (o) => {
        const types: Record<OpportunityType, { label: string; icon: typeof IconBriefcase; color: string }> = {
          JOB: { label: 'Full-time Job', icon: IconBriefcase, color: 'text-brand-primary bg-orange-50 border-orange-200' },
          INTERNSHIP: { label: 'OJT / Internship', icon: IconBuilding, color: 'text-brand-secondary bg-sky-50 border-sky-200' },
          SCHOLARSHIP: { label: 'Scholarship', icon: IconSchool, color: 'text-purple-700 bg-purple-50 border-purple-200' },
          CAPSTONE_PROJECT: { label: 'Capstone Project', icon: IconBook, color: 'text-brand-accent bg-emerald-50 border-emerald-200' },
          RESEARCH_ASSISTANT: { label: 'Research Assistant', icon: IconSparkles, color: 'text-amber-800 bg-amber-50 border-amber-200' },
        }
        const cfg = types[o.type] || types.JOB
        const Icon = cfg.icon
        return (
          <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
            <Icon size={13} stroke={1.8} />
            <span>{cfg.label}</span>
          </span>
        )
      },
    },
    {
      key: 'location',
      header: 'Campus / Location',
      render: (o) => (
        <span className="inline-flex items-center gap-1 text-slate-600 text-xs">
          <IconMapPin size={14} stroke={1.8} className="text-slate-400 shrink-0" />
          <span>{o.location}</span>
        </span>
      ),
    },
    {
      key: 'applicantsCount',
      header: 'Applications',
      render: (o) => (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-800 text-xs">
          <IconUsers size={14} stroke={1.8} className="text-slate-400" />
          <span>{o.applicantsCount} candidates</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (o) => (
        <span className="inline-flex items-center gap-1 text-slate-500 font-mono text-[11px]">
          <IconCalendar size={13} stroke={1.8} className="text-slate-400" />
          <span>{o.deadline}</span>
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (o) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedOpportunity(o)}
            className="h-7 text-xs border-slate-200 hover:text-brand-primary"
          >
            <IconEye size={14} stroke={1.8} className="mr-1" />
            View
          </Button>

          {o.status === 'pending' && (
            <Button
              size="sm"
              onClick={() =>
                setOpportunities((prev) =>
                  prev.map((item) =>
                    item.id === o.id ? { ...item, status: 'active' } : item
                  )
                )
              }
              className="h-7 rounded-md bg-brand-accent px-2.5 text-xs font-semibold text-white hover:bg-emerald-600"
            >
              <IconCheck size={14} stroke={1.8} className="mr-1" />
              Approve
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <IconCircleCheck size={16} stroke={2} className="text-brand-accent shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      <PageHeader
        title={isFaculty ? 'Academic Opportunities & Career Hub' : 'Opportunity Management'}
        description={
          isFaculty
            ? 'Publish departmental capstone project proposals, research fellowships, and verified academic internships.'
            : 'Verify and coordinate career listings, OJT internships, and graduate scholarship grants.'
        }
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Opportunities' },
        ]}
        actions={
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-9 rounded-lg bg-brand-primary px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary-hover flex items-center gap-1.5"
          >
            <IconPlus size={16} stroke={2} />
            <span>{isFaculty ? 'Publish Academic Opportunity' : 'Post Opportunity'}</span>
          </Button>
        }
      />

      <DataTable
        data={opportunities}
        columns={columns}
        keyExtractor={(o) => o.id}
        searchPlaceholder="Search opportunities by title, department, or cohort..."
        searchFilter={(o, q) =>
          o.title.toLowerCase().includes(q) ||
          o.company.toLowerCase().includes(q) ||
          (o.department || '').toLowerCase().includes(q) ||
          (o.targetCohort || '').toLowerCase().includes(q)
        }
      />

      {/* MODAL 1: Publish Academic Opportunity Modal (Faculty & Admin) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-orange-50/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <IconBook size={20} stroke={2} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Publish Academic Opportunity
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    FPT University Faculty Academic & Career Notice
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateOpportunity} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Opportunity Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Research Assistantship - LLM Engineering (Spring 2026)"
                  className="w-full rounded-xl border border-slate-200 bg-[#F1F5F9] px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              {/* Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Opportunity Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'CAPSTONE_PROJECT', label: 'Capstone Project Proposal', icon: IconBook },
                    { id: 'RESEARCH_ASSISTANT', label: 'Research Assistantship', icon: IconSparkles },
                    { id: 'SCHOLARSHIP', label: 'Academic Scholarship Grant', icon: IconSchool },
                    { id: 'INTERNSHIP', label: 'OJT / Department Vacancy', icon: IconBuilding },
                  ].map((t) => {
                    const Icon = t.icon
                    const isSelected = oppType === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setOppType(t.id as OpportunityType)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left font-semibold transition-all ${
                          isSelected
                            ? 'border-brand-primary bg-orange-50 text-brand-primary ring-2 ring-brand-primary/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Icon size={16} stroke={1.8} className="shrink-0" />
                        <span className="text-xs">{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Department & Cohort */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Host Department / Lab
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-[#F1F5F9] px-3 py-2 text-xs text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                  >
                    <option value="Software Engineering">Software Engineering (SE)</option>
                    <option value="Artificial Intelligence">Artificial Intelligence (AI)</option>
                    <option value="Information Assurance">Information Assurance (IA)</option>
                    <option value="Information Systems">Information Systems (IS)</option>
                    <option value="Business Administration">Business Administration</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Target Cohort
                  </label>
                  <input
                    type="text"
                    value={targetCohort}
                    onChange={(e) => setTargetCohort(e.target.value)}
                    placeholder="e.g. K17, K18 or All Enrolled"
                    className="w-full rounded-xl border border-slate-200 bg-[#F1F5F9] px-3.5 py-2 text-xs text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Campus Location & Deadline */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Campus Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-[#F1F5F9] px-3 py-2 text-xs text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                  >
                    <option value="Hoa Lac Campus">Hoa Lac Campus (Hanoi)</option>
                    <option value="Da Nang Campus">Da Nang Campus</option>
                    <option value="Ho Chi Minh Campus">Ho Chi Minh Campus</option>
                    <option value="Can Tho Campus">Can Tho Campus</option>
                    <option value="Quy Nhon Campus">Quy Nhon Campus</option>
                    <option value="Remote / Hybrid">Remote / Hybrid</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-[#F1F5F9] px-3 py-2 text-xs text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Contact Professor */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Faculty Lead Contact Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="professor@fpt.edu.vn"
                  className="w-full rounded-xl border border-slate-200 bg-[#F1F5F9] px-3.5 py-2 text-xs text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Opportunity Scope & Student Qualifications
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe prerequisites, project deliverables, GPA requirements, or capstone milestones..."
                  className="w-full rounded-xl border border-slate-200 bg-[#F1F5F9] p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 border-slate-200 text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold px-4"
                >
                  <IconCheck size={16} stroke={2} className="mr-1.5" />
                  Publish Opportunity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Detail Inspection */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-primary">{selectedOpportunity.id}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-700">{selectedOpportunity.company}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOpportunity(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedOpportunity.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Posted by {selectedOpportunity.postedBy} • Deadline: {selectedOpportunity.deadline}
                </p>
              </div>

              {selectedOpportunity.description && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-slate-800 leading-relaxed font-sans">
                  {selectedOpportunity.description}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                  <span className="font-semibold text-slate-800">{selectedOpportunity.location}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Inquiries</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {selectedOpportunity.contactEmail || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-200 px-6 py-3.5 bg-slate-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOpportunity(null)}
                className="h-8 border-slate-200 text-slate-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OpportunitiesManagementPage
