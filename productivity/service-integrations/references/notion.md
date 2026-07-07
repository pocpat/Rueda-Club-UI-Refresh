1|---
2|name: notion
3|description: "Manage notes and knowledge bases via Notion API + ntn CLI, or Obsidian vault filesystem. Pages, databases, markdown, Workers, vault search/edit."
4|version: 3.0.0
5|author: community
6|license: MIT
7|platforms: [linux, macos, windows]
8|prerequisites:
9|  env_vars: [NOTION_API_KEY]
10|metadata:
11|  hermes:
12|    tags: [Notion, Obsidian, Productivity, Notes, Database, API, CLI, Workers, Knowledge-Base, Vault]
13|    homepage: https://developers.notion.com
14|---
15|
16|# Notion
17|
18|Talk to Notion two ways. Same integration token works for both — pick by what's available.
19|
20|◆ **`ntn` CLI** — Notion's official CLI. Shorter syntax, one-line file uploads, required for Workers. macOS + Linux only as of May 2026 (Windows support "coming soon"). **Default when installed.**
21|◆ **HTTP + curl** — works everywhere including Windows. **Default fallback** when `ntn` isn't installed.
22|
23|## Setup
24|
25|### 1. Get an integration token (required for both paths)
26|
27|1. Create an integration at https://notion.so/my-integrations
28|2. Copy the API key (starts with `ntn_` or `secret_`)
29|3. Store in `${HERMES_HOME:-~/.hermes}/.env`:
30|   ```
31|   NOTION_API_KEY=ntn_your_key_here
32|   ```
33|4. **Share target pages/databases with the integration** in Notion: page menu `...` → `Connect to` → your integration name. Without this, the API returns 404 for that page even though it exists.
34|
35|### 2. Install `ntn` (preferred path on macOS / Linux)
36|
37|```bash
38|# Recommended
39|curl -fsSL https://ntn.dev | bash
40|
41|# Or via npm (needs Node 22+, npm 10+)
42|npm install --global ntn
43|
44|ntn --version    # verify
45|```
46|
47|**Skip `ntn login` — use the integration token instead.** This works headlessly, no browser needed:
48|```bash
49|export NOTION_API_TOKEN=$NOTION_API_KEY      # ntn reads NOTION_API_TOKEN
50|export NOTION_KEYRING=0                       # don't try to use the OS keychain
51|```
52|
53|Add those exports to your shell profile (or to `${HERMES_HOME:-~/.hermes}/.env`) so every session inherits them.
54|
55|### 3. Choose path at runtime
56|
57|```bash
58|if command -v ntn >/dev/null 2>&1; then
59|  # use ntn
60|else
61|  # fall back to curl
62|fi
63|```
64|
65|Windows users: skip step 2 entirely until native `ntn` ships — Path B works fine. If you want CLI ergonomics now, install `ntn` inside WSL2.
66|
67|## API Basics
68|
69|`Notion-Version: 2025-09-03` is required on all HTTP requests. `ntn` handles this for you. In this version, what users call "databases" are called **data sources** in the API.
70|
71|## Path A — `ntn` CLI (preferred, macOS / Linux)
72|
73|### Raw API calls (shorthand for curl)
74|```bash
75|ntn api v1/users                                  # GET
76|ntn api v1/pages parent[page_id]=abc123 \         # POST with inline body
77|  properties[title][0][text][content]="Notes"
78|ntn api v1/pages/abc123 -X PATCH archived:=true   # PATCH; := is non-string (bool/num/null)
79|```
80|
81|Syntax notes:
82|- `key=value` — string fields
83|- `key[nested]=value` — nested object fields
84|- `key:=value` — typed assignment (booleans, numbers, null, arrays)
85|
86|### Search
87|```bash
88|ntn api v1/search query="page title"
89|```
90|
91|### Read page metadata
92|```bash
93|ntn api v1/pages/{page_id}
94|```
95|
96|### Read page as Markdown (agent-friendly)
97|```bash
98|ntn api v1/pages/{page_id}/markdown
99|```
100|
101|### Read page content as blocks
102|```bash
103|ntn api v1/blocks/{page_id}/children
104|```
105|
106|### Create page from Markdown
107|```bash
108|ntn api v1/pages \
109|  parent[page_id]=xxx \
110|  properties[title][0][text][content]="Notes from meeting" \
111|  markdown="# Agenda
112|
113|- Q3 roadmap
114|- Hiring"
115|```
116|
117|### Patch a page with Markdown
118|```bash
119|ntn api v1/pages/{page_id}/markdown -X PATCH \
120|  markdown="## Update
121|
122|Shipped the prototype."
123|```
124|
125|### Query a database (data source)
126|```bash
127|ntn api v1/data_sources/{data_source_id}/query -X POST \
128|  filter[property]=Status filter[select][equals]=Active
129|```
130|
131|For complex queries with `sorts`, multiple filter clauses, or compound logic, pipe JSON in:
132|```bash
133|echo '{"filter": {"property": "Status", "select": {"equals": "Active"}}, "sorts": [{"property": "Date", "direction": "descending"}]}' | \
134|  ntn api v1/data_sources/{data_source_id}/query -X POST --json -
135|```
136|
137|### File uploads (one-liner — biggest CLI win)
138|```bash
139|ntn files create < photo.png
140|ntn files create --external-url https://example.com/photo.png
141|ntn files list
142|```
143|
144|Compare to the 3-step HTTP flow (create upload → PUT bytes → reference).
145|
146|### Useful env vars
147|| Var | Effect |
148||---|---|
149|| `NOTION_API_TOKEN` | Auth token (overrides keychain) — set this to your integration token |
150|| `NOTION_KEYRING=0` | File-based creds at `~/.config/notion/auth.json` instead of OS keychain |
151|| `NOTION_WORKSPACE_ID` | Skip the workspace picker prompt |
152|
153|## Path B — HTTP + curl (cross-platform, default on Windows)
154|
155|All requests share this pattern:
156|
157|```bash
158|curl -s -X GET "https://api.notion.com/v1/..." \
159|  -H "Authorization: Bearer *** \
160|  -H "Notion-Version: 2025-09-03" \
161|  -H "Content-Type: application/json"
162|```
163|
164|On Windows the `curl` shipped with Windows 10+ works as-is. PowerShell users can also use `Invoke-RestMethod`.
165|
166|### Search
167|```bash
168|curl -s -X POST "https://api.notion.com/v1/search" \
169|  -H "Authorization: Bearer *** \
170|  -H "Notion-Version: 2025-09-03" \
171|  -H "Content-Type: application/json" \
172|  -d '{"query": "page title"}'
173|```
174|
175|### Read page metadata
176|```bash
177|curl -s "https://api.notion.com/v1/pages/{page_id}" \
178|  -H "Authorization: Bearer *** \
179|  -H "Notion-Version: 2025-09-03"
180|```
181|
182|### Read page as Markdown (agent-friendly)
183|
184|Easier to feed to a model than block JSON.
185|
186|```bash
187|curl -s "https://api.notion.com/v1/pages/{page_id}/markdown" \
188|  -H "Authorization: Bearer *** \
189|  -H "Notion-Version: 2025-09-03"
190|```
191|
192|### Read page content as blocks (when you need structure)
193|```bash
194|curl -s "https://api.notion.com/v1/blocks/{page_id}/children" \
195|  -H "Authorization: Bearer *** \
196|  -H "Notion-Version: 2025-09-03"
197|```
198|
199|### Create page from Markdown
200|
201|`POST /v1/pages` accepts a `markdown` body param.
202|
203|```bash
204|curl -s -X POST "https://api.notion.com/v1/pages" \
205|  -H "Authorization: Bearer *** \
206|  -H "Notion-Version: 2025-09-03" \
207|  -H "Content-Type: application/json" \
208|  -d '{
209|    "parent": {"page_id": "xxx"},
210|    "properties": {"title": [{"text": {"content": "Notes from meeting"}}]},
211|    "markdown": "# Agenda\n\n- Q3 roadmap\n- Hiring\n\n## Decisions\n- Ship MVP Friday"
212|  }'
213|```
214|
215|### Patch a page with Markdown
216|```bash
217|curl -s -X PATCH "https://api.notion.com/v1/pages/{page_id}/markdown" \
218|  -H "Authorization: Bearer *** \
219|  -H "Notion-Version: 2025-09-03" \
220|  -H "Content-Type: application/json" \
221|  -d '{"markdown": "## Update\n\nShipped the prototype."}'
222|```
223|
224|### Create page in a database (typed properties)
225|```bash
226|curl -s -X POST "https://api.notion.com/v1/pages" \
227|  -H "Authorization: Bearer *** \
228|  -H "Notion-Version: 2025-09-03" \
229|  -H "Content-Type: application/json" \
230|  -d '{
231|    "parent": {"database_id": "xxx"},
232|    "properties": {
233|      "Name": {"title": [{"text": {"content": "New Item"}}]},
234|      "Status": {"select": {"name": "Todo"}}
235|    }
236|  }'
237|```
238|
239|### Query a database (data source)
240|```bash
241|curl -s -X POST "https://api.notion.com/v1/data_sources/{data_source_id}/query" \
242|  -H "Authorization: Bearer *** \
243|  -H "Notion-Version: 2025-09-03" \
244|  -H "Content-Type: application/json" \
245|  -d '{
246|    "filter": {"property": "Status", "select": {"equals": "Active"}},
247|    "sorts": [{"property": "Date", "direction": "descending"}]
248|  }'
249|```
250|
251|### Create a database
252|```bash
253|curl -s -X POST "https://api.notion.com/v1/data_sources" \
254|  -H "Authorization: Bearer *** \
255|  -H "Notion-Version: 2025-09-03" \
256|  -H "Content-Type: application/json" \
257|  -d '{
258|    "parent": {"page_id": "xxx"},
259|    "title": [{"text": {"content": "My Database"}}],
260|    "properties": {
261|      "Name": {"title": {}},
262|      "Status": {"select": {"options": [{"name": "Todo"}, {"name": "Done"}]}},
263|      "Date": {"date": {}}
264|    }
265|  }'
266|```
267|
268|### Update page properties
269|```bash
270|curl -s -X PATCH "https://api.notion.com/v1/pages/{page_id}" \
271|  -H "Authorization: Bearer *** \
272|  -H "Notion-Version: 2025-09-03" \
273|  -H "Content-Type: application/json" \
274|  -d '{"properties": {"Status": {"select": {"name": "Done"}}}}'
275|```
276|
277|### Append blocks to a page
278|```bash
279|curl -s -X PATCH "https://api.notion.com/v1/blocks/{page_id}/children" \
280|  -H "Authorization: Bearer *** \
281|  -H "Notion-Version: 2025-09-03" \
282|  -H "Content-Type: application/json" \
283|  -d '{
284|    "children": [
285|      {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "Hello from Hermes!"}}]}}
286|    ]
287|  }'
288|```
289|
290|### File uploads (3-step flow)
291|```bash
292|# 1. Create upload
293|curl -s -X POST "https://api.notion.com/v1/file_uploads" \
294|  -H "Authorization: Bearer *** \
295|  -H "Notion-Version: 2025-09-03" \
296|  -H "Content-Type: application/json" \
297|  -d '{"filename": "photo.png", "content_type": "image/png"}'
298|
299|# 2. PUT bytes to the upload_url returned above
300|curl -s -X PUT "{upload_url}" --data-binary @photo.png
301|
302|# 3. Reference {file_upload_id} in a page/block payload
303|```
304|
305|## Property Types
306|
307|Common property formats for database items:
308|
309|- **Title:** `{"title": [{"text": {"content": "..."}}]}`
310|- **Rich text:** `{"rich_text": [{"text": {"content": "..."}}]}`
311|- **Select:** `{"select": {"name": "Option"}}`
312|- **Multi-select:** `{"multi_select": [{"name": "A"}, {"name": "B"}]}`
313|- **Date:** `{"date": {"start": "2026-01-15", "end": "2026-01-16"}}`
314|- **Checkbox:** `{"checkbox": true}`
315|- **Number:** `{"number": 42}`
316|- **URL:** `{"url": "https://..."}`
317|- **Email:** `{"email": "user@example.com"}`
318|- **Relation:** `{"relation": [{"id": "page_id"}]}`
319|
320|## API Version 2025-09-03 — Databases vs Data Sources
321|
322|- **Databases became data sources.** Use `/data_sources/` endpoints for queries and retrieval.
323|- **Two IDs per database:** `database_id` and `data_source_id`.
324|  - `database_id` when creating pages: `parent: {"database_id": "..."}`
325|  - `data_source_id` when querying: `POST /v1/data_sources/{id}/query`
326|- Search returns databases as `"object": "data_source"` with the `data_source_id` field.
327|
328|## Notion Workers (advanced, requires `ntn`)
329|
330|Workers are TypeScript programs Notion hosts for you. One worker can expose any combination of:
331|- **Syncs** — pull data from external APIs into a Notion database on a schedule (default 30 min).
332|- **Tools** — appear as callable tools inside Notion's Custom Agents.
333|- **Webhooks** — receive HTTP events from external services (GitHub, Stripe, etc.) and act in Notion.
334|
335|**Plan / platform gating:**
336|- CLI works on all plans. **Deploying Workers requires Business or Enterprise.**
337|- `ntn` is macOS/Linux only as of May 2026. Windows users need WSL2 or to wait for native support.
338|- Free through August 11, 2026; metered on Notion credits after.
339|
340|### Minimal Worker
341|
342|```bash
343|ntn workers new my-worker      # scaffold
344|cd my-worker
345|# Edit src/index.ts
346|ntn workers deploy --name my-worker
347|```
348|
349|`src/index.ts`:
350|```typescript
351|import { Worker } from "@notionhq/workers";
352|
353|const worker = new Worker();
354|export default worker;
355|
356|worker.tool("greet", {
357|  title: "Greet a User",
358|  description: "Returns a friendly greeting",
359|  inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
360|  execute: async ({ name }) => `Hello, ${name}!`,
361|});
362|```
363|
364|### Webhook capability
365|
366|```typescript
367|worker.webhook("onGithubPush", {
368|  title: "GitHub Push Handler",
369|  execute: async (events, { notion }) => {
370|    for (const event of events) {
371|      // event.body, event.rawBody (for signature verification), event.headers
372|      console.log("got delivery", event.deliveryId);
373|    }
374|  },
375|});
376|```
377|
378|After deploy: `ntn workers webhooks list` shows the URL Notion generates. Treat that URL as a secret — anyone with it can POST events unless you add signature verification.
379|
380|### Worker lifecycle commands
381|
382|```bash
383|ntn workers deploy
384|ntn workers list
385|ntn workers exec <capability-key> -d '{"name": "world"}'
386|ntn workers sync trigger <key>            # run a sync now
387|ntn workers sync pause <key>
388|ntn workers env set GITHUB_WEBHOOK_SECRET=...
389|ntn workers runs list                     # recent invocations
390|ntn workers runs logs <run-id>
391|ntn workers webhooks list
392|```
393|
394|When asked to build a Worker, scaffold with `ntn workers new`, write the code in `src/index.ts`, set any secrets with `ntn workers env set`, and deploy. Notion's docs at https://developers.notion.com/workers cover the full API surface.
395|
396|## Notion-Flavored Markdown (used by `/markdown` endpoints)
397|
398|Standard CommonMark plus XML-like tags for Notion-specific blocks. Use **tabs** for indentation.
399|
400|**Blocks beyond CommonMark:**
401|```
402|<callout icon="🎯" color="blue_bg">
403|	Ship the MVP by **Friday**.
404|</callout>
405|
406|<details color="gray">
407|<summary>Toggle title</summary>
408|	Children indented one tab
409|</details>
410|
411|<columns>
412|	<column>Left side</column>
413|	<column>Right side</column>
414|</columns>
415|
416|<table_of_contents color="gray"/>
417|```
418|
419|**Inline:**
420|- Mentions: `<mention-user url="..."/>`, `<mention-page url="...">Title</mention-page>`, `<mention-date start="2026-05-15"/>`
421|- Underline: `<span underline="true">text</span>`
422|- Color: `<span color="blue">text</span>` or block-level `{color="blue"}` on the first line
423|- Math: inline `$x^2$`, block `$$ ... $$`
424|- Citations: `[^https://example.com]`
425|
426|**Colors:** `gray brown orange yellow green blue purple pink red`, plus `*_bg` variants for backgrounds.
427|
428|Headings 5/6 collapse to H4. Multiple `>` lines render as separate quote blocks — use `<br>` inside a single `>` for multi-line quotes.
429|
430|## Choosing the Right Path
431|
432|| Task | mac / Linux | Windows |
433||---|---|---|
434|| Read/write pages, search, query databases | `ntn api ...` | curl |
435|| Read a page for an agent to summarize | `ntn api v1/pages/{id}/markdown` | curl `/markdown` endpoint |
436|| Upload a file | `ntn files create < file` | 3-step HTTP flow |
437|| One-off API exploration | `ntn api ...` | curl |
438|| Build a sync / webhook / agent tool hosted by Notion | `ntn workers ...` | WSL2 + `ntn workers ...` |
439|
440|## Notes
441|
442|- Page/database IDs are UUIDs (with or without dashes — both accepted).
443|- Rate limit: ~3 requests/second average. The CLI doesn't bypass this.
444|- The API cannot set database **view** filters — that's UI-only.
445|- Use `"is_inline": true` when creating data sources to embed them in a page.
446|- Always pass `-s` to curl to suppress progress bars (cleaner agent output).
447|- Pipe JSON through `jq` when reading: `... | jq '.results[0].properties'`.
448|- Notion also ships an MCP server now (`Notion MCP`, ~91% more token-efficient on DB ops than the previous version) — wire it via Hermes' MCP support if you want streaming Notion access from inside a session, but the paths above are enough for most one-shot tasks.
449|
450|---
451|
452|## Obsidian Vault — Filesystem-First Note Management
453|
454|Read, search, create, and edit notes in an Obsidian vault. Use this when the user works with a local Obsidian vault rather than (or alongside) Notion.
455|
456|### Vault path
457|
458|Use a known or resolved vault path before calling file tools.
459|
460|The documented vault-path convention is the `OBSIDIAN_VAULT_PATH` environment variable, for example from `${HERMES_HOME:-~/.hermes}/.env`. If it is unset, use `~/Documents/Obsidian Vault`.
461|
462|File tools do not expand shell variables. Do not pass paths containing `$OBSIDIAN_VAULT_PATH` to `read_file`, `write_file`, `patch`, or `search_files`; resolve the vault path first and pass a concrete absolute path. Vault paths may contain spaces, which is another reason to prefer file tools over shell commands.
463|
464|If the vault path is unknown, `terminal` is acceptable for resolving `OBSIDIAN_VAULT_PATH` or checking whether the fallback path exists. Once the path is known, switch back to file tools.
465|
466|### Read a note
467|
468|Use `read_file` with the resolved absolute path to the note. Prefer this over `cat` because it provides line numbers and pagination.
469|
470|### List notes
471|
472|Use `search_files` with `target: "files"` and the resolved vault path.
473|
474|- To list all markdown notes, use `pattern: "*.md"` under the vault path.
475|- To list a subfolder, search under that subfolder's absolute path.
476|
477|### Search
478|
479|Use `search_files` for both filename and content searches.
480|
481|- For filenames, use `search_files` with `target: "files"` and a filename `pattern`.
482|- For note contents, use `search_files` with `target: "content"`, the content regex as `pattern`, and `file_glob: "*.md"` to restrict to markdown notes.
483|
484|### Create a note
485|
486|Use `write_file` with the resolved absolute path and the full markdown content. Prefer this over shell heredocs or `echo` because it avoids shell quoting issues.
487|
488|### Append to a note
489|
490|- Read the target note with `read_file`.
491|- Use `patch` for an anchored append when there is stable context (adding a section after an existing heading).
492|- Use `write_file` when rewriting the whole note is clearer than constructing a fragile patch.
493|
494|### Targeted edits
495|
496|Use `patch` for focused note changes when the current content gives you stable context.
497|
498|### Wikilinks
499|
500|Obsidian links notes with `[[Note Name]]` syntax. When creating notes, use these to link related content.
501|