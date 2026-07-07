1|---
2|name: google-workspace
3|description: "Gmail, Calendar, Drive, Docs, Sheets via gws CLI or Python."
4|version: 1.1.0
5|author: Nous Research
6|license: MIT
7|platforms: [linux, macos, windows]
8|required_credential_files:
9|  - path: google_token.json
10|    description: Google OAuth2 token (created by setup script)
11|  - path: google_client_secret.json
12|    description: Google OAuth2 client credentials (downloaded from Google Cloud Console)
13|metadata:
14|  hermes:
15|    tags: [Google, Gmail, Calendar, Drive, Sheets, Docs, Contacts, Email, OAuth]
16|    homepage: https://github.com/NousResearch/hermes-agent
17|    related_skills: [himalaya]
18|---
19|
20|# Google Workspace
21|
22|Gmail, Calendar, Drive, Contacts, Sheets, and Docs — through Hermes-managed OAuth and a thin CLI wrapper. When `gws` is installed, the skill uses it as the execution backend for broader Google Workspace coverage; otherwise it falls back to the bundled Python client implementation.
23|
24|## References
25|
26|- `references/gmail-search-syntax.md` — Gmail search operators (is:unread, from:, newer_than:, etc.)
27|
28|## Scripts
29|
30|- `scripts/setup.py` — OAuth2 setup (run once to authorize)
31|- `scripts/google_api.py` — compatibility wrapper CLI. It prefers `gws` for operations when available, while preserving Hermes' existing JSON output contract.
32|
33|## First-Time Setup
34|
35|The setup is fully non-interactive — you drive it step by step so it works
36|on CLI, Telegram, Discord, or any platform.
37|
38|Define a shorthand first:
39|
40|```bash
41|GSETUP="python ${HERMES_HOME:-$HOME/.hermes}/skills/productivity/google-workspace/scripts/setup.py"
42|```
43|
44|### Step 0: Check if already set up
45|
46|```bash
47|$GSETUP --check
48|```
49|
50|If it prints `AUTHENTICATED`, skip to Usage — setup is already done.
51|
52|### Step 1: Triage — ask the user what they need
53|
54|Before starting OAuth setup, ask the user TWO questions:
55|
56|**Question 1: "What Google services do you need? Just email, or also
57|Calendar/Drive/Sheets/Docs?"**
58|
59|- **Email only** → They don't need this skill at all. Use the `himalaya` skill
60|  instead — it works with a Gmail App Password (Settings → Security → App
61|  Passwords) and takes 2 minutes to set up. No Google Cloud project needed.
62|  Load the himalaya skill and follow its setup instructions.
63|
64|- **Email + Calendar** → Continue with this skill, but use
65|  `--services email,calendar` during auth so the consent screen only asks for
66|  the scopes they actually need.
67|
68|- **Calendar/Drive/Sheets/Docs only** → Continue with this skill and use a
69|  narrower `--services` set like `calendar,drive,sheets,docs`.
70|
71|- **Full Workspace access** → Continue with this skill and use the default
72|  `all` service set.
73|
74|**Question 2: "Does your Google account use Advanced Protection (hardware
75|security keys required to sign in)? If you're not sure, you probably don't
76|— it's something you would have explicitly enrolled in."**
77|
78|- **No / Not sure** → Normal setup. Continue below.
79|- **Yes** → Their Workspace admin must add the OAuth client ID to the org's
80|  allowed apps list before Step 4 will work. Let them know upfront.
81|
82|### Step 2: Create OAuth credentials (one-time, ~5 minutes)
83|
84|Tell the user:
85|
86|> You need a Google Cloud OAuth client. This is a one-time setup:
87|>
88|> 1. Create or select a project:
89|>    https://console.cloud.google.com/projectselector2/home/dashboard
90|> 2. Enable the required APIs from the API Library:
91|>    https://console.cloud.google.com/apis/library
92|>    Enable: Gmail API, Google Calendar API, Google Drive API,
93|>    Google Sheets API, Google Docs API, People API
94|> 3. Create the OAuth client here:
95|>    https://console.cloud.google.com/apis/credentials
96|>    Credentials → Create Credentials → OAuth 2.0 Client ID
97|> 4. Application type: "Desktop app" → Create
98|> 5. If the app is still in Testing, add the user's Google account as a test user here:
99|>    https://console.cloud.google.com/auth/audience
100|>    Audience → Test users → Add users
101|> 6. Download the JSON file and tell me the file path
102|>
103|> Important Hermes CLI note: if the file path starts with `/`, do NOT send only the bare path as its own message in the CLI, because it can be mistaken for a slash command. Send it in a sentence instead, like:
104|> `The JSON file path is: /home/user/Downloads/client_secret_....json`
105|
106|Once they provide the path:
107|
108|```bash
109|$GSETUP --client-secret /path/to/client_secret.json
110|```
111|
112|If they paste the raw client ID / client secret values instead of a file path,
113|write a valid Desktop OAuth JSON file for them yourself, save it somewhere
114|explicit (for example `~/Downloads/hermes-google-client-secret.json`), then run
115|`--client-secret` against that file.
116|
117|### Step 3: Get authorization URL
118|
119|Use the service set chosen in Step 1. Examples:
120|
121|```bash
122|$GSETUP --auth-url --services email,calendar --format json
123|$GSETUP --auth-url --services calendar,drive,sheets,docs --format json
124|$GSETUP --auth-url --services all --format json
125|```
126|
127|This returns JSON with an `auth_url` field and also saves the exact URL to
128|`~/.hermes/google_oauth_last_url.txt`.
129|
130|Agent rules for this step:
131|- Extract the `auth_url` field and send that exact URL to the user as a single line.
132|- Tell the user that the browser will likely fail on `http://localhost:1` after approval, and that this is expected.
133|- Tell them to copy the ENTIRE redirected URL from the browser address bar.
134|- If the user gets `Error 403: access_denied`, send them directly to `https://console.cloud.google.com/auth/audience` to add themselves as a test user.
135|
136|### Step 4: Exchange the code
137|
138|The user will paste back either a URL like `http://localhost:1/?code=4/0A...&scope=...`
139|or just the code string. Either works. The `--auth-url` step stores a temporary
140|pending OAuth session locally so `--auth-code` can complete the PKCE exchange
141|later, even on headless systems:
142|
143|```bash
144|$GSETUP --auth-code "THE_URL_OR_CODE_THE_USER_PASTED" --format json
145|```
146|
147|If `--auth-code` fails because the code expired, was already used, or came from
148|an older browser tab, it now returns a fresh `fresh_auth_url`. In that case,
149|immediately send the new URL to the user and have them retry with the newest
150|browser redirect only.
151|
152|### Step 5: Verify
153|
154|```bash
155|$GSETUP --check
156|```
157|
158|Should print `AUTHENTICATED`. Setup is complete — token refreshes automatically from now on.
159|
160|### Notes
161|
162|- Token is stored at `~/.hermes/google_token.json` and auto-refreshes.
163|- Pending OAuth session state/verifier are stored temporarily at `~/.hermes/google_oauth_pending.json` until exchange completes.
164|- If `gws` is installed, `google_api.py` points it at the same `~/.hermes/google_token.json` credentials file. Users do not need to run a separate `gws auth login` flow.
165|- To revoke: `$GSETUP --revoke`
166|
167|## Usage
168|
169|All commands go through the API script. Set `GAPI` as a shorthand:
170|
171|```bash
172|GAPI="python ${HERMES_HOME:-$HOME/.hermes}/skills/productivity/google-workspace/scripts/google_api.py"
173|```
174|
175|### Gmail
176|
177|```bash
178|# Search (returns JSON array with id, from, subject, date, snippet)
179|$GAPI gmail search "is:unread" --max 10
180|$GAPI gmail search "from:boss@company.com newer_than:1d"
181|$GAPI gmail search "has:attachment filename:pdf newer_than:7d"
182|
183|# Read full message (returns JSON with body text)
184|$GAPI gmail get MESSAGE_ID
185|
186|# Send
187|$GAPI gmail send --to user@example.com --subject "Hello" --body "Message text"
188|$GAPI gmail send --to user@example.com --subject "Report" --body "<h1>Q4</h1><p>Details...</p>" --html
189|$GAPI gmail send --to user@example.com --subject "Hello" --from '"Research Agent" <user@example.com>' --body "Message text"
190|
191|# Reply (automatically threads and sets In-Reply-To)
192|$GAPI gmail reply MESSAGE_ID --body "Thanks, that works for me."
193|$GAPI gmail reply MESSAGE_ID --from '"Support Bot" <user@example.com>' --body "Thanks"
194|
195|# Labels
196|$GAPI gmail labels
197|$GAPI gmail modify MESSAGE_ID --add-labels LABEL_ID
198|$GAPI gmail modify MESSAGE_ID --remove-labels UNREAD
199|```
200|
201|### Calendar
202|
203|```bash
204|# List events (defaults to next 7 days)
205|$GAPI calendar list
206|$GAPI calendar list --start 2026-03-01T00:00:00Z --end 2026-03-07T23:59:59Z
207|
208|# Create event (ISO 8601 with timezone required)
209|$GAPI calendar create --summary "Team Standup" --start 2026-03-01T10:00:00-06:00 --end 2026-03-01T10:30:00-06:00
210|$GAPI calendar create --summary "Lunch" --start 2026-03-01T12:00:00Z --end 2026-03-01T13:00:00Z --location "Cafe"
211|$GAPI calendar create --summary "Review" --start 2026-03-01T14:00:00Z --end 2026-03-01T15:00:00Z --attendees "alice@co.com,bob@co.com"
212|
213|# Delete event
214|$GAPI calendar delete EVENT_ID
215|```
216|
217|### Drive
218|
219|```bash
220|# Search existing files
221|$GAPI drive search "quarterly report" --max 10
222|$GAPI drive search "mimeType='application/pdf'" --raw-query --max 5
223|
224|# Get metadata for a single file
225|$GAPI drive get FILE_ID
226|
227|# Upload a local file (auto-detects MIME type)
228|$GAPI drive upload /path/to/report.pdf
229|$GAPI drive upload /path/to/image.png --name "Logo.png" --parent FOLDER_ID
230|
231|# Download (binary files download as-is; Google-native files export to a
232|# sensible default — Docs→pdf, Sheets→csv, Slides→pdf, Drawings→png)
233|$GAPI drive download FILE_ID
234|$GAPI drive download DOC_ID --output ~/doc.pdf
235|$GAPI drive download DOC_ID --export-mime text/plain --output ~/doc.txt
236|
237|# Create a folder
238|$GAPI drive create-folder "Reports"
239|$GAPI drive create-folder "Q4" --parent FOLDER_ID
240|
241|# Share
242|$GAPI drive share FILE_ID --email alice@example.com --role reader
243|$GAPI drive share FILE_ID --email alice@example.com --role writer --notify
244|$GAPI drive share FILE_ID --type anyone --role reader        # anyone with link
245|$GAPI drive share FILE_ID --type domain --domain example.com --role reader
246|
247|# Delete — defaults to trash (reversible). Use --permanent to skip the trash.
248|$GAPI drive delete FILE_ID
249|$GAPI drive delete FILE_ID --permanent
250|```
251|
252|### Contacts
253|
254|```bash
255|$GAPI contacts list --max 20
256|```
257|
258|### Sheets
259|
260|```bash
261|# Create a new spreadsheet
262|$GAPI sheets create --title "Q4 Budget"
263|$GAPI sheets create --title "Inventory" --sheet-name "Stock"
264|
265|# Read
266|$GAPI sheets get SHEET_ID "Sheet1!A1:D10"
267|
268|# Write
269|$GAPI sheets update SHEET_ID "Sheet1!A1:B2" --values '[["Name","Score"],["Alice","95"]]'
270|
271|# Append rows
272|$GAPI sheets append SHEET_ID "Sheet1!A:C" --values '[["new","row","data"]]'
273|```
274|
275|### Docs
276|
277|```bash
278|# Read
279|$GAPI docs get DOC_ID
280|
281|# Create a new Doc (optionally seeded with body text)
282|$GAPI docs create --title "Meeting Notes"
283|$GAPI docs create --title "Draft" --body "First paragraph..."
284|
285|# Append text to the end of an existing Doc
286|$GAPI docs append DOC_ID --text "Additional content to append"
287|```
288|
289|## Output Format
290|
291|All commands return JSON. Parse with `jq` or read directly. Key fields:
292|
293|- **Gmail search**: `[{id, threadId, from, to, subject, date, snippet, labels}]`
294|- **Gmail get**: `{id, threadId, from, to, subject, date, labels, body}`
295|- **Gmail send/reply**: `{status: "sent", id, threadId}`
296|- **Calendar list**: `[{id, summary, start, end, location, description, htmlLink}]`
297|- **Calendar create**: `{status: "created", id, summary, htmlLink}`
298|- **Drive search**: `[{id, name, mimeType, modifiedTime, webViewLink}]`
299|- **Drive get**: `{id, name, mimeType, modifiedTime, size, webViewLink, parents, owners}`
300|- **Drive upload**: `{status: "uploaded", id, name, mimeType, webViewLink}`
301|- **Drive download**: `{status: "downloaded", id, name, path, mimeType}`
302|- **Drive create-folder**: `{status: "created", id, name, webViewLink}`
303|- **Drive share**: `{status: "shared", permissionId, fileId, role, type}`
304|- **Drive delete**: `{status: "trashed" | "deleted", fileId, permanent}`
305|- **Contacts list**: `[{name, emails: [...], phones: [...]}]`
306|- **Sheets get**: `[[cell, cell, ...], ...]`
307|- **Sheets create**: `{status: "created", spreadsheetId, title, spreadsheetUrl}`
308|- **Docs create**: `{status: "created", documentId, title, url}`
309|- **Docs append**: `{status: "appended", documentId, inserted_at, characters}`
310|
311|## Rules
312|
313|1. **Never send email, create/delete calendar events, delete Drive files, share files, or modify Docs/Sheets without confirming with the user first.** Show what will be done (recipients, file IDs, content, share role) and ask for approval. For `drive delete`, prefer the default trash (reversible) over `--permanent`.
314|2. **Check auth before first use** — run `setup.py --check`. If it fails, guide the user through setup.
315|3. **Use the Gmail search syntax reference** for complex queries — load it with `skill_view("google-workspace", file_path="references/gmail-search-syntax.md")`.
316|4. **Calendar times must include timezone** — always use ISO 8601 with offset (e.g., `2026-03-01T10:00:00-06:00`) or UTC (`Z`).
317|5. **Respect rate limits** — avoid rapid-fire sequential API calls. Batch reads when possible.
318|
319|## Troubleshooting
320|
321|| Problem | Fix |
322||---------|-----|
323|| `NOT_AUTHENTICATED` | Run setup Steps 2-5 above |
324|| `REFRESH_FAILED` | Token revoked or expired — redo Steps 3-5 |
325|| `HttpError 403: Insufficient Permission` | Missing API scope — `$GSETUP --revoke` then redo Steps 3-5 |
326|| `AUTHENTICATED (partial)` or "Token missing scopes" | New write capabilities (Drive write/delete, Docs create/edit) require re-authorization. `$GSETUP --revoke` then redo Steps 3-5 to grant the upgraded scopes. |
327|| `HttpError 403: Access Not Configured` | API not enabled — user needs to enable it in Google Cloud Console |
328|| `ModuleNotFoundError` | Run `$GSETUP --install-deps` |
329|| Advanced Protection blocks auth | Workspace admin must allowlist the OAuth client ID |
330|
331|## Revoking Access
332|
333|```bash
334|$GSETUP --revoke
335|```
336|