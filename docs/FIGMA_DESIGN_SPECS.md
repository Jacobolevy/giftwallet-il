# GiftWallet IL - Figma Design Specifications

Complete design system and screen specifications for Figma mockups.

---

## 🎨 Design System Setup

### 1. Color Styles

Create these color styles in Figma:

**Primary Colors**
- `Primary/Blue` - #2563EB
- `Primary/Dark` - #1E40AF
- `Primary/Light` - #60A5FA
- `Primary/Lightest` - #DBEAFE

**Status Colors**
- `Status/Green` - #10B981 (Active, >30 days)
- `Status/Yellow` - #F59E0B (Warning, 8-30 days)
- `Status/Red` - #EF4444 (Urgent, 0-7 days)
- `Status/Gray` - #6B7280 (Used/Expired)

**Neutral Colors**
- `Neutral/Background` - #F9FAFB
- `Neutral/Surface` - #FFFFFF
- `Neutral/Border` - #E5E7EB
- `Neutral/Divider` - #F3F4F6

**Text Colors**
- `Text/Primary` - #111827
- `Text/Secondary` - #6B7280
- `Text/Disabled` - #9CA3AF
- `Text/Inverse` - #FFFFFF

**Issuer Brand Colors**
- `Issuer/BuyMe` - #FF6B35
- `Issuer/Max` - #E31E24
- `Issuer/Dreamcard` - #7B2CBF
- `Issuer/TavTzahov` - #FFD700
- `Issuer/Other` - #6B7280

**Gradients** (Save as styles)
- `Gradient/Primary` - Linear, #2563EB to #1E40AF (135°)
- `Gradient/Success` - Linear, #10B981 to #059669 (135°)
- `Gradient/Warning` - Linear, #F59E0B to #D97706 (135°)
- `Gradient/Danger` - Linear, #EF4444 to #DC2626 (135°)

### 2. Typography Styles

**Font: Rubik** (for Hebrew support) and **Inter** (for English)

Create text styles:
- `Display/Large` - 32px, Bold, -0.5px
- `H1/Page Title` - 28px, Bold, -0.3px
- `H2/Section` - 24px, Semibold, -0.2px
- `H3/Card Title` - 20px, Semibold, 0px
- `Body/Large` - 18px, Regular, 0px
- `Body/Regular` - 16px, Regular, 0px
- `Body/Small` - 14px, Regular, 0px
- `Caption` - 12px, Regular, 0px
- `Overline` - 11px, Medium, 1px, ALL CAPS

**Line Heights:**
- Display: 120% (38.4px)
- Headers: 130% (varies)
- Body: 150% (varies)
- Caption: 140% (16.8px)

### 3. Effect Styles (Shadows)

- `Shadow/SM` - Y:1, Blur:2, #00000014 (5%)
- `Shadow/MD` - Y:4, Blur:6, #00000017 (7%)
- `Shadow/LG` - Y:10, Blur:15, #0000001A (10%)
- `Shadow/XL` - Y:20, Blur:25, #00000026 (15%)
- `Shadow/Card-Hover` - Y:12, Blur:20, #00000020 (12%)

### 4. Grid & Layout System

**Mobile (375px - 640px)**
- Columns: 4
- Gutter: 16px
- Margin: 16px

**Tablet (768px - 1024px)**
- Columns: 8
- Gutter: 24px
- Margin: 32px

**Desktop (1280px+)**
- Columns: 12
- Gutter: 32px
- Margin: 64px

**Spacing Scale (8px base):**
- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

### 5. Component Library Structure

Create these component sets in Figma:

```
📁 GiftWallet Components
├── 🎴 Cards
│   ├── Gift Card (variants: Active/Used/Expired, Green/Yellow/Red)
│   ├── Summary Card
│   ├── Issuer Card (for selection)
│   └── Statistics Card
├── 🔘 Buttons
│   ├── Primary (variants: Default/Hover/Pressed/Disabled)
│   ├── Secondary
│   ├── Ghost
│   ├── Danger
│   └── FAB (Floating Action Button)
├── 📝 Inputs
│   ├── Text Input (variants: Default/Focus/Error/Disabled)
│   ├── Textarea
│   ├── Dropdown/Select
│   ├── Date Picker
│   ├── Number Input (with ₪ symbol)
│   └── File Upload
├── 🏷️ Badges & Tags
│   ├── Status Badge (variants: Active/Used/Expired)
│   ├── Chip (filters)
│   └── Count Badge (for notifications)
├── 🔔 Notifications
│   ├── Toast (Success/Error/Info/Warning)
│   ├── Alert Banner
│   └── Empty State
├── 🗂️ Navigation
│   ├── Bottom Navigation (3 items)
│   ├── Top App Bar
│   └── Tabs
├── 📊 Data Display
│   ├── Progress Bar (horizontal)
│   ├── Progress Circle
│   ├── Timeline Item
│   └── Stats Block
└── 🎭 Overlays
    ├── Modal
    ├── Bottom Sheet
    ├── Confirmation Dialog
    └── Loading Skeleton
```

---

## 📱 Screen Designs

### Screen 1: Splash/Loading Screen
**Artboard:** 375×812 (iPhone 13 Pro)

**Layout:**
- Full-screen gradient background (Primary gradient)
- App icon (128×128) centered
- App name "GiftWallet IL" below icon
  - English: H1 style, white
  - Hebrew: "GiftWallet IL | ארנק המתנות"
- Tagline: "Manage all your gift cards in one place"
- Loading indicator at bottom (60px from bottom)
- Version number at very bottom

**Assets needed:**
- App icon (square, rounded corners 22%)
- Gradient background

---

### Screen 2: Sign Up
**Artboard:** 375×812

**Header:**
- "Create Account" / "צור חשבון" - H1, left-aligned (or right for Hebrew)
- Back button (←) top-left
- "Already have an account? Log in" link at top-right

**Form (vertically scrollable):**
- Email input
  - Label: "Email" / "אימייל"
  - Placeholder: "your@email.com"
  - Icon: @ symbol (left-aligned, right for Hebrew)
  
- Password input
  - Label: "Password" / "סיסמה"
  - Show/Hide toggle (eye icon)
  - Password strength indicator below (progress bar: weak/medium/strong)
  
- Confirm Password input
  - Label: "Confirm Password" / "אימות סיסמה"
  
- Name input (optional tag)
  - Label: "Name (Optional)" / "שם (אופציונלי)"
  - Placeholder: "John Doe" / "ישראל ישראלי"
  
- Phone input (optional tag)
  - Label: "Phone (Optional)" / "טלפון (אופציונלי)"
  - Placeholder: "050-1234567"
  - Country flag: 🇮🇱 (prefix)

- Language toggle
  - Label: "Preferred Language" / "שפה מועדפת"
  - Segmented control: English | עברית

**Buttons:**
- Primary button: "Create Account" / "צור חשבון"
- Link: "By signing up, you agree to our Terms of Service and Privacy Policy"

**Spacing:**
- 24px between form sections
- 16px between input fields
- 32px above button

---

### Screen 3: Login
**Artboard:** 375×812

**Header:**
- "Welcome Back" / "ברוך שובך" - H1
- Subtitle: "Sign in to your account" / "התחבר לחשבון שלך"

**Form:**
- Email input
- Password input
- "Remember me" checkbox with label
- "Forgot Password?" link (right-aligned, left for Hebrew)

**Button:**
- Primary button: "Log In" / "התחבר"
- Divider with "OR"
- Social login buttons (outlined):
  - "Continue with Google" (Google icon)
  - "Continue with Apple" (Apple icon)

**Footer:**
- "Don't have an account? Sign up" link centered

---

### Screen 4: My Wallet (Home) - Empty State
**Artboard:** 375×812

**Top App Bar:**
- Title: "My Wallet" / "הארנק שלי"
- Notification bell icon (top-right)
- Menu icon (top-left)

**Content:**
- Large illustration (empty wallet/gift box)
- Heading: "No gift cards yet" / "אין כרטיסי מתנה עדיין"
- Body text: "Ready to organize your cards?" / "מוכן לארגן את הכרטיסים שלך?"
- Subtext: "Tap the + button to add your first card" / "לחץ על + כדי להוסיף את הכרטיס הראשון"

**Navigation:**
- Bottom navigation bar:
  - Home icon (active state)
  - Plus icon (center, elevated)
  - Profile icon

**FAB:**
- Floating action button (+ icon) in bottom-right corner
- 56×56, Primary color, shadow-lg
- 16px from bottom, 16px from right

---

### Screen 5: My Wallet (Home) - With Cards
**Artboard:** 375×812

**Top App Bar:**
- Same as empty state
- Add filter icon (funnel) next to notification bell

**Summary Card (below app bar):**
- Gradient background (Primary)
- Large value: "₪4,250" - Display/Large, white
- Label: "Total Active Value" / "ערך כולל פעיל"
- Two stat blocks below (horizontal):
  - "18 Active Cards" / "18 כרטיסים פעילים"
  - "5 Expiring Soon" / "5 פג תוקף בקרוב"
- Border radius: 16px (top only)
- Shadow: MD

**Quick Actions Row (below summary):**
- Three button chips (horizontal scroll):
  - "⚡ Quick Update" / "עדכון מהיר"
  - "📊 Statistics" / "סטטיסטיקה"
  - "🔔 Expiring (5)" / "פג תוקף (5)"
- Each chip: outlined, icon + text

**Filter/Sort Bar:**
- Chip filters (horizontal scroll):
  - "All" (selected state)
  - "Active"
  - "Expiring Soon"
  - "Expired"
  - "Used"
- Sort dropdown button (right side): "Sort: Expiry ↓"

**Card List (vertical scroll):**
- Gift card components stacked with 12px gap
- Each card shows:
  - Gradient background (issuer brand color)
  - Issuer logo (top-left, 32×32)
  - Card label (top, white text)
  - Last 4: "•••• 1234" (small, white, opacity 70%)
  - Progress bar (value used) - white with opacity
  - Current value: "₪380" (large, white, bold)
  - Expiry: "Mar 15 • 67 days left" with status dot (green/yellow/red)
  - Status badge: "Active" / "פעיל" (top-right corner)
  - Shadow on hover: Card-Hover

**Bottom Navigation:**
- Home (active), Add, Profile

**Measurements:**
- Summary card height: 160px
- Quick actions height: 44px
- Filter bar height: 48px
- Gift card height: 140px
- Card border radius: 12px

---

### Screen 6: Gift Card Component (Detailed)
**Component:** 343×140 (card width = screen width - 32px margin)

**States:**
1. Active - Green dot
2. Warning - Yellow dot  
3. Urgent - Red dot (pulsing animation)
4. Expired - Gray, no gradient
5. Used - Gray, no gradient

**Layers:**
1. Background (auto-layout, fill width)
   - Gradient fill (issuer brand color to darker shade)
   - Border radius: 12px
   - Shadow: MD
   
2. Issuer Logo (absolute position)
   - Top: 12px, Left: 12px
   - Size: 32×32
   - Border radius: 8px
   - Background: white with 20% opacity
   
3. Status Badge (absolute position)
   - Top: 12px, Right: 12px
   - Padding: 4px 12px
   - Border radius: full
   - Background: white with 20% opacity
   - Text: "Active" (12px, semibold, white)
   
4. Status Dot (absolute position)
   - Bottom-right of status badge
   - Size: 8×8
   - Fill: Green/Yellow/Red
   - Border: 2px white
   - Animation: pulse (for red only)

5. Card Content (auto-layout vertical)
   - Padding: 16px
   - Spacing: 8px
   
   - Label text
     - Font: H3 style
     - Color: White
     - Max lines: 1, ellipsis
   
   - Last 4
     - Font: Caption
     - Color: White, 70% opacity
     - Text: "•••• 1234"
   
   - Spacer (auto)
   
   - Progress Bar
     - Width: 100%
     - Height: 4px
     - Background: white, 20% opacity
     - Fill: white, 80% opacity
     - Border radius: full
     - Value: (value_current / value_initial) × 100%
   
   - Bottom Row (horizontal auto-layout)
     - Value (left)
       - Font: Display/Large (24px)
       - Color: White
       - Text: "₪380"
     
     - Expiry (right)
       - Auto-layout vertical, right-aligned
       - Date: "Mar 15, 2026"
         - Font: Body/Small
         - Color: White, 90% opacity
       - Countdown: "67 days left"
         - Font: Caption
         - Color: White, 70% opacity

**Interactive States:**
- Default: Shadow-MD
- Hover: Shadow-Card-Hover, scale 1.02 (200ms ease)
- Pressed: scale 0.98 (100ms ease)

---

### Screen 7: Add Card - Step 1
**Artboard:** 375×812

**Top App Bar:**
- Back button (←)
- Title: "Add Gift Card" / "הוסף כרטיס מתנה"
- Close button (×) - right side

**Progress Indicator:**
- Stepper component
- Step 1 of 2 (active)
- Labels: "Card Info" | "Value & Expiry"
- Progress bar: 50% filled (Primary color)

**Content (scrollable):**
- Section title: "Select Issuer" / "בחר מנפיק"
  
- Issuer Grid (2 columns):
  - Each issuer card:
    - Size: 158×120 (with 12px gap = 343px total)
    - Background: Surface
    - Border: 2px Neutral/Border
    - Border radius: 12px
    - Centered content:
      - Logo: 48×48
      - Name: Body/Regular
    - Selected state:
      - Border: 2px Primary/Blue
      - Background: Primary/Lightest
      - Checkmark badge (top-right): Primary circle, white check
  
  - Issuers:
    - BuyMe (logo + "ביי-מי")
    - Max (logo + "מקס")
    - Dreamcard (logo + "דרימקארד")
    - Tav Tzahav (logo + "תו זהב")
    - Other (generic gift icon + "אחר")

- Divider (1px, 32px margin top/bottom)

- Section title: "Card Details" / "פרטי כרטיס"

- Card Label input
  - Label: "Card Label" / "תווית כרטיס"
  - Placeholder: "e.g., Birthday Gift - Azrieli"
  - Helper text: "Give your card a memorable name"
  - Character counter: "0 / 50"

- Card Number section
  - Tabs (segmented control):
    - "Full Code" / "קוד מלא"
    - "Last 4 Only" / "4 ספרות אחרונות"
  
  - If "Full Code" selected:
    - Text input (password style)
    - Show/Hide toggle
    - Auto-format: XXXX XXXX XXXX XXXX
    - Helper: "We'll encrypt this for security"
  
  - If "Last 4 Only":
    - Number input (4 digits)
    - Placeholder: "1234"

**Bottom Buttons:**
- Secondary: "Cancel" / "ביטול" (left)
- Primary: "Next →" / "הבא ←" (right)
- Spacing: 12px between

---

### Screen 8: Add Card - Step 2
**Artboard:** 375×812

**Top App Bar & Progress:**
- Same as Step 1
- Progress: Step 2 of 2 (active)
- Progress bar: 100%

**Content (scrollable):**
- Section title: "Value & Expiry" / "ערך ותוקף"

- Initial Value input
  - Label: "Initial Value" / "ערך התחלתי"
  - Number input with ₪ prefix
  - Quick amount chips below:
    - ₪100 | ₪200 | ₪500 | ₪1000
    - Tapping chip fills the input

- Current Value input
  - Label: "Current Value" / "ערך נוכחי"
  - Number input with ₪ prefix
  - Checkbox below: "Same as initial value"
  - If checked, input is disabled and auto-filled

- Expiry Date input
  - Label: "Expiry Date" / "תאריך תפוגה"
  - Date picker input (calendar icon)
  - Warning message (yellow background) if < 30 days:
    - "⚠️ This card expires soon!"
    - "This card expires in less than 30 days"

- Divider

- Section title: "Additional Info (Optional)" / "מידע נוסף (אופציונלי)"

- Notes textarea
  - Label: "Notes" / "הערות"
  - Placeholder: "Where can you use it? Any restrictions?"
  - Height: 80px
  - Character counter: "0 / 500"

- Photo Upload
  - Label: "Card Photo" / "תמונת כרטיס"
  - Drag-and-drop zone:
    - Dashed border (Primary color)
    - Border radius: 12px
    - Height: 120px
    - Centered content:
      - Upload icon (📷)
      - Text: "Tap to upload or drag image here"
      - Subtext: "JPG, PNG or WEBP. Max 5MB"
  - After upload:
    - Show image preview (120×120, cover fit)
    - Delete button (×) in top-right corner
    - Edit button (pencil icon)

**Bottom Buttons:**
- Ghost: "← Back" / "חזור ←" (left)
- Primary: "Save Card" / "שמור כרטיס" (right)

**Success State (After Save):**
- Modal/Bottom sheet with:
  - Success icon (green checkmark with circle animation)
  - Title: "Card Added! 🎉" / "!הכרטיס נוסף 🎉"
  - Message: "Your card has been saved. 2 reminders scheduled."
  - Preview of the card (small version)
  - Two buttons:
    - Secondary: "Add Another" / "הוסף עוד"
    - Primary: "Go to Wallet" / "לך לארנק"

---

### Screen 9: Card Details
**Artboard:** 375×812

**Top App Bar:**
- Back button
- Title: Card label (truncated)
- More menu (⋮) with options:
  - Edit
  - Duplicate
  - Share
  - Delete

**Hero Card:**
- Large version of gift card (343×180)
- Same design as wallet view
- Centered horizontally
- 16px from top of content area

**Quick Actions Bar:**
- 4 rounded square buttons in horizontal scroll:
  1. 💰 "Update Balance"
  2. ✅ "Mark Used"
  3. 🔗 "Visit Website"
  4. ⚙️ "Edit Details"
- Each button: 80×80
- Icon (32×32) above text (Caption)
- Background: Surface
- Border: 1px Neutral/Border
- Border radius: 12px
- Spacing: 8px gap

**Information Sections:**
- Each section is a card (Surface background, Shadow-SM, Border radius 12px)

**Section 1: Card Information**
- Expandable (accordion style)
- Header: "Card Information" / "מידע על כרטיס"
  - Info icon (i) with label
  - Expand/collapse arrow (←/↓)
- Content rows (when expanded):
  - Issuer: "BuyMe" with logo (32×32)
  - Label: "Birthday Gift" (editable inline - pencil icon)
  - Full Code:
    - Masked: "•••• •••• •••• 1234"
    - Buttons:
      - "Show" (eye icon) - requires confirmation dialog
      - "Copy" (clipboard icon) - shows "Copied!" toast
  - Last 4: "1234"
  - Status: Badge component (Active - green)

**Section 2: Balance & Value**
- Header: "Balance & Value"
- Large value display:
  - Current: "₪380" (Display/Large, Primary color)
  - Edit button (inline, pencil icon)
- Progress visualization:
  - Circular progress (120×120, centered)
  - Shows percentage used: 24%
  - Label: "76% Remaining"
- Stats grid (2×2):
  - Initial Value: "₪500"
  - Value Used: "₪120"
  - Usage Rate: "24%"
  - Last Updated: "Jan 5, 14:30"
- Quick adjust buttons:
  - "-₪50" | "-₪100" | "-₪200"
  - Each button updates balance instantly

**Section 3: Expiry & Reminders**
- Header: "Expiry & Reminders"
- Large countdown circle (progress ring):
  - Center text: "67 DAYS"
  - Ring color: Green/Yellow/Red based on status
  - 120×120 size
- Expiry date: "March 15, 2026"
- Timeline of reminders:
  - 30-day reminder: 
    - Date: "Feb 13, 2026"
    - Status: "⏰ Pending" or "✅ Sent on Feb 13"
  - 7-day reminder:
    - Date: "Mar 8, 2026"
    - Status: "⏰ Pending"

**Section 4: Balance History**
- Header: "Balance History" with "View All" link
- Timeline view (last 5 entries):
  - Each entry:
    - Date (left): "Jan 7, 12:30"
    - Amount change (center): "-₪50" (red) or "+₪50" (green)
    - New balance (right): "₪380"
    - Note below: "Lunch at Azrieli"
    - Vertical line connecting entries (dotted)
    - Icon for change type (🛍️ purchase, ↻ refund, ✏️ manual)

**Section 5: Notes & Photo**
- Header: "Notes & Photo"
- Notes text (editable):
  - Current notes or empty state: "Tap to add notes"
  - Edit button (pencil)
- Card photo (if exists):
  - Full width image, 16:9 ratio
  - Border radius: 8px
  - Tap to view full screen
  - Edit/Remove buttons overlay

**Section 6: Issuer Info**
- Header: "About BuyMe"
- Logo: 64×64
- Website: Link button with external icon
- Support: Phone number as link
- "Check Balance Online" button (Primary, outlined)

**Bottom Danger Zone:**
- Delete button (full width, Danger color)
- "Delete this card" with trash icon
- Requires confirmation dialog:
  - Title: "Delete Card?"
  - Message: "This action cannot be undone. All reminders will also be deleted."
  - Buttons: "Cancel" | "Delete" (Danger)

**Spacing:**
- 16px between sections
- 16px padding within sections
- 24px padding on sides

---

### Screen 10: Quick Balance Update (Bottom Sheet)
**Component:** 375×600 (bottom sheet)

**Handle:**
- Drag handle at top (centered)
- 32×4, Border radius full, Neutral/Border color

**Header:**
- Title: "Update Balance" / "עדכן יתרה"
- Close button (×)
- Mini card preview:
  - 160×80 size
  - Shows: logo, label, current balance
  - Centered

**Tab Bar:**
- 3 tabs (full width, equal):
  1. "Quick Deduct" / "קיזוז מהיר"
  2. "Set Balance" / "קבע יתרה"
  3. "Transaction" / "טרנזקציה"
- Selected tab has underline (Primary, 2px)

**Tab 1: Quick Deduct**
- Label: "I just spent:" / "בדיוק הוצאתי:"
- Number input with ₪ prefix (large, 48px height)
- Quick amount chips (horizontal):
  - ₪20 | ₪50 | ₪100 | ₪150 | ₪200
- Preview calculation:
  - Background: Primary/Lightest
  - Border radius: 8px
  - Padding: 12px
  - Text: "₪380 - ₪50 = ₪330"
  - "New balance will be: ₪330"

**Tab 2: Set Balance**
- Label: "New balance:" / "יתרה חדשה:"
- Number input with ₪ prefix
- Preview:
  - Shows current: "₪380"
  - Arrow (→)
  - Shows new: "₪330"
  - Change: "-₪50" (red text if negative, green if positive)

**Tab 3: Transaction**
- Form fields:
  - Amount spent: Number input with ₪
  - Store/Location: Text input
    - Placeholder: "e.g., Azrieli Mall"
  - Date: Date picker (default: today)
  - Notes: Textarea (80px height)
    - Placeholder: "Optional notes about this purchase"
- This creates detailed BalanceHistory entry

**Bottom Actions:**
- Two buttons (full width, stacked, 12px gap):
  - Primary: "Update Balance" / "עדכן יתרה"
    - Loading state: spinner + "Updating..."
  - Ghost: "Cancel" / "ביטול"

**Success Animation:**
- After update, show:
  - Checkmark animation (green)
  - New balance (large, animated count-up)
  - Auto-dismiss after 1.5s

---

### Screen 11: Profile / Settings
**Artboard:** 375×812

**Top App Bar:**
- Title: "Profile" / "פרופיל"
- Edit button (pencil icon) - toggles edit mode

**Profile Card:**
- Background: Gradient (Primary)
- Height: 200px
- Border radius: 16px (top only)
- Content (centered):
  - Avatar (96×96, circular)
    - Placeholder: User initials or icon
    - Edit button (camera icon) overlay
  - Name: H2 style, white
    - Editable in edit mode
  - Email: Body/Small, white 80% opacity
  - Member since: Caption, white 70%
  - "Jan 1, 2026 • 7 days"

**Sections:**

**Section 1: Account Settings**
- List items:
  - Name
    - Value: "John Doe"
    - Edit icon (→)
  - Email
    - Value: "john@example.com"
    - Badge: "Verified" (green)
  - Phone
    - Value: "050-1234567"
    - Edit icon
  - Password
    - Value: "••••••••"
    - "Change" button

**Section 2: Language & Display**
- Language toggle:
  - Label: "Language / שפה"
  - Segmented control: "English | עברית"
  - Icon changes immediately
- Theme (future):
  - Label: "Theme"
  - Options: Light | Dark | Auto
  - Currently Light only

**Section 3: Notifications**
- Header with bell icon
- Toggle switches:
  - Email Notifications
    - Subtext: "Receive expiry reminders by email"
    - Toggle: ON/OFF
  - Push Notifications
    - Subtext: "Get instant alerts"
    - Toggle: ON/OFF
    - If OFF, show: "Enable in browser settings"
- Reminder Timing:
  - Subtext: "When should we remind you?"
  - Checkboxes:
    - ☑ 30 days before
    - ☑ 7 days before
    - ☐ 3 days before
    - ☐ 1 day before

**Section 4: Statistics**
- Background: Surface, Shadow-SM
- Border radius: 12px
- Grid (2×2) of stat blocks:
  - Total Cards: "25"
  - Total Value: "₪12,500"
  - Cards Expired: "3"
  - Cards Used: "4"
- Button: "View Detailed Statistics →"

**Section 5: Data Management**
- List items:
  - Export My Data
    - Icon: ⬇️
    - Subtext: "Download as JSON or CSV"
  - Delete Old Cards
    - Icon: 🗑️
    - Subtext: "Remove expired/used cards"
    - Opens dialog with dropdown: "Older than: [3/6/12 months]"

**Section 6: About**
- Background: Neutral/Background
- Border: 1px Neutral/Border
- Border radius: 12px
- Padding: 16px
- Content:
  - App name: "GiftWallet IL"
  - Version: "v1.0.0"
  - Links (list items):
    - "Terms of Service" (external link icon)
    - "Privacy Policy" (external link icon)
    - "Contact Support" (email icon)
    - "Rate this App" (star icon)
  - Social links (horizontal icons):
    - Facebook | Instagram | Twitter
  - Made with ❤️ in Israel

**Bottom Button:**
- Danger: "Log Out" / "התנתק"
- Full width, outlined style
- Confirmation dialog before logout

**Danger Zone (collapsible):**
- "Delete Account" - Red text
- Confirmation: Multi-step dialog requiring email confirmation

---

### Screen 12: Statistics Dashboard
**Artboard:** 375×812

**Top App Bar:**
- Back button
- Title: "Statistics" / "סטטיסטיקות"
- Date range selector (top-right): "All Time ▼"

**Summary Cards Row (horizontal scroll):**
- 4 mini cards (120×80 each, 12px gap):
  1. Total Cards
     - Icon: 🎴
     - Value: "25"
     - Background: Primary/Lightest
  2. Total Value
     - Icon: 💰
     - Value: "₪12,500"
     - Background: Status/Green opacity 10%
  3. Expired Value
     - Icon: ⚠️
     - Value: "₪850"
     - Background: Status/Red opacity 10%
  4. Used Cards
     - Icon: ✅
     - Value: "8"
     - Background: Status/Gray opacity 10%

**Section 1: Value Distribution**
- Header: "Value by Status" / "ערך לפי סטטוס"
- Donut Chart (200×200, centered):
  - Segments:
    - Active: Green (80%)
    - Expiring Soon: Yellow (12%)
    - Expired: Red (5%)
    - Used: Gray (3%)
  - Center text: "₪12,500" (total)
- Legend below chart (horizontal):
  - Color dot + label + value for each

**Section 2: Cards by Issuer**
- Header: "Cards by Issuer" / "כרטיסים לפי מנפיק"
- Horizontal bar chart:
  - Each bar:
    - Issuer logo (24×24)
    - Issuer name
    - Bar (filled with issuer brand color)
    - Count + value: "8 cards • ₪3,200"
  - Bars sorted by value (descending)

**Section 3: Monthly Activity**
- Header: "Activity This Year" / "פעילות השנה"
- Line chart (full width, 180px height):
  - X-axis: Months (Jan-Dec)
  - Y-axis: Value (₪)
  - Two lines:
    - Blue: Cards Added
    - Green: Value Used
  - Tap point to show tooltip

**Section 4: Expiry Timeline**
- Header: "Upcoming Expirations" / "תפוגות קרובות"
- Calendar heat map or timeline:
  - Next 90 days view
  - Color intensity = number of cards expiring
  - Tap day to see cards

**Section 5: Top Cards by Value**
- Header: "Highest Value Cards" / "כרטיסים בעלי הערך הגבוה ביותר"
- List (top 5):
  - Mini card preview (60×40)
  - Card label
  - Current value: "₪500"
  - Issuer badge

**Export Button (bottom):**
- Secondary button: "Export Report (PDF)" / "ייצא דוח (PDF)"
- Full width

---

### Screen 13: Edit Card
**Artboard:** 375×812

**Top App Bar:**
- Close button (×) - left
- Title: "Edit Card" / "ערוך כרטיס"
- Save button (checkmark) - right, Primary color

**Content (scrollable):**
Same structure as Add Card screens but with:
- Pre-filled values from existing card
- Issuer selector disabled (grayed out with lock icon)
- All other fields editable
- "Last updated: Jan 5, 2026 at 14:30"

**Changes Indicator:**
- Yellow badge at top: "Unsaved changes" / "שינויים לא שמורים"
- Shows only when form is dirty

**Photo Section:**
- If photo exists: Show preview with Edit/Remove
- If no photo: Show upload zone

**Bottom Buttons:**
- Ghost: "Cancel" / "ביטול"
- Primary: "Save Changes" / "שמור שינויים"

**Validation:**
- Inline errors for invalid fields
- "Save" button disabled if validation fails

---

### Screen 14: Forgot Password
**Artboard:** 375×812

**Header:**
- Back button (←)
- Title: "Reset Password" / "איפוס סיסמה"

**Illustration:**
- Lock with key icon (80×80)
- Centered

**Content:**
- Body text: "Enter your email address and we'll send you instructions to reset your password."
- Hebrew: "הכנס את כתובת האימייל שלך ונשלח לך הוראות לאיפוס הסיסמה."

**Form:**
- Email input
  - Label: "Email" / "אימייל"
  - Placeholder: "your@email.com"

**Button:**
- Primary: "Send Reset Link" / "שלח קישור איפוס"

**States:**

**Success State:**
- Checkmark animation
- Title: "Email Sent! ✉️" / "!האימייל נשלח ✉️"
- Message: "Check your inbox for password reset instructions."
- "Back to Login" link

**Error State:**
- Shake animation on input
- Error message: "No account found with this email"

---

### Screen 15: Reset Password (from email link)
**Artboard:** 375×812

**Header:**
- Title: "Create New Password" / "צור סיסמה חדשה"

**Form:**
- New Password input
  - Show/Hide toggle
  - Password strength indicator
  - Requirements list:
    - ✓/✗ At least 8 characters
    - ✓/✗ One uppercase letter
    - ✓/✗ One number
    - ✓/✗ One special character
- Confirm Password input
  - Match indicator

**Button:**
- Primary: "Reset Password" / "אפס סיסמה"

**Success State:**
- Checkmark animation
- Title: "Password Reset! 🎉"
- Message: "Your password has been changed successfully."
- Primary button: "Login Now" / "התחבר עכשיו"

---

### Screen 16: Notifications Center
**Artboard:** 375×812

**Top App Bar:**
- Back button
- Title: "Notifications" / "התראות"
- "Mark All Read" link (right)

**Tabs:**
- "All" | "Unread" | "Reminders"
- Underline indicator (Primary)

**Notification List:**
- Grouped by date: "Today", "Yesterday", "This Week"

**Notification Item:**
- Size: Full width × 80px
- Content:
  - Icon (40×40, circular):
    - 🔔 Yellow for reminders
    - ✅ Green for success
    - ℹ️ Blue for info
  - Title (Body/Regular, semibold)
    - "Card Expiring Soon!"
  - Message (Body/Small, Text/Secondary)
    - "Birthday Gift expires in 7 days"
  - Timestamp (Caption, right-aligned)
    - "2h ago"
  - Unread indicator (Primary/Blue dot, 8×8)
- Swipe actions:
  - Left: Mark as read (blue)
  - Right: Delete (red)

**Empty State:**
- Bell icon with zzz
- Title: "No notifications" / "אין התראות"
- Subtitle: "You're all caught up!"

---

### Screen 17: Onboarding (First Time User)
**Artboard:** 375×812 × 4 slides

**Slide 1: Welcome**
- Full-screen gradient background (Primary)
- Large illustration: Gift cards floating
- Title: "Welcome to GiftWallet IL" / "ברוכים הבאים ל-GiftWallet IL"
- Subtitle: "Never let a gift card go to waste"
- Skip button (top-right)
- Progress dots at bottom

**Slide 2: Add Cards**
- Illustration: Phone scanning gift card
- Title: "Add Your Cards" / "הוסף את הכרטיסים שלך"
- Subtitle: "Quickly add gift cards from any issuer"
- Feature highlights (icons + text):
  - 📷 Snap a photo
  - ⌨️ Enter details manually
  - 🔒 Encrypted & secure

**Slide 3: Track Balance**
- Illustration: Wallet with progress bars
- Title: "Track Your Balance" / "עקוב אחרי היתרה"
- Subtitle: "Know exactly how much you have left"
- Feature highlights:
  - 💰 Real-time balance
  - 📊 Usage history
  - 📈 Statistics

**Slide 4: Never Forget**
- Illustration: Calendar with notifications
- Title: "Never Miss Expiry" / "אל תפספס תאריך תפוגה"
- Subtitle: "We'll remind you before cards expire"
- Feature highlights:
  - 🔔 Smart reminders
  - 📧 Email alerts
  - ⏰ Custom timing

**Final Slide Action:**
- Primary button: "Get Started" / "בוא נתחיל"
- Ghost link: "Already have an account? Login"

**Navigation:**
- Swipe between slides
- Dots indicator (4 dots)
- "Skip" always visible
- Last slide: "Get Started" replaces "Next"

---

### Screen 18: Search & Filter (Bottom Sheet)
**Component:** 375×500 (bottom sheet, expandable to full screen)

**Handle:**
- Drag handle at top

**Search Bar:**
- Text input with search icon
- Placeholder: "Search cards..." / "חפש כרטיסים..."
- Clear button (×) when has text
- Voice search icon (microphone) - optional

**Recent Searches:**
- Header: "Recent" / "חיפושים אחרונים"
- List of recent search terms
- Each has × to remove
- "Clear All" link

**Filters Section:**
- Header: "Filter" / "סינון"

**Filter: Status**
- Checkbox list:
  - ☑ Active
  - ☐ Expiring Soon
  - ☐ Expired
  - ☐ Used

**Filter: Issuer**
- Checkbox list with logos:
  - ☑ All
  - ☐ BuyMe
  - ☐ Max
  - ☐ Dreamcard
  - ☐ Tav Tzahav
  - ☐ Other

**Filter: Value Range**
- Slider (dual-handle):
  - Min: ₪0
  - Max: ₪2000
  - Current: "₪50 - ₪500"
- Or: Quick chips: "<₪100" | "₪100-500" | ">₪500"

**Filter: Expiry Date**
- Options:
  - Any time
  - Next 7 days
  - Next 30 days
  - Next 90 days
  - Custom range (date pickers)

**Sort By:**
- Radio list:
  - ○ Expiry Date (soonest first)
  - ● Expiry Date (latest first)
  - ○ Value (highest first)
  - ○ Value (lowest first)
  - ○ Recently Added
  - ○ Alphabetical

**Bottom Actions:**
- Two buttons:
  - Ghost: "Reset" / "אפס"
  - Primary: "Apply (12 results)" / "החל (12 תוצאות)"
- Results count updates live

---

### Screen 19: Share Card (Bottom Sheet)
**Component:** 375×400

**Handle:**
- Drag handle at top

**Header:**
- Title: "Share Card" / "שתף כרטיס"
- Close button

**Card Preview:**
- Mini card (160×80)
- Shows: Issuer, Label, Value

**Warning Banner (if full code):**
- Yellow background
- Icon: ⚠️
- Text: "Sharing will reveal the full card code"
- Checkbox: "I understand, continue"

**Share Options:**
- List with icons:
  1. 📤 Share Link (generates unique URL)
  2. 📋 Copy Details
  3. 📧 Send via Email
  4. 💬 WhatsApp
  5. 📱 Telegram
  6. 💾 Save as Image

**Share Link Option Details:**
- Toggle: "Include balance info"
- Toggle: "Set expiry on link" (24h, 7 days, never)
- Note: "Link can be accessed without login"

**Copy Details Format:**
```
🎁 Gift Card
Issuer: BuyMe
Value: ₪380
Code: ****1234
Expires: Mar 15, 2026
```

**Success Toast:**
- "Link copied!" or "Shared successfully!"

---

### Screen 20: Card Photo Viewer
**Artboard:** 375×812 (fullscreen overlay)

**Background:**
- Black, 95% opacity

**Top Bar:**
- Close button (×) - white
- Title: "Card Photo" / "תמונת כרטיס"
- Actions:
  - Share icon
  - Download icon
  - Edit icon

**Image:**
- Full-screen, pinch to zoom
- Swipe to dismiss
- Double-tap to zoom

**Bottom Actions (if viewing own card):**
- "Replace Photo" button
- "Remove Photo" button (danger)

**Zoom Controls:**
- Pinch to zoom gesture
- Double-tap toggles 2x zoom
- Pan when zoomed

---

## 🧩 Component Specifications

### Component: Button
**Variants:**
1. Primary
2. Secondary
3. Ghost
4. Danger
5. Link

**States:**
- Default
- Hover
- Pressed/Active
- Disabled
- Loading

**Sizes:**
- Large: 52px height, 16px padding, Body/Large
- Medium: 44px height, 12px padding, Body/Regular
- Small: 36px height, 8px padding, Body/Small

**Properties:**
- Label (text)
- Icon Left (optional)
- Icon Right (optional)
- Full Width (boolean)
- Loading (boolean)

**Specifications:**
```
Primary Button
├── Background: Primary/Blue (#2563EB)
├── Text: White
├── Border: None
├── Border Radius: 8px
├── Shadow: Shadow/SM
│
├── Hover:
│   └── Background: Primary/Dark (#1E40AF)
│
├── Pressed:
│   └── Background: Primary/Dark (#1E40AF)
│   └── Scale: 0.98
│
├── Disabled:
│   └── Background: Neutral/Border (#E5E7EB)
│   └── Text: Text/Disabled (#9CA3AF)
│
└── Loading:
    └── Spinner (white, 20px) + "Loading..."
```

---

### Component: Input Field
**Variants:**
1. Text
2. Email
3. Password
4. Number
5. Phone
6. Textarea

**States:**
- Default
- Focus
- Filled
- Error
- Disabled

**Anatomy:**
```
Input Field
├── Label (optional)
│   ├── Text: Body/Small
│   ├── Color: Text/Primary
│   └── Required indicator (*)
│
├── Input Container
│   ├── Height: 48px (or auto for Textarea)
│   ├── Background: Neutral/Surface
│   ├── Border: 1px Neutral/Border
│   ├── Border Radius: 8px
│   ├── Padding: 12px 16px
│   │
│   ├── Leading Icon (optional)
│   │   ├── Size: 20px
│   │   └── Color: Text/Secondary
│   │
│   ├── Input Text
│   │   ├── Font: Body/Regular
│   │   └── Color: Text/Primary
│   │
│   └── Trailing Icon (optional)
│       └── Password toggle / Clear button
│
├── Helper Text (optional)
│   ├── Font: Caption
│   └── Color: Text/Secondary
│
└── Error Message (optional)
    ├── Font: Caption
    ├── Color: Status/Red
    └── Icon: ⚠️
```

**Focus State:**
- Border: 2px Primary/Blue
- Shadow: 0 0 0 4px Primary/Lightest

**Error State:**
- Border: 2px Status/Red
- Helper text becomes error message
- Shake animation (optional)

---

### Component: Gift Card
**Variants:**
1. Default (Active)
2. Warning (Expiring)
3. Urgent (7 days)
4. Expired
5. Used

**Sizes:**
- Large: 343×180 (card details)
- Medium: 343×140 (wallet list)
- Small: 160×80 (preview/mini)
- Tiny: 60×36 (inline reference)

**Properties:**
- Issuer (enum: BuyMe, Max, Dreamcard, TavTzahav, Other)
- Label (string)
- Last4 (string)
- CurrentValue (number)
- InitialValue (number)
- ExpiryDate (date)
- Status (enum)
- Photo (optional image)

**Large Card Anatomy:**
```
Gift Card (Large)
├── Background
│   ├── Width: 343px
│   ├── Height: 180px
│   ├── Gradient: Issuer color → darker shade (135°)
│   ├── Border Radius: 16px
│   └── Shadow: Shadow/MD
│
├── Issuer Logo (top-left)
│   ├── Size: 40×40
│   ├── Border Radius: 10px
│   ├── Background: White 20% opacity
│   └── Position: 16px from top, 16px from left
│
├── Status Badge (top-right)
│   ├── Padding: 6px 14px
│   ├── Border Radius: full
│   ├── Background: White 20% opacity
│   ├── Text: Caption, Semibold, White
│   ├── Status Dot: 8px, colored (Green/Yellow/Red)
│   └── Position: 16px from top, 16px from right
│
├── Content Area
│   ├── Padding: 16px
│   │
│   ├── Label
│   │   ├── Font: H2/Section (20px)
│   │   ├── Color: White
│   │   └── Max lines: 1, ellipsis
│   │
│   ├── Last 4 Digits
│   │   ├── Font: Body/Small
│   │   ├── Color: White, 60% opacity
│   │   └── Text: "•••• •••• •••• 1234"
│   │
│   ├── Spacer
│   │
│   ├── Progress Bar
│   │   ├── Width: 100%
│   │   ├── Height: 6px
│   │   ├── Background: White 20%
│   │   ├── Fill: White 90%
│   │   └── Border Radius: full
│   │
│   └── Bottom Row
│       ├── Value (left)
│       │   ├── Font: Display/Large (32px)
│       │   ├── Color: White
│       │   └── Text: "₪380"
│       │
│       └── Expiry (right)
│           ├── Date: Body/Regular, White 90%
│           ├── Countdown: Caption, White 70%
│           └── Alignment: right
│
└── Touch Target
    └── Full card is tappable
```

---

### Component: Bottom Navigation
**Anatomy:**
```
Bottom Navigation
├── Container
│   ├── Width: 100%
│   ├── Height: 80px (including safe area)
│   ├── Background: Neutral/Surface
│   ├── Border-Top: 1px Neutral/Border
│   └── Safe area padding: 16px bottom
│
├── Items (3)
│   ├── Width: Equal thirds
│   ├── Height: 64px
│   │
│   ├── Item 1: Home
│   │   ├── Icon: Home (24px)
│   │   ├── Label: "Wallet" / "ארנק"
│   │   └── Color: Primary (active) / Text/Secondary (inactive)
│   │
│   ├── Item 2: Add (center, elevated)
│   │   ├── FAB Container
│   │   │   ├── Size: 56×56
│   │   │   ├── Background: Primary/Blue
│   │   │   ├── Border Radius: full
│   │   │   └── Shadow: Shadow/LG
│   │   ├── Icon: Plus (28px, white)
│   │   └── Position: 8px above bar
│   │
│   └── Item 3: Profile
│       ├── Icon: User (24px)
│       ├── Label: "Profile" / "פרופיל"
│       └── Color: Primary (active) / Text/Secondary (inactive)
│
└── Active Indicator
    ├── Dot below icon
    ├── Size: 4×4
    ├── Color: Primary/Blue
    └── Border Radius: full
```

---

### Component: Toast Notification
**Variants:**
1. Success (green)
2. Error (red)
3. Warning (yellow)
4. Info (blue)

**Anatomy:**
```
Toast
├── Container
│   ├── Width: 343px (screen - 32px)
│   ├── Height: Auto (min 48px)
│   ├── Background: Respective color (90% opacity)
│   ├── Border Radius: 12px
│   ├── Shadow: Shadow/LG
│   ├── Padding: 12px 16px
│   └── Position: 24px from top, centered
│
├── Icon (left)
│   ├── Size: 24px
│   ├── Color: White
│   └── Icons: ✓ (success), ✗ (error), ⚠ (warning), ℹ (info)
│
├── Content (center, flex)
│   ├── Title (optional)
│   │   ├── Font: Body/Regular, Semibold
│   │   └── Color: White
│   ├── Message
│   │   ├── Font: Body/Small
│   │   └── Color: White, 90% opacity
│   └── Action Link (optional)
│       ├── Font: Body/Small, Semibold
│       └── Underlined
│
└── Dismiss Button (right)
    ├── Icon: × (20px)
    ├── Color: White, 80% opacity
    └── Tap area: 44×44
```

**Animation:**
- Enter: Slide down + fade in (300ms ease-out)
- Exit: Slide up + fade out (200ms ease-in)
- Auto-dismiss: 4000ms (unless has action)

---

### Component: Status Badge
**Variants:**
1. Active (Green)
2. Warning (Yellow)
3. Urgent (Red)
4. Expired (Gray)
5. Used (Gray)

**Anatomy:**
```
Status Badge
├── Container
│   ├── Padding: 4px 12px
│   ├── Border Radius: full (999px)
│   └── Background: Status color 15% opacity
│
├── Status Dot
│   ├── Size: 6×6
│   ├── Border Radius: full
│   ├── Background: Status color 100%
│   └── Margin-right: 6px
│
└── Label
    ├── Font: Caption (12px), Semibold
    └── Color: Status color (darker variant)
```

**Labels:**
- Active: "Active" / "פעיל"
- Warning: "Expiring Soon" / "פג תוקף בקרוב"
- Urgent: "Expires in X days" / "פג תוקף בעוד X ימים"
- Expired: "Expired" / "פג תוקף"
- Used: "Used" / "משומש"

---

### Component: Empty State
**Anatomy:**
```
Empty State
├── Container
│   ├── Width: 100%
│   ├── Padding: 48px 24px
│   └── Alignment: Center
│
├── Illustration
│   ├── Size: 200×160
│   └── Centered
│
├── Title
│   ├── Font: H2/Section
│   ├── Color: Text/Primary
│   ├── Margin-top: 24px
│   └── Text-align: center
│
├── Description
│   ├── Font: Body/Regular
│   ├── Color: Text/Secondary
│   ├── Margin-top: 8px
│   ├── Max-width: 280px
│   └── Text-align: center
│
└── Action (optional)
    ├── Primary Button
    └── Margin-top: 24px
```

**Variations:**
- No Cards: Gift box illustration
- No Search Results: Magnifying glass with question mark
- No Notifications: Bell with Z's
- Error: Broken gift card
- Offline: Cloud with X

---

### Component: Modal / Dialog
**Anatomy:**
```
Modal
├── Backdrop
│   ├── Background: #000000, 50% opacity
│   └── Tap to dismiss (optional)
│
├── Container
│   ├── Width: 343px (screen - 32px)
│   ├── Background: Neutral/Surface
│   ├── Border Radius: 16px
│   ├── Shadow: Shadow/XL
│   ├── Padding: 24px
│   └── Position: Center of screen
│
├── Close Button (optional)
│   ├── Position: Top-right
│   ├── Icon: × (24px)
│   └── Color: Text/Secondary
│
├── Icon (optional)
│   ├── Size: 64×64
│   ├── Centered
│   └── Margin-bottom: 16px
│
├── Title
│   ├── Font: H2/Section
│   ├── Color: Text/Primary
│   └── Text-align: center
│
├── Message
│   ├── Font: Body/Regular
│   ├── Color: Text/Secondary
│   ├── Margin-top: 8px
│   └── Text-align: center
│
└── Actions
    ├── Margin-top: 24px
    ├── Layout: Horizontal (2 buttons) or Vertical (stacked)
    └── Buttons: Ghost + Primary / Cancel + Confirm
```

**Confirmation Dialog:**
- Title: "Are you sure?"
- Danger variant: Red primary button
- Cancel always on left (or top if stacked)

---

### Component: Bottom Sheet
**Anatomy:**
```
Bottom Sheet
├── Backdrop
│   └── Same as Modal
│
├── Container
│   ├── Width: 100%
│   ├── Max-height: 90vh
│   ├── Background: Neutral/Surface
│   ├── Border Radius: 16px 16px 0 0
│   ├── Shadow: Shadow/XL
│   └── Safe area padding at bottom
│
├── Handle
│   ├── Width: 32px
│   ├── Height: 4px
│   ├── Border Radius: full
│   ├── Background: Neutral/Border
│   ├── Margin: 8px auto
│   └── Drag to expand/dismiss
│
├── Header (optional)
│   ├── Height: 56px
│   ├── Padding: 16px
│   ├── Border-bottom: 1px Neutral/Divider
│   ├── Title: H3/Card Title, left-aligned
│   └── Close button: right
│
└── Content
    ├── Padding: 16px
    └── Scrollable if overflow
```

**Behavior:**
- Swipe down to dismiss
- Tap backdrop to dismiss
- Can have snap points (partial, expanded, full)

---

### Component: Loading Skeleton
**Anatomy:**
```
Skeleton
├── Base Shape
│   ├── Background: Neutral/Border (#E5E7EB)
│   ├── Border Radius: 8px (or matches element)
│   └── Animation: Shimmer
│
├── Shimmer Animation
│   ├── Gradient: #E5E7EB → #F3F4F6 → #E5E7EB
│   ├── Direction: Left to right
│   └── Duration: 1.5s, infinite
│
└── Preset Shapes
    ├── Text Line: 16px height, variable width
    ├── Avatar: Circle, 48px
    ├── Card: Rectangle, matches card size
    └── Image: Rectangle, 16:9 ratio
```

**Card Skeleton:**
```
Card Skeleton
├── Container (same as Gift Card)
│   └── Background: Neutral/Border
│
├── Logo placeholder: 32×32 circle
├── Status placeholder: 60×20 rounded rect
├── Title placeholder: 200×20 rounded rect
├── Subtitle placeholder: 120×14 rounded rect
├── Progress placeholder: full width × 4px
├── Value placeholder: 80×32 rounded rect
└── Expiry placeholder: 100×16 rounded rect
```

---

## 🎬 Animation & Motion

### Micro-interactions

**Button Press:**
- Scale down to 0.98
- Duration: 100ms
- Easing: ease-out

**Card Hover (desktop):**
- Scale up to 1.02
- Shadow: Shadow/Card-Hover
- Duration: 200ms
- Easing: ease

**Card Tap:**
- Scale down to 0.98
- Duration: 100ms
- Ripple effect from tap point

**Toggle Switch:**
- Thumb slides: 200ms ease
- Background color fades: 200ms ease

**Input Focus:**
- Border color fades: 150ms
- Label animates up (if floating label variant)

### Page Transitions

**Forward Navigation (Push):**
- New screen slides in from right (LTR) or left (RTL)
- Duration: 300ms
- Easing: ease-out

**Back Navigation (Pop):**
- Current screen slides out to right (LTR) or left (RTL)
- Duration: 250ms
- Easing: ease-in

**Modal/Sheet Enter:**
- Backdrop fades in: 200ms
- Modal scales from 0.95 + fades in: 300ms ease-out
- Sheet slides up: 300ms ease-out

**Modal/Sheet Exit:**
- Backdrop fades out: 150ms
- Modal scales to 0.95 + fades out: 200ms ease-in
- Sheet slides down: 200ms ease-in

### Loading States

**Spinner:**
- Rotation: 360° infinite
- Duration: 1s per rotation
- Easing: linear

**Progress Bar:**
- Fill animation: 300ms ease
- Indeterminate: sliding gradient left-right

**Skeleton Shimmer:**
- Gradient sweep: 1.5s infinite
- Easing: linear

### Success/Error Feedback

**Success Checkmark:**
- Circle draws (stroke animation): 300ms
- Check draws: 200ms (after circle)
- Scale bounce: 1.0 → 1.2 → 1.0 (200ms)

**Error Shake:**
- X position: 0 → -10 → 10 → -10 → 10 → 0
- Duration: 400ms
- Easing: ease-in-out

**Toast Enter:**
- Slide down from -100% Y
- Fade in from 0 to 1
- Duration: 300ms ease-out

**Toast Exit:**
- Slide up to -100% Y
- Fade out from 1 to 0
- Duration: 200ms ease-in

### Pulse Animation (Urgent Cards)

**Status Dot Pulse:**
```
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
Duration: 1.5s infinite
```

---

## 🌐 RTL (Hebrew) Specifications

### Layout Mirroring

**Elements that mirror:**
- Text alignment: left ↔ right
- Icon positions: leading ↔ trailing
- Navigation arrows: ← ↔ →
- Horizontal scrolling direction
- Form label positions
- Progress bars fill direction
- List item chevrons
- Back buttons position

**Elements that DON'T mirror:**
- Numbers (always LTR): ₪380
- Phone numbers: 050-1234567
- Email addresses
- URLs
- Card numbers: •••• 1234
- Date formats (configurable)
- Checkmarks and icons (universal meaning)
- Media controls (play, pause)

### Text Direction

**Hebrew Text:**
- Direction: RTL
- Alignment: Right
- Font: Rubik (supports Hebrew)

**English Text:**
- Direction: LTR
- Alignment: Left
- Font: Inter

**Mixed Content:**
- Use Unicode bidirectional algorithm
- Numbers embedded in Hebrew remain LTR
- Currency symbol (₪) stays before number

### Specific Component Changes

**Navigation:**
- Back button: Right side (RTL)
- Forward indicators: ← instead of →
- Tabs: Right-to-left order

**Forms:**
- Labels: Right-aligned
- Input icons: Right side (leading for RTL)
- Error messages: Right-aligned
- Character counters: Left side

**Cards:**
- Issuer logo: Top-right
- Status badge: Top-left
- Expiry info: Left side
- Value: Right side

**Lists:**
- Chevrons: Left side (pointing left ←)
- Leading icons: Right side
- Action buttons: Left side

---

## ♿ Accessibility Guidelines

### Touch Targets

- Minimum size: 44×44 px
- Spacing between targets: 8px minimum
- FAB: 56×56 px (larger for primary action)

### Color Contrast

- Normal text: 4.5:1 minimum
- Large text (>18px): 3:1 minimum
- UI components: 3:1 minimum

**Contrast Ratios (verify):**
- Text/Primary on Background: 15.5:1 ✓
- Text/Secondary on Background: 4.6:1 ✓
- White on Primary/Blue: 4.7:1 ✓
- Status colors on white: All > 3:1 ✓

### Focus States

- Visible focus ring: 2px Primary/Blue
- Focus background: Primary/Lightest
- Never remove focus outlines

### Screen Reader Support

**Labels:**
- All inputs have labels (visible or aria-label)
- All buttons have accessible names
- Images have alt text

**Announcements:**
- Toast notifications announced
- Loading states announced
- Form errors announced
- Page transitions announced

**Navigation:**
- Skip to main content link
- Logical heading hierarchy (h1 → h2 → h3)
- Landmark regions defined

### Reduced Motion

- Respect `prefers-reduced-motion`
- Replace animations with instant transitions
- Keep functional animations (progress indicators)
- Remove decorative animations

---

## 🖼️ Icon Set

### Navigation Icons (24×24)
- `home` - House outline
- `home-filled` - House filled (active)
- `add-circle` - Plus in circle
- `user` - Person outline
- `user-filled` - Person filled (active)
- `arrow-left` - Back arrow
- `arrow-right` - Forward arrow
- `close` - X mark
- `menu` - Hamburger menu
- `more` - Three dots (vertical)

### Action Icons (24×24)
- `edit` - Pencil
- `delete` - Trash can
- `copy` - Two rectangles
- `share` - Share arrow
- `download` - Arrow down with line
- `upload` - Arrow up with line
- `search` - Magnifying glass
- `filter` - Funnel
- `sort` - Bars descending
- `refresh` - Circular arrows

### Status Icons (24×24)
- `check` - Checkmark
- `check-circle` - Checkmark in circle
- `warning` - Triangle with !
- `error` - Circle with X
- `info` - Circle with i
- `help` - Circle with ?

### Card Icons (24×24)
- `gift` - Gift box
- `credit-card` - Credit card
- `wallet` - Wallet
- `receipt` - Receipt
- `barcode` - Barcode lines
- `qr-code` - QR code

### Feature Icons (24×24)
- `bell` - Notification bell
- `bell-off` - Bell with slash
- `eye` - Visible
- `eye-off` - Hidden
- `lock` - Padlock closed
- `unlock` - Padlock open
- `calendar` - Calendar
- `clock` - Clock
- `chart` - Bar chart
- `camera` - Camera

### Social/Brand Icons (24×24)
- `google` - Google G
- `apple` - Apple logo
- `facebook` - Facebook F
- `whatsapp` - WhatsApp
- `telegram` - Telegram plane

---

## 📐 Illustration Guidelines

### Style

**Characteristics:**
- Flat design with subtle gradients
- Soft shadows for depth
- Rounded corners and shapes
- Playful but professional
- Consistent stroke width (2-3px)
- Limited color palette (Primary + 2 accent)

**Color Usage:**
- Primary: Main subjects
- Accent 1 (Yellow): Highlights, call-outs
- Accent 2 (Green): Success states
- Neutral: Backgrounds, shadows
- Avoid Status/Red except for error states

### Sizes

**Large (Hero):** 280×200 - Empty states, onboarding
**Medium:** 160×120 - Feature highlights
**Small:** 80×80 - Status indicators, inline

### Illustration Set

1. **Empty Wallet**
   - Open wallet with sparkles
   - Used for: Empty wallet state

2. **Gift Box**
   - Colorful wrapped gift
   - Used for: Add first card prompt

3. **Card Stack**
   - Multiple gift cards fanned
   - Used for: Wallet overview, statistics

4. **Calendar Alert**
   - Calendar with bell icon
   - Used for: Reminders, expiry features

5. **Success Celebration**
   - Confetti, checkmark
   - Used for: Card added, task complete

6. **Error/Broken Card**
   - Cracked gift card
   - Used for: Error states, expired cards

7. **Search Empty**
   - Magnifying glass over empty box
   - Used for: No search results

8. **Lock & Shield**
   - Padlock with shield
   - Used for: Security features, encryption

9. **Mobile Phone**
   - Phone showing app UI
   - Used for: Onboarding, feature showcase

10. **Notification Bell**
    - Bell with notification dots
    - Used for: Notification features

---

## 📱 Device Frames

### Design for These Devices

**Mobile (Primary):**
- iPhone 13 Pro: 390×844
- iPhone SE: 375×667
- iPhone 14 Pro Max: 430×932
- Samsung Galaxy S21: 360×800

**Tablet:**
- iPad Mini: 744×1133
- iPad Pro 11": 834×1194

**Desktop (Future):**
- Desktop HD: 1440×900
- Desktop Large: 1920×1080

### Safe Areas

**iOS:**
- Status bar: 47px (Dynamic Island: 54px)
- Home indicator: 34px
- Notch area: Avoid interactive elements

**Android:**
- Status bar: 24px
- Navigation bar: 48px
- Edge gestures: 20px sides

---

## 🎨 Figma Organization

### File Structure
```
📁 GiftWallet IL
├── 📄 Cover
├── 📄 Design System
│   ├── 🎨 Colors
│   ├── 📝 Typography
│   ├── 📐 Spacing & Grid
│   ├── 🎭 Effects
│   └── 🖼️ Icons
├── 📄 Components
│   ├── 🔘 Buttons
│   ├── 📝 Inputs
│   ├── 🎴 Cards
│   ├── 🏷️ Badges
│   ├── 🔔 Notifications
│   ├── 🗂️ Navigation
│   └── 🎭 Overlays
├── 📄 Screens - Auth
│   ├── Splash
│   ├── Login
│   ├── Sign Up
│   ├── Forgot Password
│   └── Reset Password
├── 📄 Screens - Main
│   ├── Wallet (Empty)
│   ├── Wallet (With Cards)
│   ├── Card Details
│   └── Profile
├── 📄 Screens - Cards
│   ├── Add Card Step 1
│   ├── Add Card Step 2
│   └── Edit Card
├── 📄 Screens - Overlays
│   ├── Balance Update Sheet
│   ├── Filter Sheet
│   ├── Share Sheet
│   └── Confirmation Dialogs
├── 📄 Screens - Other
│   ├── Statistics
│   ├── Notifications
│   └── Onboarding
├── 📄 Prototyping
│   └── Interactive Prototype
└── 📄 Handoff
    ├── Specs
    └── Assets
```

### Naming Conventions

**Components:**
- `Button/Primary/Default`
- `Input/Text/Focus`
- `Card/Gift/Active/Medium`

**Screens:**
- `Auth/Login`
- `Main/Wallet/WithCards`
- `Overlay/BalanceUpdate`

**States:**
- Default, Hover, Pressed, Focused, Disabled, Loading, Error

### Version Control

- Use Figma branches for major changes
- Main branch = production-ready
- Name branches: `feature/new-statistics`, `fix/button-states`

---

## 📤 Handoff Checklist

### For Each Screen

- [ ] All text is editable (no rasterized text)
- [ ] Components are properly linked
- [ ] Auto-layout is used throughout
- [ ] Constraints are set for responsiveness
- [ ] States are documented
- [ ] Spacing is consistent (8px grid)
- [ ] Colors use styles (not hardcoded)
- [ ] Typography uses text styles
- [ ] Icons are components or vectors
- [ ] Interactions are prototyped

### Export Assets

**Icons:** SVG, 24×24, stroke converted to paths
**Illustrations:** SVG, PNG @2x
**App Icon:** PNG @1x, @2x, @3x
**Logos:** SVG

### Developer Notes

- Include redlines for custom spacing
- Note interaction behaviors
- Document animation timing
- Specify responsive breakpoints
- List all component props
- Provide API/data field mapping

---

*Last Updated: January 2026*
*Version: 1.0.0*

