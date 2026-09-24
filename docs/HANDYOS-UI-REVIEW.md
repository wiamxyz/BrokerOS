# HandyOS UI patterns applied to BrokerOS

Reviewed HandyOS main at `a4618190f9950cb573e878e52e4fde0397582df2`, its published assistant and the current DESIGN.md, sidebar, assistant, sorting and mobile interaction source. BrokerOS already shared the light ChatGPT/shadcn shell; this pass applies the later interaction refinements.

| HandyOS change | BrokerOS adaptation |
| --- | --- |
| Smaller mobile header actions with balanced internal padding (`cd4e793`, `9d03c7a`) | Compact 32px create actions; 16px page-edge spacing; clear labels retained |
| One horizontal search/filter row (`ba1c9e4`) and short placeholders (`ee783d0`) | Scrollable contact, deal, owner and campaign toolbars; “Search…” on mobile with full accessible labels |
| Swipe right to open navigation (`9451411`) | Added on noninteractive mobile page content; vertical scrolling, selected text, dialogs and horizontal table/board scrolling keep their normal gestures |
| Assistant conversations (`1622766`) and linked records (`f1e4995`) | New Chat, recent conversations, sticky composer, linked contacts/deals, persisted conversation history |
| Reviewable assistant actions and results (`a461819`) | Three real-estate demos: closing reminder, owner follow-up draft, Emaar campaign draft; editable proposals, explicit save, dismissal and persistent results |
| Profile menu and table sorting | Profile/settings menu; every contact/deal column sortable with direction indicators and aria-sort |

Existing CRM pages and approval queue remain available. Assistant responses use local sample data and deterministic demo scenarios. No live AI, external delivery, financial transactions, integrations or account changes were added. HandyOS work orders, invoicing and technician dispatch are not relevant to BrokerOS and were not copied.

## State and action behavior

Conversations are an optional addition to the existing version-1 browser workspace, preserving previously saved CRM data. Actions validate their current record context and contact outreach preference, reject invalid/blank input, avoid duplicate reminders and cannot apply the same proposal twice. Drafts enter the existing review queue or Campaigns; they never send messages. Reset demo data also clears chat edits.

## Validation

Production build, TypeScript, ESLint and nine action/gesture tests. Browser checks cover new chats, linked contact detail, reminder creation and persistence, edited owner draft in the queue, unsent campaign creation, profile/settings navigation, sorting and responsive layout. Mobile gesture thresholds have automated coverage; a physical touch-device swipe was not exercised by desktop browser automation.
