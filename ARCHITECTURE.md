# BrokerOS architecture

## Delivery pattern

Next.js App Router, React, TypeScript, Tailwind v4 and locally owned shadcn/Radix components. Static export (`out/`) on Vercel, connected to `wiamxyz/BrokerOS` / `main`, following HandyOS. No server functions, database, authentication or environment variables are needed for this demo. The build uses Webpack to avoid a local Turbopack worker-port restriction.

## Domain and persistence

`lib/model.ts` defines contacts, deals, tasks, activities, approval items, campaigns and recipients, plus a fictional seed dataset and pure priority/audience selectors. Contacts have stable IDs, dual buyer/owner roles, acquisition source, building context, next action, outreach preference and nurture status. Deals and tasks reference contact IDs. Contact priority takes precedence when ordering linked tasks; closing, listing and nurture are distinct business categories.

`components/crm-provider.tsx` is the current state boundary. It hydrates a versioned localStorage record after mount, displays a skeleton before hydration, persists changes and surfaces storage failures. It has no external messaging capability. This is browser-local storage, not secure multi-user persistence; real client data should wait for the authenticated backend phase. A reset restores demo records.

UI layers: workspace shell; main CRM views; contact/deal details; form dialogs; campaign/assistant/market/settings views; shared UI primitives. Query links can open known contact/deal IDs. Static pages support direct refresh.

## Later backend seams

Replace provider operations with a repository/service layer while preserving entity IDs and types. Add tenant-scoped database tables, authentication, authorization, validation, migrations, conflict handling and durable audit events. Move campaigns, sender consent, suppression, templates, scheduling, recipient delivery events, retries and idempotency to server-side services before real messaging. Approval must authorize an exact draft and recipient scope.

Lead-source adapters should normalize external IDs, source metadata and ingestion timestamps into contacts without silently duplicating people. Gmail, Property Finder, Bayut, Bitrix and social sources remain unconnected. Store building identifiers, verified timestamps, comparable unit characteristics and licensed source links before showing live market data. No scraping is implemented.

A real assistant should produce structured proposals with evidence and a bounded action type. Only approved operations should execute. A reply/opt-out must pause nurture and cancel pending automation. Campaign interest remains nurture/qualification unless the agent establishes readiness to close. Mobile push needs a separate delivery channel; the current panel is in-app only.

## Assistant demo interactions

`lib/assistant-chat.ts` prepares bounded sample responses from current CRM data. It does not call a model. Conversations, proposals and receipts are stored in the optional `chats` field of the existing workspace record, preserving older browser data. `/chat/?chat=<id>` selects a conversation; record mentions open existing contact/deal sheets.

The pure action transition checks current contact availability, opt-out status, proposal state and edited input. A proposal adds a local reminder, queues an outreach draft or saves an unsent campaign. It records the result in the conversation and assistant activity. Repeat confirmations are rejected; matching reminders are reused. Messages never leave the browser. Automated tests cover the action boundaries and swipe thresholds.
