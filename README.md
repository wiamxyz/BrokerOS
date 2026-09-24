# BrokerOS

A focused real estate CRM demo for Walid’s workflow: close active buyers, win owner listings, then nurture the wider database.

## Included

- Daily overview, ranked tasks, reminders and in-app priority notifications.
- Searchable/filterable/sortable contacts and deals, create/edit dialogs, detail panels, notes, call logs, property context and activity.
- Eight-stage owner acquisition board, visible nurture states, valuation-request simulation and agent handoffs.
- Launch campaigns with segment selection, per-recipient selection, editable fact sheets, preview, draft saving, simulated delivery and interested responses.
- ChatGPT-style assistant with recent conversations, linked records, editable reminder/follow-up/campaign proposals and persistent action results.
- Assistant approval queue with draft editing, approval/dismissal history and linked context.
- Building-level Property Finder / DXB Interact placeholders, labeled as illustrative.
- Browser-local persistence, reset, responsive layouts, keyboard-accessible shadcn primitives and reduced-motion support.

## Run

```sh
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
node --experimental-strip-types --test tests/assistant-chat.test.mjs
```

The output is a static Next.js export in `out/`. Import `wiamxyz/BrokerOS` in Vercel, select Next.js and deploy the repository root. No environment variables or backend integrations are required.

All contacts are fictional. Email addresses use example.com; no phone numbers are seeded. Market and launch figures are examples. Campaign sends, replies and AI work are simulations. Edits stay in the current browser, not on a server.

Read [the HandyOS UI review](docs/HANDYOS-UI-REVIEW.md), [the design system](DESIGN.md), [Lofty research](docs/LOFTY-RESEARCH.md) and [architecture / next integrations](ARCHITECTURE.md).
