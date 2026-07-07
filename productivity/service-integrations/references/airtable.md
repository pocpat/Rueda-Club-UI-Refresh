1|---
2|name: airtable
3|description: Airtable REST API via curl. Records CRUD, filters, upserts.
4|version: 1.1.0
5|author: community
6|license: MIT
7|platforms: [linux, macos, windows]
8|prerequisites:
9|  env_vars: [AIRTABLE_API_KEY]
10|  commands: [curl]
11|metadata:
12|  hermes:
13|    tags: [Airtable, Productivity, Database, API]
14|    homepage: https://airtable.com/developers/web/api/introduction
15|---
16|
17|# Airtable — Bases, Tables & Records
18|
19|Work with Airtable's REST API directly via `curl` using the `terminal` tool. No MCP server, no OAuth flow, no Python SDK — just `curl` and a personal access token.
20|
21|## Prerequisites
22|
23|1. Create a **Personal Access Token (PAT)** at https://airtable.com/create/tokens (tokens start with `pat...`).
24|2. Grant these scopes (minimum):
25|   - `data.records:read` — read rows
26|   - `data.records:write` — create / update / delete rows
27|   - `schema.bases:read` — list bases and tables
28|3. **Important:** in the same token UI, add each base you want to access to the token's **Access** list. PATs are scoped per-base — a valid token on the wrong base returns `403`.
29|4. Store the token in `${HERMES_HOME:-~/.hermes}/.env` (or via `hermes setup`):
30|   ```
31|   AIRTABLE_API_KEY=pat_your_token_here
32|   ```
33|
34|> Note: legacy `key...` API keys were deprecated Feb 2024. Only PATs and OAuth tokens work now.
35|
36|## API Basics
37|
38|- **Endpoint:** `https://api.airtable.com/v0`
39|- **Auth header:** `Authorization: Bearer $AIRTA...KEY`
40|- **All requests** use JSON (`Content-Type: application/json` for any POST/PATCH/PUT body).
41|- **Object IDs:** bases `app...`, tables `tbl...`, records `rec...`, fields `fld...`. IDs never change; names can. Prefer IDs in automations.
42|- **Rate limit:** 5 requests/sec/base. `429` → back off. Burst on a single base will be throttled.
43|
44|Base curl pattern:
45|```bash
46|curl -s "https://api.airtable.com/v0/$BASE_ID/$TABLE?maxRecords=5" \
47|  -H "Authorization: Bearer $AIRTA...KEY" | python3 -m json.tool
48|```
49|
50|`-s` suppresses curl's progress bar — keep it set for every call so the tool output stays clean for Hermes. Pipe through `python3 -m json.tool` (always present) or `jq` (if installed) for readable JSON.
51|
52|## Field Types (request body shapes)
53|
54|| Field type | Write shape |
55||---|---|
56|| Single line text | `"Name": "hello"` |
57|| Long text | `"Notes": "multi\nline"` |
58|| Number | `"Score": 42` |
59|| Checkbox | `"Done": true` |
60|| Single select | `"Status": "Todo"` (name must already exist unless `typecast: true`) |
61|| Multi-select | `"Tags": ["urgent", "bug"]` |
62|| Date | `"Due": "2026-04-01"` |
63|| DateTime (UTC) | `"At": "2026-04-01T14:30:00.000Z"` |
64|| URL / Email / Phone | `"Link": "https://…"` |
65|| Attachment | `"Files": [{"url": "https://…"}]` (Airtable fetches + rehosts) |
66|| Linked record | `"Owner": ["recXXXXXXXXXXXXXX"]` (array of record IDs) |
67|| User | `"AssignedTo": {"id": "usrXXXXXXXXXXXXXX"}` |
68|
69|Pass `"typecast": true` at the top level of a create/update body to let Airtable auto-coerce values (e.g. create a new select option on the fly, convert `"42"` → `42`).
70|
71|## Common Queries
72|
73|### List bases the token can see
74|```bash
75|curl -s "https://api.airtable.com/v0/meta/bases" \
76|  -H "Authorization: Bearer $AIRTA...KEY" | python3 -m json.tool
77|```
78|
79|### List tables + schema for a base
80|```bash
81|curl -s "https://api.airtable.com/v0/meta/bases/$BASE_ID/tables" \
82|  -H "Authorization: Bearer $AIRTA...KEY" | python3 -m json.tool
83|```
84|Use this BEFORE mutating — confirms exact field names and IDs, surfaces `options.choices` for select fields, and shows primary-field names.
85|
86|### List records (first 10)
87|```bash
88|curl -s "https://api.airtable.com/v0/$BASE_ID/$TABLE?maxRecords=10" \
89|  -H "Authorization: Bearer $AIRTA...KEY" | python3 -m json.tool
90|```
91|
92|### Get a single record
93|```bash
94|curl -s "https://api.airtable.com/v0/$BASE_ID/$TABLE/$RECORD_ID" \
95|  -H "Authorization: Bearer $AIRTA...KEY" | python3 -m json.tool
96|```
97|
98|### Filter records (filterByFormula)
99|Airtable formulas must be URL-encoded. Let Python stdlib do it — never hand-encode:
100|```bash
101|FORMULA="{Status}='Todo'"
102|ENC=$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$FORMULA")
103|curl -s "https://api.airtable.com/v0/$BASE_ID/$TABLE?filterByFormula=$ENC&maxRecords=20" \
104|  -H "Authorization: Bearer $AIRTA...KEY" | python3 -m json.tool
105|```
106|
107|Useful formula patterns:
108|- Exact match: `{Email}='user@example.com'`
109|- Contains: `FIND('bug', LOWER({Title}))`
110|- Multiple conditions: `AND({Status}='Todo', {Priority}='High')`
111|- Or: `OR({Owner}='alice', {Owner}='bob')`
112|- Not empty: `NOT({Assignee}='')`
113|- Date comparison: `IS_AFTER({Due}, TODAY())`
114|
115|### Sort + select specific fields
116|```bash
117|curl -s "https://api.airtable.com/v0/$BASE_ID/$TABLE?sort%5B0%5D%5Bfield%5D=Priority&sort%5B0%5D%5Bdirection%5D=asc&fields%5B%5D=Name&fields%5B%5D=Status" \
118|  -H "Authorization: Bearer $AIRTA...KEY" | python3 -m json.tool
119|```
120|Square brackets in query params MUST be URL-encoded (`%5B` / `%5D`).
121|
122|### Use a named view
123|```bash
124|curl -s "https://api.airtable.com/v0/$BASE_ID/$TABLE?view=Grid%20view&maxRecords=50" \
125|  -H "Authorization: Bearer $AIRTA...KEY" | python3 -m json.tool
126|```
127|Views apply their saved filter + sort server-side.
128|
129|## Common Mutations
130|
131|### Create a record
132|```bash
133|curl -s -X POST "https://api.airtable.com/v0/$BASE_ID/$TABLE" \
134|  -H "Authorization: Bearer $AIRTA...KEY" \
135|  -H "Content-Type: application/json" \
136|  -d '{"fields":{"Name":"New task","Status":"Todo","Priority":"High"}}' | python3 -m json.tool
137|```
138|
139|### Create up to 10 records in one call
140|```bash
141|curl -s -X POST "https://api.airtable.com/v0/$BASE_ID/$TABLE" \
142|  -H "Authorization: Bearer $AIRTA...KEY" \
143|  -H "Content-Type: application/json" \
144|  -d '{
145|    "typecast": true,
146|    "records": [
147|      {"fields": {"Name": "Task A", "Status": "Todo"}},
148|      {"fields": {"Name": "Task B", "Status": "In progress"}}
149|    ]
150|  }' | python3 -m json.tool
151|```
152|Batch endpoints are capped at **10 records per request**. For larger inserts, loop in batches of 10 with a short sleep to respect 5 req/sec/base.
153|
154|### Update a record (PATCH — merges, preserves unchanged fields)
155|```bash
156|curl -s -X PATCH "https://api.airtable.com/v0/$BASE_ID/$TABLE/$RECORD_ID" \
157|  -H "Authorization: Bearer $AIRTA...KEY" \
158|  -H "Content-Type: application/json" \
159|  -d '{"fields":{"Status":"Done"}}' | python3 -m json.tool
160|```
161|
162|### Upsert by a merge field (no ID needed)
163|```bash
164|curl -s -X PATCH "https://api.airtable.com/v0/$BASE_ID/$TABLE" \
165|  -H "Authorization: Bearer $AIRTA...KEY" \
166|  -H "Content-Type: application/json" \
167|  -d '{
168|    "performUpsert": {"fieldsToMergeOn": ["Email"]},
169|    "records": [
170|      {"fields": {"Email": "user@example.com", "Status": "Active"}}
171|    ]
172|  }' | python3 -m json.tool
173|```
174|`performUpsert` creates records whose merge-field values are new, patches records whose merge-field values already exist. Great for idempotent syncs.
175|
176|### Delete a record
177|```bash
178|curl -s -X DELETE "https://api.airtable.com/v0/$BASE_ID/$TABLE/$RECORD_ID" \
179|  -H "Authorization: Bearer $AIRTA...KEY" | python3 -m json.tool
180|```
181|
182|### Delete up to 10 records in one call
183|```bash
184|curl -s -X DELETE "https://api.airtable.com/v0/$BASE_ID/$TABLE?records%5B%5D=rec1&records%5B%5D=rec2" \
185|  -H "Authorization: Bearer $AIRTA...KEY" | python3 -m json.tool
186|```
187|
188|## Pagination
189|
190|List endpoints return at most **100 records per page**. If the response includes `"offset": "..."`, pass it back on the next call. Loop until the field is absent:
191|
192|```bash
193|OFFSET=""
194|while :; do
195|  URL="https://api.airtable.com/v0/$BASE_ID/$TABLE?pageSize=100"
196|  [ -n "$OFFSET" ] && URL="$URL&offset=$OFFSET"
197|  RESP=$(curl -s "$URL" -H "Authorization: Bearer $AIRTA...EY")
198|  echo "$RESP" | python3 -c 'import json,sys; d=json.load(sys.stdin); [print(r["id"], r["fields"].get("Name","")) for r in d["records"]]'
199|  OFFSET=$(echo "$RESP" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("offset",""))')
200|  [ -z "$OFFSET" ] && break
201|done
202|```
203|
204|## Typical Hermes Workflow
205|
206|1. **Confirm auth.** `curl -s -o /dev/null -w "%{http_code}\n" https://api.airtable.com/v0/meta/bases -H "Authorization: Bearer $AIRTA...EY"` — expect `200`.
207|2. **Find the base.** List bases (step above) OR ask the user for the `app...` ID directly if the token lacks `schema.bases:read`.
208|3. **Inspect the schema.** `GET /v0/meta/bases/$BASE_ID/tables` — cache the exact field names and primary-field name locally in the session before mutating anything.
209|4. **Read before you write.** For "update X where Y", `filterByFormula` first to resolve the `rec...` ID, then `PATCH /v0/$BASE_ID/$TABLE/$RECORD_ID`. Never guess record IDs.
210|5. **Batch writes.** Combine related creates into one 10-record POST to stay under the 5 req/sec budget.
211|6. **Destructive ops.** Deletions can't be undone via API. If the user says "delete all Xs", echo back the filter + record count and confirm before firing.
212|
213|## Pitfalls
214|
215|- **`filterByFormula` MUST be URL-encoded.** Field names with spaces or non-ASCII also need encoding (`{My Field}` → `%7BMy%20Field%7D`). Use Python stdlib (pattern above) — never hand-escape.
216|- **Empty fields are omitted from responses.** A missing `"Assignee"` key doesn't mean the field doesn't exist — it means this record's value is empty. Check the schema (step 3) before concluding a field is missing.
217|- **PATCH vs PUT.** `PATCH` merges supplied fields into the record. `PUT` replaces the record entirely and clears any field you didn't include. Default to `PATCH`.
218|- **Single-select options must exist.** Writing `"Status": "Shipping"` when `Shipping` isn't in the field's option list errors with `INVALID_MULTIPLE_CHOICE_OPTIONS` unless you pass `"typecast": true` (which auto-creates the option).
219|- **Per-base token scoping.** A `403` on one base while another works means the token's Access list doesn't include that base — not a scope or auth issue. Send the user to https://airtable.com/create/tokens to grant it.
220|- **Rate limits are per base, not per token.** 5 req/sec on `baseA` and 5 req/sec on `baseB` is fine; 6 req/sec on `baseA` alone will throttle. Monitor the `Retry-After` header on `429`.
221|
222|## Important Notes for Hermes
223|
224|- **Always use the `terminal` tool with `curl`.** Do NOT use `web_extract` (it can't send auth headers) or `browser_navigate` (needs UI auth and is slow).
225|- **`AIRTABLE_API_KEY` flows from `${HERMES_HOME:-~/.hermes}/.env` into the subprocess automatically** when this skill is loaded — no need to re-export it before each `curl` call.
226|- **Escape curly braces in formulas carefully.** In a heredoc body, `{Status}` is literal. In a shell argument, `{Status}` is safe outside `{...}` brace-expansion context — but pass dynamic strings through `python3 urllib.parse.quote` before splicing into a URL.
227|- **Pretty-print with `python3 -m json.tool`** (always present) rather than `jq` (optional). Only reach for `jq` when you need filtering/projection.
228|- **Pagination is per-page, not global.** Airtable's 100-record cap is a hard limit; there is no way to bump it. Loop with `offset` until the field is absent.
229|- **Read the `errors` array** on non-2xx responses — Airtable returns structured error codes like `AUTHENTICATION_REQUIRED`, `INVALID_PERMISSIONS`, `MODEL_ID_NOT_FOUND`, `INVALID_MULTIPLE_CHOICE_OPTIONS` that tell you exactly what's wrong.
230|