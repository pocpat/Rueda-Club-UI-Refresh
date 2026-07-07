1|---
2|name: teams-meeting-pipeline
3|description: "Operate the Teams meeting summary pipeline via Hermes CLI — summarize meetings, inspect pipeline status, replay jobs, manage Microsoft Graph subscriptions."
4|version: 1.1.0
5|author: Hermes Agent + Teknium
6|license: MIT
7|prerequisites:
8|  env_vars: [MSGRAPH_TENANT_ID, MSGRAPH_CLIENT_ID, MSGRAPH_CLIENT_SECRET]
9|  commands: [hermes]
10|metadata:
11|  hermes:
12|    tags: [Teams, Microsoft Graph, Meetings, Productivity, Operations]
13|    related_docs:
14|      - /docs/guides/microsoft-graph-app-registration
15|      - /docs/user-guide/messaging/teams-meetings
16|      - /docs/guides/operate-teams-meeting-pipeline
17|---
18|
19|# Teams Meeting Pipeline
20|
21|Use this skill whenever the user asks about Microsoft Teams meeting summaries, transcripts, recordings, action items, Graph subscriptions, or any operational question about the Teams meeting pipeline. Works in any language — the triggers below are examples, not an exhaustive list.
22|
23|Everything operator-facing is a `hermes teams-pipeline` subcommand run via the terminal tool. There are no new model tools for this pipeline — the CLI is the surface.
24|
25|## When to use this skill
26|
27|The user is asking to:
28|- summarize a Teams meeting / extract action items / pull meeting notes
29|- check pipeline status, inspect a stored meeting job, or see recent meetings
30|- replay / re-run a stored job that failed or needs a fresh summary
31|- validate Microsoft Graph setup after changing env or config
32|- troubleshoot "meeting summary never arrived" or "no new meetings are ingesting"
33|- manage Graph webhook subscriptions (create, renew, delete, inspect)
34|- set up automated subscription renewal (see pitfall below)
35|
36|Multilingual trigger examples (not exhaustive):
37|- English: "summarize the Teams meeting", "pipeline status", "replay job X"
38|- Turkish: "Teams meeting özetle", "action item çıkar", "toplantı notu", "pipeline durumu", "replay job"
39|
40|## Prerequisites
41|
42|Before using the pipeline, verify these are set in `${HERMES_HOME:-~/.hermes}/.env`:
43|
44|```bash
45|MSGRAPH_TENANT_ID=...
46|MSGRAPH_CLIENT_ID=...
47|MSGRAPH_CLIENT_SECRET=...
48|```
49|
50|If any are missing, direct the user to the Azure app registration guide at `/docs/guides/microsoft-graph-app-registration` — they need an Azure AD app registration with admin-consented Graph application permissions before the pipeline will work.
51|
52|## Command reference
53|
54|### Status and inspection (start here)
55|
56|```bash
57|hermes teams-pipeline validate              # config snapshot — run first after any change
58|hermes teams-pipeline token-health          # Graph token status
59|hermes teams-pipeline token-health --force-refresh   # force a fresh token acquisition
60|hermes teams-pipeline list                  # recent meeting jobs
61|hermes teams-pipeline list --status failed  # only failed jobs
62|hermes teams-pipeline show <job-id>         # full detail of one job
63|hermes teams-pipeline subscriptions         # current Graph webhook subscriptions
64|```
65|
66|### Re-running / debugging
67|
68|```bash
69|hermes teams-pipeline run <job-id>          # replay a stored job (re-summarize, re-deliver)
70|hermes teams-pipeline fetch --meeting-id <id>   # dry-run: resolve meeting + transcript without persisting
71|hermes teams-pipeline fetch --join-web-url "<url>"   # dry-run by join URL
72|```
73|
74|### Subscription management
75|
76|```bash
77|hermes teams-pipeline subscribe \
78|  --resource communications/onlineMeetings/getAllTranscripts \
79|  --notification-url https://<your-public-host>/msgraph/webhook \
80|  --client-state "$MSGRAPH_WEBHOOK_CLIENT_STATE"
81|
82|hermes teams-pipeline renew-subscription <sub-id> --expiration <iso-8601>
83|hermes teams-pipeline delete-subscription <sub-id>
84|hermes teams-pipeline maintain-subscriptions            # renew near-expiry ones
85|hermes teams-pipeline maintain-subscriptions --dry-run  # show what would be renewed
86|```
87|
88|## Decision tree for common asks
89|
90|- User asks "why didn't I get a summary for today's meeting?" → start with `list --status failed`, then `show <job-id>` on the relevant row. If the job doesn't exist at all, check `subscriptions` — the webhook may have expired (see pitfall below).
91|- User asks "is setup working?" → `validate`, then `token-health`, then `subscriptions`. If all three pass, request a test meeting and check `list` for a fresh row.
92|- User asks "re-run summary for meeting X" → `list` to find the job ID, `run <job-id>` to replay. If it fails again, `show <job-id>` to inspect the error and `fetch --meeting-id` to dry-run the artifact resolution.
93|- User asks "add meeting X to the pipeline" → usually you don't — the pipeline is subscription-driven, not per-meeting. If they want a specific past meeting summarized, use `fetch` to pull transcript + `run` after a job is created.
94|
95|## Critical pitfall: Graph subscriptions expire in 72 hours
96|
97|Microsoft Graph caps webhook subscriptions at 72 hours and **will not auto-renew them**. If `maintain-subscriptions` is not scheduled, meeting notifications silently stop arriving 3 days after any manual subscription creation.
98|
99|When the user reports "the pipeline worked yesterday but nothing is arriving today":
100|1. Run `hermes teams-pipeline subscriptions` — if it's empty or all entries show `expirationDateTime` in the past, that's the cause.
101|2. Recreate with `subscribe` as shown above.
102|3. **Set up automated renewal immediately** via `hermes cron add`, a systemd timer, or plain crontab. The operator runbook at `/docs/guides/operate-teams-meeting-pipeline#automating-subscription-renewal-required-for-production` has all three options. 12-hour interval is safe (6x headroom against the 72h limit).
103|
104|## Other pitfalls
105|
106|- **Transcript not available yet.** Teams takes some time after a meeting ends to generate the transcript artifact. `fetch --meeting-id` on a just-ended meeting may return empty. Wait 2-5 minutes and retry, or let the Graph webhook drive ingestion naturally.
107|- **Delivery mode mismatch.** If summaries are produced (`list` shows success) but nothing lands in Teams, check `platforms.teams.extra.delivery_mode` and the matching target config (`incoming_webhook_url` OR `chat_id` OR `team_id`+`channel_id`). The writer reads these from config.yaml or `TEAMS_*` env vars.
108|- **Graph app permissions.** A token acquires cleanly (`token-health` passes) but Graph API calls return 401/403 when permissions were added but admin consent wasn't re-granted. Have the user revisit the app registration in the Azure portal and click "Grant admin consent" again.
109|
110|## Related docs
111|
112|Point the user to these when they need more depth than this skill covers:
113|- Azure app registration walkthrough: `/docs/guides/microsoft-graph-app-registration`
114|- Full pipeline setup: `/docs/user-guide/messaging/teams-meetings`
115|- Operator runbook (renewal automation, troubleshooting, go-live checklist): `/docs/guides/operate-teams-meeting-pipeline`
116|- Webhook listener setup: `/docs/user-guide/messaging/msgraph-webhook`
117|