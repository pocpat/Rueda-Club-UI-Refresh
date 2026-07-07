1|---
2|name: xurl
3|description: "X/Twitter via xurl CLI: post, search, DM, media, v2 API."
4|version: 1.1.1
5|author: xdevplatform + openclaw + Hermes Agent
6|license: MIT
7|platforms: [linux, macos]
8|prerequisites:
9|  commands: [xurl]
10|metadata:
11|  hermes:
12|    tags: [twitter, x, social-media, xurl, official-api]
13|    homepage: https://github.com/xdevplatform/xurl
14|    upstream_skill: https://github.com/openclaw/openclaw/blob/main/skills/xurl/SKILL.md
15|---
16|
17|# xurl — X (Twitter) API via the Official CLI
18|
19|`xurl` is the X developer platform's official CLI for the X API. It supports shortcut commands for common actions AND raw curl-style access to any v2 endpoint. All commands return JSON to stdout.
20|
21|Use this skill for:
22|- posting, replying, quoting, deleting posts
23|- searching posts and reading timelines/mentions
24|- liking, reposting, bookmarking
25|- following, unfollowing, blocking, muting
26|- direct messages
27|- media uploads (images and video)
28|- raw access to any X API v2 endpoint
29|- multi-app / multi-account workflows
30|
31|This skill replaces the older `xitter` skill (which wrapped a third-party Python CLI). `xurl` is maintained by the X developer platform team, supports OAuth 2.0 PKCE with auto-refresh, and covers a substantially larger API surface.
32|
33|---
34|
35|## Secret Safety (MANDATORY)
36|
37|Critical rules when operating inside an agent/LLM session:
38|
39|- **Never** read, print, parse, summarize, upload, or send `~/.xurl` to LLM context.
40|- **Never** ask the user to paste credentials/tokens into chat.
41|- The user must fill `~/.xurl` with secrets manually on their own machine. In Docker, this must be the `~` seen by Hermes tool subprocesses; see the Docker note below.
42|- **Never** recommend or execute auth commands with inline secrets in agent sessions.
43|- **Never** use `--verbose` / `-v` in agent sessions — it can expose auth headers/tokens.
44|- To verify credentials exist, only use: `xurl auth status`.
45|
46|Forbidden flags in agent commands (they accept inline secrets):
47|`--bearer-token`, `--consumer-key`, `--consumer-secret`, `--access-token`, `--token-secret`, `--client-id`, `--client-secret`
48|
49|App credential registration and credential rotation must be done by the user manually, outside the agent session. After credentials are registered, the user authenticates with `xurl auth oauth2` — also outside the agent session. Tokens persist to `~/.xurl` in YAML. Each app has isolated tokens. OAuth 2.0 tokens auto-refresh.
50|
51|---
52|
53|## Installation
54|
55|Pick ONE method. On Linux, the shell script or `go install` are the easiest.
56|
57|```bash
58|# Shell script (installs to ~/.local/bin, no sudo, works on Linux + macOS)
59|curl -fsSL https://raw.githubusercontent.com/xdevplatform/xurl/main/install.sh | bash
60|
61|# Homebrew (macOS)
62|brew install --cask xdevplatform/tap/xurl
63|
64|# npm
65|npm install -g @xdevplatform/xurl
66|
67|# Go
68|go install github.com/xdevplatform/xurl@latest
69|```
70|
71|Verify:
72|
73|```bash
74|xurl --help
75|xurl auth status
76|```
77|
78|If `xurl` is installed but `auth status` shows no apps or tokens, the user needs to complete auth manually — see the next section.
79|
80|---
81|
82|## One-Time User Setup (user runs these outside the agent)
83|
84|These steps must be performed by the user directly, NOT by the agent, because they involve pasting secrets. Direct the user to this block; do not execute it for them.
85|
86|1. Create or open an app at https://developer.x.com/en/portal/dashboard
87|2. Set the redirect URI to `http://localhost:8080/callback`
88|3. Copy the app's Client ID and Client Secret
89|4. Register the app locally (user runs this):
90|   ```bash
91|   xurl auth apps add my-app --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
92|   ```
93|5. Authenticate (specify `--app` to bind the token to your app):
94|   ```bash
95|   xurl auth oauth2 --app my-app
96|   ```
97|   (This opens a browser for the OAuth 2.0 PKCE flow.)
98|
99|   If X returns a `UsernameNotFound` error or 403 on the post-OAuth `/2/users/me` lookup, pass your handle explicitly (xurl v1.1.0+):
100|   ```bash
101|   xurl auth oauth2 --app my-app YOUR_USERNAME
102|   ```
103|   This binds the token to your handle and skips the broken `/2/users/me` call.
104|6. Set the app as default so all commands use it:
105|   ```bash
106|   xurl auth default my-app
107|   ```
108|7. Verify:
109|   ```bash
110|   xurl auth status
111|   xurl whoami
112|   ```
113|
114|After this, the agent can use any command below without further setup. OAuth 2.0 tokens auto-refresh.
115|
116|> **Common pitfall:** If you omit `--app my-app` from `xurl auth oauth2`, the OAuth token is saved to the built-in `default` app profile — which has no client-id or client-secret. Commands will fail with auth errors even though the OAuth flow appeared to succeed. If you hit this, re-run `xurl auth oauth2 --app my-app` and `xurl auth default my-app`.
117|
118|> **Docker HOME pitfall:** In the official Hermes Docker layout, `/opt/data` is `HERMES_HOME`, but Hermes tool subprocesses use `/opt/data/home` as `HOME`. That means `~/.xurl` resolves to `/opt/data/home/.xurl` for Hermes-run `xurl` commands, not `/opt/data/.xurl`. Run the user setup with the same HOME:
119|> ```bash
120|> HOME=/opt/data/home xurl auth apps add my-app --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
121|> HOME=/opt/data/home xurl auth oauth2 --app my-app YOUR_USERNAME
122|> HOME=/opt/data/home xurl auth default my-app YOUR_USERNAME
123|> HOME=/opt/data/home xurl auth status
124|> ```
125|> If `HOME=/opt/data xurl auth status` succeeds but `HOME=/opt/data/home xurl auth status` shows no apps or tokens, Hermes tool calls will not see the credentials.
126|
127|---
128|
129|## Quick Reference
130|
131|| Action | Command |
132|| --- | --- |
133|| Post | `xurl post "Hello world!"` |
134|| Reply | `xurl reply POST_ID "Nice post!"` |
135|| Quote | `xurl quote POST_ID "My take"` |
136|| Delete a post | `xurl delete POST_ID` |
137|| Read a post | `xurl read POST_ID` |
138|| Search posts | `xurl search "QUERY" -n 10` |
139|| Who am I | `xurl whoami` |
140|| Look up a user | `xurl user @handle` |
141|| Home timeline | `xurl timeline -n 20` |
142|| Mentions | `xurl mentions -n 10` |
143|| Like / Unlike | `xurl like POST_ID` / `xurl unlike POST_ID` |
144|| Repost / Undo | `xurl repost POST_ID` / `xurl unrepost POST_ID` |
145|| Bookmark / Remove | `xurl bookmark POST_ID` / `xurl unbookmark POST_ID` |
146|| List bookmarks / likes | `xurl bookmarks -n 10` / `xurl likes -n 10` |
147|| Follow / Unfollow | `xurl follow @handle` / `xurl unfollow @handle` |
148|| Following / Followers | `xurl following -n 20` / `xurl followers -n 20` |
149|| Block / Unblock | `xurl block @handle` / `xurl unblock @handle` |
150|| Mute / Unmute | `xurl mute @handle` / `xurl unmute @handle` |
151|| Send DM | `xurl dm @handle "message"` |
152|| List DMs | `xurl dms -n 10` |
153|| Upload media | `xurl media upload path/to/file.mp4` |
154|| Media status | `xurl media status MEDIA_ID` |
155|| List apps | `xurl auth apps list` |
156|| Remove app | `xurl auth apps remove NAME` |
157|| Set default app | `xurl auth default APP_NAME [USERNAME]` |
158|| Per-request app | `xurl --app NAME /2/users/me` |
159|| Auth status | `xurl auth status` |
160|
161|Notes:
162|- `POST_ID` accepts full URLs too (e.g. `https://x.com/user/status/1234567890`) — xurl extracts the ID.
163|- Usernames work with or without a leading `@`.
164|
165|---
166|
167|## Command Details
168|
169|### Posting
170|
171|```bash
172|xurl post "Hello world!"
173|xurl post "Check this out" --media-id MEDIA_ID
174|xurl post "Thread pics" --media-id 111 --media-id 222
175|
176|xurl reply 1234567890 "Great point!"
177|xurl reply https://x.com/user/status/1234567890 "Agreed!"
178|xurl reply 1234567890 "Look at this" --media-id MEDIA_ID
179|
180|xurl quote 1234567890 "Adding my thoughts"
181|xurl delete 1234567890
182|```
183|
184|### Reading & Search
185|
186|```bash
187|xurl read 1234567890
188|xurl read https://x.com/user/status/1234567890
189|
190|xurl search "golang"
191|xurl search "from:elonmusk" -n 20
192|xurl search "#buildinpublic lang:en" -n 15
193|```
194|
195|For X Articles, use raw API mode instead of the `read` shortcut. `xurl read`
196|expects a post ID or post URL; do not put `read` before a `/2/tweets/...`
197|endpoint. Request the `article` tweet field and ingest `data.article.plain_text`
198|from the JSON response:
199|
200|```bash
201|xurl --app APP_NAME '/2/tweets/2057909493250539891?expansions=author_id,attachments.media_keys,referenced_tweets.id&tweet.fields=created_at,lang,public_metrics,context_annotations,entities,possibly_sensitive,conversation_id,in_reply_to_user_id,referenced_tweets,article'
202|```
203|
204|### Users, Timeline, Mentions
205|
206|```bash
207|xurl whoami
208|xurl user elonmusk
209|xurl user @XDevelopers
210|
211|xurl timeline -n 25
212|xurl mentions -n 20
213|```
214|
215|### Engagement
216|
217|```bash
218|xurl like 1234567890
219|xurl unlike 1234567890
220|
221|xurl repost 1234567890
222|xurl unrepost 1234567890
223|
224|xurl bookmark 1234567890
225|xurl unbookmark 1234567890
226|
227|xurl bookmarks -n 20
228|xurl likes -n 20
229|```
230|
231|### Social Graph
232|
233|```bash
234|xurl follow @XDevelopers
235|xurl unfollow @XDevelopers
236|
237|xurl following -n 50
238|xurl followers -n 50
239|
240|# Another user's graph
241|xurl following --of elonmusk -n 20
242|xurl followers --of elonmusk -n 20
243|
244|xurl block @spammer
245|xurl unblock @spammer
246|xurl mute @annoying
247|xurl unmute @annoying
248|```
249|
250|### Direct Messages
251|
252|```bash
253|xurl dm @someuser "Hey, saw your post!"
254|xurl dms -n 25
255|```
256|
257|### Media Upload
258|
259|```bash
260|# Auto-detect type
261|xurl media upload photo.jpg
262|xurl media upload video.mp4
263|
264|# Explicit type/category
265|xurl media upload --media-type image/jpeg --category tweet_image photo.jpg
266|
267|# Videos need server-side processing — check status (or poll)
268|xurl media status MEDIA_ID
269|xurl media status --wait MEDIA_ID
270|
271|# Full workflow
272|xurl media upload meme.png                  # returns media id
273|xurl post "lol" --media-id MEDIA_ID
274|```
275|
276|---
277|
278|## Raw API Access
279|
280|The shortcuts cover common operations. For anything else, use raw curl-style mode against any X API v2 endpoint:
281|
282|```bash
283|# GET
284|xurl /2/users/me
285|
286|# POST with JSON body
287|xurl -X POST /2/tweets -d '{"text":"Hello world!"}'
288|
289|# DELETE / PUT / PATCH
290|xurl -X DELETE /2/tweets/1234567890
291|
292|# Custom headers
293|xurl -H "Content-Type: application/json" /2/some/endpoint
294|
295|# Force streaming
296|xurl -s /2/tweets/search/stream
297|
298|# Full URLs also work
299|xurl https://api.x.com/2/users/me
300|```
301|
302|---
303|
304|## Global Flags
305|
306|| Flag | Short | Description |
307|| --- | --- | --- |
308|| `--app` | | Use a specific registered app (overrides default) |
309|| `--auth` | | Force auth type: `oauth1`, `oauth2`, or `app` |
310|| `--username` | `-u` | Which OAuth2 account to use (if multiple exist) |
311|| `--verbose` | `-v` | **Forbidden in agent sessions** — leaks auth headers |
312|| `--trace` | `-t` | Add `X-B3-Flags: 1` trace header |
313|
314|---
315|
316|## Streaming
317|
318|Streaming endpoints are auto-detected. Known ones include:
319|
320|- `/2/tweets/search/stream`
321|- `/2/tweets/sample/stream`
322|- `/2/tweets/sample10/stream`
323|
324|Force streaming on any endpoint with `-s`.
325|
326|---
327|
328|## Output Format
329|
330|All commands return JSON to stdout. Structure mirrors X API v2:
331|
332|```json
333|{ "data": { "id": "1234567890", "text": "Hello world!" } }
334|```
335|
336|Errors are also JSON:
337|
338|```json
339|{ "errors": [ { "message": "Not authorized", "code": 403 } ] }
340|```
341|
342|---
343|
344|## Common Workflows
345|
346|### Post with an image
347|```bash
348|xurl media upload photo.jpg
349|xurl post "Check out this photo!" --media-id MEDIA_ID
350|```
351|
352|### Reply to a conversation
353|```bash
354|xurl read https://x.com/user/status/1234567890
355|xurl reply 1234567890 "Here are my thoughts..."
356|```
357|
358|### Search and engage
359|```bash
360|xurl search "topic of interest" -n 10
361|xurl like POST_ID_FROM_RESULTS
362|xurl reply POST_ID_FROM_RESULTS "Great point!"
363|```
364|
365|### Check your activity
366|```bash
367|xurl whoami
368|xurl mentions -n 20
369|xurl timeline -n 20
370|```
371|
372|### Multiple apps (credentials pre-configured manually)
373|```bash
374|xurl auth default prod alice               # prod app, alice user
375|xurl --app staging /2/users/me             # one-off against staging
376|```
377|
378|---
379|
380|## Error Handling
381|
382|- Non-zero exit code on any error.
383|- API errors are still printed as JSON to stdout, so you can parse them.
384|- Auth errors → have the user re-run `xurl auth oauth2` outside the agent session.
385|- Commands that need the caller's user ID (like, repost, bookmark, follow, etc.) will auto-fetch it via `/2/users/me`. An auth failure there surfaces as an auth error.
386|
387|---
388|
389|## Agent Workflow
390|
391|1. Verify prerequisites: `xurl --help` and `xurl auth status`.
392|2. **Check default app has credentials.** Parse the `auth status` output. The default app is marked with `▸`. If the default app shows `oauth2: (none)` but another app has a valid oauth2 user, tell the user to run `xurl auth default <that-app>` to fix it. This is the most common setup mistake — the user added an app with a custom name but never set it as default, so xurl keeps trying the empty `default` profile.
393|3. If auth is missing entirely, stop and direct the user to the "One-Time User Setup" section — do NOT attempt to register apps or pass secrets yourself.
394|4. Start with a cheap read (`xurl whoami`, `xurl user @handle`, `xurl search ... -n 3`) to confirm reachability.
395|5. Confirm the target post/user and the user's intent before any write action (post, reply, like, repost, DM, follow, block, delete).
396|6. Use JSON output directly — every response is already structured.
397|7. Never paste `~/.xurl` contents back into the conversation.
398|
399|---
400|
401|## Troubleshooting
402|
403|| Symptom | Cause | Fix |
404|| --- | --- | --- |
405|| Auth errors after successful OAuth flow | Token saved to `default` app (no client-id/secret) instead of your named app | `xurl auth oauth2 --app my-app` then `xurl auth default my-app` |
406|| `unauthorized_client` during OAuth | App type set to "Native App" in X dashboard | Change to "Web app, automated app or bot" in User Authentication Settings |
407|| `UsernameNotFound` or 403 on `/2/users/me` right after OAuth | X not returning username reliably from `/2/users/me` | Re-run `xurl auth oauth2 --app my-app YOUR_USERNAME` (xurl v1.1.0+) to pass the handle explicitly |
408|| 401 on every request | Token expired or wrong default app | Check `xurl auth status` — verify `▸` points to an app with oauth2 tokens |
409|| `client-forbidden` / `client-not-enrolled` | X platform enrollment issue | Dashboard → Apps → Manage → Move to "Pay-per-use" package → Production environment |
410|| `CreditsDepleted` | $0 balance on X API | Buy credits (min $5) in Developer Console → Billing |
411|| `media processing failed` on image upload | Default category is `amplify_video` | Add `--category tweet_image --media-type image/png` |
412|| Two "Client Secret" values in X dashboard | UI bug — first is actually Client ID | Confirm on the "Keys and tokens" page; ID ends in `MTpjaQ` |
413|
414|---
415|
416|## Notes
417|
418|- **Rate limits:** X enforces per-endpoint rate limits. A 429 means wait and retry. Write endpoints (post, reply, like, repost) have tighter limits than reads.
419|- **Scopes:** OAuth 2.0 tokens use broad scopes. A 403 on a specific action usually means the token is missing a scope — have the user re-run `xurl auth oauth2`.
420|- **Token refresh:** OAuth 2.0 tokens auto-refresh. Nothing to do.
421|- **Multiple apps:** Each app has isolated credentials/tokens. Switch with `xurl auth default` or `--app`.
422|- **Multiple accounts per app:** Select with `-u / --username`, or set a default with `xurl auth default APP USER`.
423|- **Token storage:** `~/.xurl` is YAML. In Docker, use the Hermes subprocess HOME (`/opt/data/home` in the official image) so tokens land under `/opt/data/home/.xurl`. Never read or send this file to LLM context.
424|- **Cost:** X API access is typically paid for meaningful usage. Many failures are plan/permission problems, not code problems.
425|
426|---
427|
428|## Attribution
429|
430|- Upstream CLI: https://github.com/xdevplatform/xurl (X developer platform team, Chris Park et al.)
431|- Upstream agent skill: https://github.com/openclaw/openclaw/blob/main/skills/xurl/SKILL.md
432|- Hermes adaptation: reformatted for Hermes skill conventions; safety guardrails preserved verbatim.
433|