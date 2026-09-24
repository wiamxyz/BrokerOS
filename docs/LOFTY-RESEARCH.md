# Lofty research and BrokerOS product decisions

Reviewed 24 September 2026. Scope: public product pages and first-party help documentation covering CRM, Cowork, Sales Agent, Homeowner Agent, intelligence/scoring, Smart Plans, dashboards, contact profiles, preferences, transactions, email marketing and mobile. This is a broad product study, not a logged-in evaluation or an exhaustive crawl of every Lofty page. Performance claims on marketing pages were not independently verified and are not reproduced in BrokerOS.

## Findings → product decisions

| Area | Reference finding | BrokerOS decision |
| --- | --- | --- |
| Daily work | Agent dashboard combines opportunities, tasks, appointments and transaction reminders. | Start with a daily priority queue. Summaries derive from the same contacts, deals and tasks users edit. |
| Priority | Scoring is supported by activity and communication evidence. | Prefer explicit reasons and Walid’s three-tier order over a mysterious numerical score. Ready-to-close buyers precede owners, then nurture; due date breaks ties within a tier. |
| Contact context | Profile brings identity, property preferences, conversations, activity, transactions and automation together. | Side-panel record with property, budget, source, next action, notes, call logging, linked deals, owner stage and activity. Buyer/owner can overlap. |
| Cowork | Operational assistant coordinates work across the CRM and escalates decisions. | A bounded approval queue with editable drafts, dismiss/approve states, and contextual links. Demo suggestions are prepared examples, not live AI. |
| Sales Agent | Qualification focuses on needs, budget and timeline, then transfers an informed lead. | Do not mistake campaign interest for a closing buyer. Follow-up tasks qualify launch interest before elevating priority. |
| Homeowner Agent | Property-specific nurture and explicit handoff when owners show intent. | Distinguish a market-email open from a valuation request. The latter pauses nurture and adds a handoff for agent review. |
| Smart Plans | Triggered sequences coordinate channels and may pause on replies. | Show an owner sequence: introduction, building insight, follow-up, handoff. Simulated owner replies pause the sequence; no messages are sent. |
| Campaigns | Campaign list, audience context, content preview and recipient behavior are separate concerns. | Draft launch campaign + selectable segment + individual exclusions + fact-sheet preview + simulated deliveries and interested replies. |
| Deals | Real estate transactions combine property, client, deadlines, milestones and value. | Keep deal stage, AED value, target date, next step, notes and an editable closing checklist together. |
| Market context | Property information supports relevant communication. | Separate Property Finder asking prices from DXB Interact transaction/rent placeholders at building level. No current-data or valuation claim. |
| Mobile | Prioritized lead work and quick actions extend to mobile. | Responsive web, mobile navigation, contextual sheets and an in-app priority notification panel. Native push is deferred. |

## Walid-specific decisions

1. The personal CRM accepts Property Finder, Bayut, company/Bitrix campaigns, referrals, social campaigns, Gmail and manual sources immediately as labels. No connector is falsely shown as connected.
2. The owner pipeline has eight stages: cold owner, contacted, warming, engaged, valuation discussion, listing opportunity, listing won and lost. Active view hides the terminal stages; all-stages view includes them.
3. One person can be an owner and a buyer. A new-launch promotion does not imply a request to sell their existing property.
4. Evidence and a useful next action accompany priority. Human approval and handoff remain visible.
5. Keep scope to a demonstrable front end. Exclude IDX websites, ad buying, brokerage back office, autonomous calling, commission accounting, external scraping and transaction document infrastructure.

## UI patterns carried forward

Persistent section navigation; page-level search and filters; compact status labels; sortable directories; contextual record detail; a common activity history; explicit next-step controls; separate campaign preparation and results; useful empty states. Visual styling follows the requested HandyOS ChatGPT/shadcn mix, not Lofty branding.

## Primary sources

- [Lofty solution suite](https://lofty.com/): public product map and overall positioning.
- [Real estate CRM](https://lofty.com/real-estate/crm): lead context, activity and business reporting.
- [Cowork](https://lofty.com/ai/assistant): operational assistant, daily briefing, action preparation and escalation.
- [AI Sales Agent](https://lofty.com/ai/sales-agent): lead qualification and contextual handoff.
- [Homeowner Agent](https://lofty.com/ai/homeowner-agent): owner nurture, property insight and intent-triggered handoff.
- [Smart Plans](https://lofty.com/feature/smart-plans): sequence triggers, branching, coordinated actions and reply pauses.
- [Operational intelligence](https://lofty.com/feature/crm-intelligence): evidence-informed prioritization.
- [Lead Score and Lead Analysis](https://help.lofty.com/hc/en-us/articles/115003014731-Lead-Score-and-Lead-Analysis): score explanations, communication and web activity.
- [Dashboard overview](https://help.lofty.com/hc/en-us/articles/8472031391131-Dashboard-Overview): agent versus company context and dashboard cards.
- [Lead profile](https://help.lofty.com/hc/en-us/articles/360055290591-Lead-Profile-Page): contact details, sources, activity, properties, transactions and automation.
- [Lead preferences](https://help.lofty.com/hc/en-us/articles/47347302562715-Lead-Preference-Profiles): property preferences on the contact record.
- [Transactions](https://official.lofty.com/feature/transaction): deadlines, milestones and deal value.
- [Email marketing dashboard](https://help.lofty.com/hc/en-us/articles/45980662284571-Email-Marketing-Dashboard): campaign/audience/recipient performance separation.
- [Mobile](https://lofty.com/feature/mobile): portable daily priorities and lead management.
