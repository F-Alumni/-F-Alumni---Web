import type { FC } from 'react'
import { Users, GraduationCap, TrendingUp, Award, Building2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PageHeader, StatCard } from '@/components/admin'
import { ROUTES } from '@/constants/routes'

export const AnalyticsPage: FC = () => {
  const campusStats = [
    { campus: 'FPT Hoa Lac (Hanoi)', students: 16500, alumni: 12400, verifiedRate: '88%' },
    { campus: 'FPT TP. Ho Chi Minh', students: 14200, alumni: 11100, verifiedRate: '86%' },
    { campus: 'FPT Da Nang', students: 5800, alumni: 4300, verifiedRate: '84%' },
    { campus: 'FPT Can Tho', students: 4100, alumni: 2800, verifiedRate: '79%' },
    { campus: 'FPT Quy Nhon (AI Hub)', students: 2300, alumni: 1150, verifiedRate: '82%' },
  ]

  const majorDistribution = [
    { major: 'Software Engineering (SE)', percentage: 38, count: '15,308' },
    { major: 'Artificial Intelligence (AI)', percentage: 18, count: '7,251' },
    { major: 'Information Assurance (IA)', percentage: 14, count: '5,639' },
    { major: 'Business Administration (BA)', percentage: 16, count: '6,445' },
    { major: 'Graphic Design & Media', percentage: 14, count: '5,639' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Growth Reports"
        description="Data analytics on student engagement, alumni verification coverage, and campus metrics."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Analytics' },
        ]}
      />

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Alumni Network"
          value="40,285"
          description="Cumulative across all 5 campuses"
          icon={<GraduationCap className="h-5 w-5" />}
          trend={{ value: '14.2% YoY', isPositive: true }}
          variant="secondary"
        />
        <StatCard
          title="Verification Rate"
          value="85.4%"
          description="Alumni with verified degree records"
          icon={<Award className="h-5 w-5" />}
          trend={{ value: '3.1% this quarter', isPositive: true }}
          variant="accent"
        />
        <StatCard
          title="Career Placements"
          value="1,450"
          description="OJT and graduate jobs facilitated"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: '8.7% MoM', isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Community Discussions"
          value="12,890"
          description="Active mentorship & knowledge posts"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: '19.5% MoM', isPositive: true }}
          variant="neutral"
        />
      </div>

      {/* Campus Breakdown Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 rounded-xl border-slate-200 bg-white lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of students and verified alumni per campus.</p>
            </div>
            <span className="rounded-full bg-brand-secondary/10 px-2.5 py-1 text-xs font-bold text-brand-secondary">
              5 Campuses
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC]">
                  <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Campus</th>
                  <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Students</th>
                  <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Alumni</th>
                  <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Verification Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campusStats.map((c) => (
                  <tr key={c.campus} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-brand-secondary" />
                      <span>{c.campus}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{c.students.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-600">{c.alumni.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-bold text-brand-accent">{c.verifiedRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Academic Major Share */}
        <Card className="p-5 rounded-xl border-slate-200 bg-white">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Major Breakdown</h3>
            <p className="text-xs text-slate-500">Student & Alumni share by field of study.</p>
          </div>

          <div className="space-y-4">
            {majorDistribution.map((m) => (
              <div key={m.major} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{m.major}</span>
                  <span className="font-bold text-slate-900">{m.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-500"
                    style={{ width: `${m.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsPage
