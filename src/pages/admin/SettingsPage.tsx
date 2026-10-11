import { useState, type FC } from 'react'
import { Save, ShieldCheck, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/admin'
import { ROUTES } from '@/constants/routes'

export const SettingsPage: FC = () => {
  const [autoVerifyFptEmail, setAutoVerifyFptEmail] = useState(true)
  const [allowPublicJobPosting, setAllowPublicJobPosting] = useState(false)
  const [requireModeratorApproval, setRequireModeratorApproval] = useState(true)
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="System Settings"
        description="Configure automated verification policies, moderation rules, and administrative controls."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Settings' },
        ]}
        actions={
          <Button
            onClick={handleSave}
            className="h-9 rounded-lg bg-brand-primary px-4 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary-hover flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaved ? 'Saved Successfully!' : 'Save Configuration'}</span>
          </Button>
        }
      />

      <div className="space-y-5">
        {/* Verification Settings */}
        <Card className="p-5 rounded-xl border-slate-200 bg-white space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <ShieldCheck className="h-5 w-5 text-brand-accent" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Alumni Verification Automation</h2>
              <p className="text-xs text-slate-500">Rules governing automated and manual degree checks.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoVerifyFptEmail}
                onChange={(e) => setAutoVerifyFptEmail(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">
                  Auto-Verify with Official @fpt.edu.vn / @fe.edu.vn Email
                </span>
                <span className="text-slate-500">
                  Applicants submitting an active institutional university email are fast-tracked into the verified alumni directory.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requireModeratorApproval}
                onChange={(e) => setRequireModeratorApproval(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">
                  Require Manual Degree Scan for Personal Emails (Gmail, Yahoo)
                </span>
                <span className="text-slate-500">
                  Requires alumni using non-university emails to submit degree diploma scans into the Verification Queue.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Opportunity & Content Rules */}
        <Card className="p-5 rounded-xl border-slate-200 bg-white space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Lock className="h-5 w-5 text-brand-secondary" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Posting & Moderation Policies</h2>
              <p className="text-xs text-slate-500">Access controls for career listings and open discussions.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPublicJobPosting}
                onChange={(e) => setAllowPublicJobPosting(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">
                  Allow Unverified Users to Post Job & Internship Listings
                </span>
                <span className="text-slate-500">
                  When disabled, only verified alumni and staff accounts can publish career opportunities to prevent spam.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlertsEnabled}
                onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">
                  Instant Email Notifications for High-Priority Reports
                </span>
                <span className="text-slate-500">
                  Send urgent moderation alerts directly to admin@fpt.edu.vn when content receives multiple flags.
                </span>
              </div>
            </label>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
