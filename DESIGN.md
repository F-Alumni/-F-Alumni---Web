# Alumni Community Design System (FPT Brand)

## Project Overview
Alumni Connect is a modern university Alumni Community platform connecting current students with verified alumni for mentorship, career experiences, and community building, deeply integrating the FPT University identity.

## Core Identity
- **Vibe:** Dynamic, innovative, trustworthy, professional, inheriting the core values of FPT.
- **Backgrounds:** Clean white (#FFFFFF) and light-gray (#F8FAFC) foundation.
- **Shapes:** Rounded cards, medium border radius (12px / 0.75rem), soft modern drop shadows.
- **Typography:** Modern sans-serif (Inter or similar). Legible, clear hierarchy, accessible contrast.

## Colors (Extracted from FPT Logo)
- **Primary Brand (FPT Orange):** #F27024. Used for primary calls-to-action, active states, active tab highlights, and energetic brand moments.
- **Secondary Brand (FPT Blue):** #0066B2. Used for headers, primary navigation, trustworthy structural elements, and secondary actions.
- **Accent (FPT Green):** #0DB04B. Used for success states, verified alumni badges, online indicators, and positive growth metrics.
- **Neutral:** Slate grays for standard typography (#64748B for muted text, #0F172A for dark text) and borders (#E2E8F0).

## Components

### Typography Hierarchy
- H1: 24px/32px, Bold, Slate 900. Used for page titles.
- H2: 20px/28px, Bold, Slate 900. Used for section headers.
- H3: 16px/24px, Semi-Bold, Slate 900. Used for card titles.
- Body: 14px/20px, Regular, Slate 700. Used for post content and general text.
- Small: 12px/16px, Medium, Slate 500. Used for timestamps and metadata.

### Buttons
- **Primary:** Solid FPT Orange background, white text, soft shadow, darker orange on hover.
- **Secondary:** Solid FPT Blue background or outline, white or blue text.
- **Ghost:** Transparent background, slate text, light gray background on hover.
- **Sizes:** Small (32px height), Medium (36px height), Large (40px height). All with medium border radius (8px - 12px).

### Inputs & Dropdowns
- **Inputs:** Light gray background (#F1F5F9) or white with a subtle border (#E2E8F0). On focus, ring with FPT Orange. Placeholder text is slate-400.
- **Dropdowns:** White background, soft shadow, distinct hover states for options.
- **Search Bar:** Pill-shaped (fully rounded) with a search icon on the left, used in the Navbar.

### Navigation
- **Navbar:** Sticky top bar, white background, subtle bottom border. Contains logo, global search, and right-aligned action icons (Messages, Notifications) and User Avatar.
- **Sidebar (Left):** Navigational links with Lucide icons. Active state has a light orange/blue background and bold text.
- **Tabs:** Horizontal lists. Active tab has a solid FPT Orange bottom border or pill background. Inactive tabs are muted text.

### Cards & Layouts
- **Cards:** White background, 1px slate-200 border, no shadow or very soft shadow. 12px border radius. Padding 16px to 24px.
- **Post Components:**
  - Header: Author Avatar, Name (bold), Verified Badge (FPT Green), Role, Timestamp (muted).
  - Body: Clear text, optional attached media (images in a rounded grid) or attached link cards (Mentorship, Job Referral).
  - Footer (Actions): Like, Comment, Save, Share buttons. Subtle hover backgrounds.
- **Job/Scholarship Cards:** Compact cards. Include a badge for type (e.g., "100% Funded", "New"), title, organization, and deadline.
- **Alumni Profile Cards:** Avatar, Name, Verified Badge, Current Role, Major, and an action button ("Connect" or "Accepting Mentees").

### Data Display
- **Avatars:** Circular. Sizes: Small (24px), Medium (32px), Large (48px). Online indicator is a small FPT Green circle at the bottom right.
- **Badges/Tags:** Pill-shaped (fully rounded). Small text (10px - 12px), bold.
  - Verified: FPT Green background/text.
  - New/Urgent: FPT Blue or Orange background/text.
- **Tables:** Clean lines, left-aligned text, light gray header background, subtle borders between rows.

### Feedback States
- **Toast Notifications:** Floating at the bottom/top right. Colored borders indicating success (FPT Green), error (red), or info (FPT Blue).
- **Modals:** Centered overlay with a dark translucent backdrop. White card, clear close button, distinct primary action.
- **Empty States:** Centered illustration or icon, muted text explaining why it's empty, and a clear call-to-action button.
- **Loading States:** Skeleton loaders matching the shape of the content (circles for avatars, rectangles for text/images) with a subtle pulsing animation.
