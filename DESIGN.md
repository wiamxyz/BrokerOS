# BrokerOS design

Use the same blend established in HandyOS: ChatGPT’s restrained navigation and native system typography with shadcn’s accessible product components. Reference analyses: [ChatGPT](https://www.sokosumi.com/tools/design-md/analysis/chatgpt) and [shadcn](https://www.sokosumi.com/tools/design-md/analysis/shadcn). The latter could not be fetched during this task; the existing HandyOS DESIGN.md and its shadcn source components supplied the implementation reference.

## Shared visual language

Light gray sidebar, white main canvas, charcoal text, quiet thin borders, no decorative shadows. A stable BrokerOS wordmark is confined to navigation. Rounded buttons and search controls sit alongside practical, structured forms and tables. A profile link opens settings. Main page titles and primary create actions live in the top bar. Status color is sparse, meaningful and labeled: closing urgency, owner acquisition and nurture.

Use compact 14px top-bar titles, 14–16px working text, 12px secondary metadata and larger summary numbers. Use 24–32px section spacing. Do not add decorative widgets. Focus the opening dashboard on closing buyers, owner conversations, approval work and task completion. Records open in contextual detail sheets; creation and editing use centered shadcn dialogs.

## Interaction language

Use actual shadcn source components, based on Radix: Button, Card, Badge, Dialog, Sheet, Input, Textarea, Select, Label, Tabs, Table and Skeleton. Keep focus management, keyboard navigation and accessible names. Tables support search, compound filters and selected sortable headings. Actions write shared application state and update related screens. Empty and loading states are deliberate.

On mobile, navigation moves into a sheet; close it when a destination is chosen. Keep scrolling tables and pipeline boards inside their own containers. Forms and detail panels fit the viewport. Entrance animation is subtle and disabled for reduced-motion preferences.

Lofty informed workflow and information hierarchy only. Do not reuse its logo, copy, promotional claims or product art. All outreach, AI suggestions, launch facts and market numbers are demo concepts, with explicit labeling.

## HandyOS alignment — September 2026

Use HandyOS main at `9b80ce9` (September 25) as the current layout reference: 320px warm gray sidebar, a plain 17px wordmark, 32px desktop navigation rows and 13px muted group labels. Desktop collapse hides the sidebar completely. The 46px top bar exposes sidebar, history and New Chat controls when collapsed. The expanded sidebar pins these controls, the brand/search row and New Chat above its scrolling navigation. Mobile uses a shadcn sheet and keeps history controls inside it.

Keep the dashboard flat: three simple summary cards, a daily priorities table and a compact review list. Do not restore the greeting hero, promotional assistant quote, progress ring or decorative pipeline chart. Summary cards use labels and values, with optional useful hints and no icon decoration.

Use one-line contact and deal tables with filters outside the table frame, 54px rows, 24px outer corners and keyboard-accessible record buttons. Status pills use a small dot and sparse semantic color. Keep supporting information inside detail sheets. Use 14px top-bar titles, 18px section titles, 14px body text, 24–32px spacing, thin neutral borders and no shadows. Mobile summary cards remain compact in three columns; wide tables scroll within their own frame.

## Latest HandyOS interaction refinements

Use a compact, sticky mobile header with smaller create actions and balanced button padding. Search and filters stay in one horizontally scrolling row, with short mobile placeholders and descriptive accessible names. A deliberate right swipe on noninteractive content opens navigation; preserve vertical scrolling and nested horizontal scrolling.

The assistant has its own conversation canvas, New Chat and recent history, linked workspace records, a sticky composer and editable action proposals with saved results. Preserve the dedicated approval queue for outreach review. All chat replies are explicitly labeled as demo responses, and saved actions affect browser data only. Settings lives in a real profile menu. Show the active sort direction on every sortable table heading.

See `docs/HANDYOS-UI-REVIEW.md` for the source-to-BrokerOS mapping and boundaries.

## Mobile sidebar reference refinement

The mobile menu follows the latest HandyOS refinement of the user's ChatGPT reference. Use a warm `#f2f0ef` sheet up to `min(82vw, 352px)`, a 17px wordmark, 40px navigation rows with 14px labels and 16px Iconly outline icons, and subdued 13px group labels. Keep Workspace, Growth and AI assistant independently collapsible and remember the user's choices. Conversations belong inside AI assistant, without another group heading or indentation. Highlight the selected conversation without changing its order when opened.

Keep the header and profile footer fixed while the middle scrolls. New Chat is pinned at the top. Keep distinct sidebar open/close icons, focus management, a light backdrop and subtle edge separation. Header actions use transparent backgrounds, restrained hover feedback and compact labels. Notifications sit beside Search in the sidebar brand row on desktop and mobile. Preserve the circular outline, unread indicator and an 8px gap between sidebar controls. The desktop header shows a notification shortcut only while the sidebar is fully collapsed, retaining a 12px gap from the create action. On mobile, open notifications from the navigation sheet.

Use official Iconly artwork with locally bundled animations. Icons play once per desktop pointer entry, reset on exit, and remain still on touch devices or when reduced motion is requested. Plus signs, chevrons and directional controls stay static. See `docs/iconly.md` for sources and behavior.

## Sidebar search reference

On mobile, sidebar search opens an edge-to-edge white screen, focuses a pill-shaped input at the bottom, and places a circular close button alongside it. Keep the result list above the controls and scroll it independently. Follow the visual viewport's height and offset so the controls remain reachable when the on-screen keyboard opens. Use the real device keyboard, not an imitation in the interface. Desktop keeps a centered search dialog with the same results and controls.

Start search with Needs attention: actionable workspace pages ranked by closing work, due reminders, engaged owners, pending reviews and campaign follow-up. Derive counts from current browser data and remove urgency when work is resolved. Show the remaining pages under Workspace, then recent records under Last opened. Chats must not dominate the initial screen.

Index every page, clients, projects/properties, deals, tasks, campaigns, review items and conversation content. Use familiar aliases such as clients, reminders and approvals. Rank exact names first and workspace records ahead of conversations on equally relevant matches. Show a type icon, title, one-line preview and quiet type label. Open pages directly, records in their existing editor/detail, and projects in a contextual sheet with linked clients, deals, campaigns and available sample market references. Project context is derived from existing property data, not a separate backend. Store at most twelve recently opened references with the browser demo data and skip missing records. Preserve an informative empty state.
