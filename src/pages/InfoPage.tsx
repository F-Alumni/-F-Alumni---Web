import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Info, ShieldCheck, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'

export type InfoPageType = 'about' | 'privacy' | 'guidelines'

const INFO_CONTENT: Record<
  InfoPageType,
  {
    title: string
    subtitle: string
    icon: typeof Info
    sections: { heading: string; body: string }[]
  }
> = {
  about: {
    title: 'Giới thiệu FPT Alumni Connect',
    subtitle: 'Nền tảng kết nối chính thức dành cho sinh viên, cựu sinh viên và giảng viên Đại học FPT.',
    icon: Info,
    sections: [
      {
        heading: 'Sứ mệnh kết nối cộng đồng',
        body: 'FPT Alumni Connect tạo không gian trao đổi học thuật, chia sẻ kinh nghiệm thực chiến từ cựu sinh viên đang làm việc tại các doanh nghiệp công nghệ và mở rộng cơ hội nghề nghiệp tại các campus FU-HL, FU-HCM, FU-DN, FU-CT, FU-QN.',
      },
      {
        heading: 'Hệ sinh thái tính năng',
        body: 'Nền tảng hỗ trợ diễn đàn hỏi đáp, danh bạ Alumni xác thực, kết nối cố vấn qua tin nhắn thời gian thực, cổng thông tin việc làm – thực tập – học bổng và trợ lý AI hỗ trợ tra cứu thông tin cựu sinh viên.',
      },
    ],
  },
  privacy: {
    title: 'Chính sách quyền riêng tư',
    subtitle: 'Cam kết bảo vệ dữ liệu cá nhân và thông tin học tập của thành viên cộng đồng FPTU.',
    icon: ShieldCheck,
    sections: [
      {
        heading: 'Xác thực & Quản lý tài khoản',
        body: 'Tài khoản sinh viên và giảng viên sử dụng email miền @fpt.edu.vn / @fe.edu.vn hoặc Google SSO hợp lệ. Cựu sinh viên có thể gửi minh chứng tốt nghiệp để được Admin xác thực huy hiệu Verified Alumni.',
      },
      {
        heading: 'Quyền kiểm soát hiển thị',
        body: 'Bạn có thể cập nhật hồ sơ cá nhân, quản lý trạng thái sẵn sàng cố vấn, và chặn tài khoản gây phiền nhiễu trong mục Cài đặt hồ sơ bất kỳ lúc nào.',
      },
    ],
  },
  guidelines: {
    title: 'Quy tắc cộng đồng FPT Alumni',
    subtitle: 'Chuẩn mực ứng xử nhằm xây dựng diễn đàn văn minh, tôn trọng và hữu ích.',
    icon: BookOpen,
    sections: [
      {
        heading: '1. Tôn trọng & Xây dựng',
        body: 'Trao đổi trên tinh thần hỗ trợ lẫn nhau, không đăng tải nội dung xúc phạm, phân biệt đối xử, spam hoặc thông tin sai lệch.',
      },
      {
        heading: '2. Minh bạch thông tin tuyển dụng',
        body: 'Các bài đăng tuyển dụng, thực tập hoặc học bổng cần ghi rõ tên đơn vị, yêu cầu công việc, campus/địa điểm và kênh liên hệ chính thức.',
      },
      {
        heading: '3. Báo cáo vi phạm',
        body: 'Thành viên có thể sử dụng tính năng Báo cáo trên mỗi bài viết để đội ngũ Moderator và Admin kiểm duyệt và xử lý kịp thời.',
      },
    ],
  },
}

interface InfoPageProps {
  type: InfoPageType
}

export const InfoPage: FC<InfoPageProps> = ({ type }) => {
  const data = INFO_CONTENT[type]
  const Icon = data.icon

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          to={ROUTES.ROOT}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Link>

        <Card className="border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-start gap-4 border-b border-slate-100 pb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{data.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{data.subtitle}</p>
            </div>
          </div>

          <div className="space-y-5">
            {data.sections.map((section) => (
              <div key={section.heading} className="space-y-1.5">
                <h2 className="text-base font-bold text-slate-800">{section.heading}</h2>
                <p className="text-sm leading-relaxed text-slate-600">{section.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
