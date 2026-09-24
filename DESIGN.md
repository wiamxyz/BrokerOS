# BrokerOS design

Use the same blend established in HandyOS: ChatGPT’s restrained navigation and native system typography with shadcn’s accessible product components. Reference analyses: [ChatGPT](https://www.sokosumi.com/tools/design-md/analysis/chatgpt) and [shadcn](https://www.sokosumi.com/tools/design-md/analysis/shadcn). The latter could not be fetched during this task; the existing HandyOS DESIGN.md and its shadcn source components supplied the implementation reference.

## Shared visual language

Light gray sidebar, white main canvas, charcoal text, quiet thin borders, no decorative shadows. A stable BrokerOS wordmark is confined to navigation. Rounded buttons and search controls sit alongside practical, structured forms and tables. A profile link opens settings. Main page titles and primary create actions live in the top bar. Status color is sparse, meaningful and labeled: closing urgency, owner acquisition and nurture.

Use 20px page titles, 14–16px working text, 12px secondary metadata and larger summary numbers. Use 24–32px section spacing. Do not add decorative widgets. Focus the opening dashboard on closing buyers, owner conversations, approval work and task completion. Records open in contextual detail sheets; creation and editing use centered shadcn dialogs.

## Interaction language

Use actual shadcn source components, based on Radix: Button, Card, Badge, Dialog, Sheet, Input, Textarea, Select, Label, Tabs, Table and Skeleton. Keep focus management, keyboard navigation and accessible names. Tables support search, compound filters and selected sortable headings. Actions write shared application state and update related screens. Empty and loading states are deliberate.

On mobile, navigation moves into a sheet; close it when a destination is chosen. Keep scrolling tables and pipeline boards inside their own containers. Forms and detail panels fit the viewport. Entrance animation is subtle and disabled for reduced-motion preferences.

Lofty informed workflow and information hierarchy only. Do not reuse its logo, copy, promotional claims or product art. All outreach, AI suggestions, launch facts and market numbers are demo concepts, with explicit labeling.
