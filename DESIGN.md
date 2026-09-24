# BrokerOS design

Use the same blend established in HandyOS: ChatGPT’s restrained navigation and native system typography with shadcn’s accessible product components. Reference analyses: [ChatGPT](https://www.sokosumi.com/tools/design-md/analysis/chatgpt) and [shadcn](https://www.sokosumi.com/tools/design-md/analysis/shadcn). The latter could not be fetched during this task; the existing HandyOS DESIGN.md and its shadcn source components supplied the implementation reference.

## Shared visual language

Light gray sidebar, white main canvas, charcoal text, quiet thin borders, no decorative shadows. A stable BrokerOS wordmark is confined to navigation. Rounded buttons and search controls sit alongside practical, structured forms and tables. A profile link opens settings. Main page titles and primary create actions live in the top bar. Status color is sparse, meaningful and labeled: closing urgency, owner acquisition and nurture.

Use 20px page titles, 14–16px working text, 12px secondary metadata and larger summary numbers. Use 24–32px section spacing. Do not add decorative widgets. Focus the opening dashboard on closing buyers, owner conversations, approval work and task completion. Records open in contextual detail sheets; creation and editing use centered shadcn dialogs.

## Interaction language

Use actual shadcn source components, based on Radix: Button, Card, Badge, Dialog, Sheet, Input, Textarea, Select, Label, Tabs, Table and Skeleton. Keep focus management, keyboard navigation and accessible names. Tables support search, compound filters and selected sortable headings. Actions write shared application state and update related screens. Empty and loading states are deliberate.

On mobile, navigation moves into a sheet; close it when a destination is chosen. Keep scrolling tables and pipeline boards inside their own containers. Forms and detail panels fit the viewport. Entrance animation is subtle and disabled for reduced-motion preferences.

Lofty informed workflow and information hierarchy only. Do not reuse its logo, copy, promotional claims or product art. All outreach, AI suggestions, launch facts and market numbers are demo concepts, with explicit labeling.

## HandyOS alignment — September 2026

Use the current HandyOS interface as the concrete layout reference: 260px soft gray sidebar, a 32px charcoal brand mark, 16px wordmark, 40px navigation rows, sentence-case section labels and a plain profile footer. Desktop navigation collapses into an icon rail; mobile navigation uses a shadcn sheet. Search belongs in navigation. The top bar contains only the page title, notifications and the primary action.

Keep the dashboard flat: three simple summary cards, a daily priorities table and a compact review list. Do not restore the greeting hero, promotional assistant quote, progress ring or decorative pipeline chart. Summary cards use labels and values, with optional useful hints and no icon decoration.

Use one-line contact and deal tables with filters outside the table frame, 54px rows, 24px outer corners and keyboard-accessible record buttons. Status pills use a small dot and sparse semantic color. Keep supporting information inside detail sheets. Use 20px page titles, 18px section titles, 14px body text, 24–32px spacing, thin neutral borders and no shadows. Mobile summary cards remain compact in three columns; wide tables scroll within their own frame.

## Latest HandyOS interaction refinements

Use a compact, sticky mobile header with smaller create actions and balanced button padding. Search and filters stay in one horizontally scrolling row, with short mobile placeholders and descriptive accessible names. A deliberate right swipe on noninteractive content opens navigation; preserve vertical scrolling and nested horizontal scrolling.

The assistant has its own conversation canvas, New Chat and recent history, linked workspace records, a sticky composer and editable action proposals with saved results. Preserve the dedicated approval queue for outreach review. All chat replies are explicitly labeled as demo responses, and saved actions affect browser data only. Settings lives in a real profile menu. Show the active sort direction on every sortable table heading.

See `docs/HANDYOS-UI-REVIEW.md` for the source-to-BrokerOS mapping and boundaries.

## Mobile sidebar reference refinement

The mobile menu uses the user's ChatGPT sidebar screenshot as a spacing and hierarchy reference. Use a white sheet up to 320px wide, a 24px BrokerOS wordmark, a circular search action in the header, 48px navigation rows with 16px labels and 21px outline icons, and 15px semibold group headings. Keep Workspace, Growth and AI assistant independently collapsible and remember the user's choices. Recent conversations belong inside AI assistant, without a separate group heading.

Keep the menu header and footer fixed while the middle scrolls. Put a monochrome Chat pill and circular profile/settings menu in the footer. Preserve a clearly labeled close button, keyboard focus management, a light backdrop and a subtle edge shadow for separation. Keep desktop navigation compact and retain its profile footer and icon rail. Notification bells use a circular outline button on both screen sizes.
