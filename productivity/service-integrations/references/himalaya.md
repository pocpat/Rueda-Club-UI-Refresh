1|---
2|name: himalaya
3|description: "Himalaya CLI: IMAP/SMTP email from terminal."
4|version: 1.1.0
5|author: community
6|license: MIT
7|platforms: [linux, macos, windows]
8|metadata:
9|  hermes:
10|    tags: [Email, IMAP, SMTP, CLI, Communication]
11|    homepage: https://github.com/pimalaya/himalaya
12|prerequisites:
13|  commands: [himalaya]
14|---
15|
16|# Himalaya Email CLI
17|
18|Himalaya is a CLI email client that lets you manage emails from the terminal using IMAP, SMTP, Notmuch, or Sendmail backends.
19|
20|This skill is separate from the Hermes Email gateway adapter. The gateway
21|adapter lets people email the agent and uses Hermes' built-in IMAP/SMTP
22|adapter; this skill lets the agent operate a mailbox from terminal tools and
23|requires the external `himalaya` CLI.
24|
25|## References
26|
27|- `references/configuration.md` (config file setup + IMAP/SMTP authentication)
28|- `references/message-composition.md` (MML syntax for composing emails)
29|
30|## Prerequisites
31|
32|1. Himalaya CLI installed (`himalaya --version` to verify)
33|2. A configuration file at `~/.config/himalaya/config.toml`
34|3. IMAP/SMTP credentials configured (password stored securely)
35|
36|### Installation
37|
38|```bash
39|# Pre-built binary (Linux/macOS — recommended)
40|curl -sSL https://raw.githubusercontent.com/pimalaya/himalaya/master/install.sh | PREFIX=~/.local sh
41|
42|# macOS via Homebrew
43|brew install himalaya
44|
45|# Or via cargo (any platform with Rust)
46|cargo install himalaya --locked
47|```
48|
49|## Configuration Setup
50|
51|Run the interactive wizard to set up an account:
52|
53|```bash
54|himalaya account configure
55|```
56|
57|Or create `~/.config/himalaya/config.toml` manually:
58|
59|```toml
60|[accounts.personal]
61|email = "you@example.com"
62|display-name = "Your Name"
63|default = true
64|
65|backend.type = "imap"
66|backend.host = "imap.example.com"
67|backend.port = 993
68|backend.encryption.type = "tls"
69|backend.login = "you@example.com"
70|backend.auth.type = "password"
71|backend.auth.cmd = "pass show email/imap"  # or use keyring
72|
73|message.send.backend.type = "smtp"
74|message.send.backend.host = "smtp.example.com"
75|message.send.backend.port = 587
76|message.send.backend.encryption.type = "start-tls"
77|message.send.backend.login = "you@example.com"
78|message.send.backend.auth.type = "password"
79|message.send.backend.auth.cmd = "pass show email/smtp"
80|
81|# Folder aliases (himalaya v1.2.0+ syntax). Required whenever the
82|# server's folder names don't match himalaya's canonical names
83|# (inbox/sent/drafts/trash). Gmail is the common case — see
84|# `references/configuration.md` for the `[Gmail]/Sent Mail` mapping.
85|folder.aliases.inbox = "INBOX"
86|folder.aliases.sent = "Sent"
87|folder.aliases.drafts = "Drafts"
88|folder.aliases.trash = "Trash"
89|```
90|
91|> **Heads up on the alias syntax.** Pre-v1.2.0 docs used a
92|> `[accounts.NAME.folder.alias]` sub-section (singular `alias`).
93|> v1.2.0 silently ignores that form — TOML parses fine, but the
94|> alias resolver never reads it, so every lookup falls through to
95|> the canonical name. On Gmail this means save-to-Sent fails *after*
96|> SMTP delivery succeeds, and `himalaya message send` exits non-zero.
97|> Any caller (agent, script, user) that retries on that exit code
98|> will re-run the entire send — including SMTP — producing duplicate
99|> emails to recipients. Always use `folder.aliases.X` (plural, dotted
100|> keys, directly under `[accounts.NAME]`).
101|
102|## Hermes Integration Notes
103|
104|- **Reading, listing, searching, moving, deleting** all work directly through the terminal tool
105|- **Composing/replying/forwarding** — piped input (`cat << EOF | himalaya template send`) is recommended for reliability. Interactive `$EDITOR` mode works with `pty=true` + background + process tool, but requires knowing the editor and its commands
106|- Use `--output json` for structured output that's easier to parse programmatically
107|- The `himalaya account configure` wizard requires interactive input — use PTY mode: `terminal(command="himalaya account configure", pty=true)`
108|
109|## Common Operations
110|
111|### List Folders
112|
113|```bash
114|himalaya folder list
115|```
116|
117|### List Emails
118|
119|List emails in INBOX (default):
120|
121|```bash
122|himalaya envelope list
123|```
124|
125|List emails in a specific folder:
126|
127|```bash
128|himalaya envelope list --folder "Sent"
129|```
130|
131|List with pagination:
132|
133|```bash
134|himalaya envelope list --page 1 --page-size 20
135|```
136|
137|### Search Emails
138|
139|```bash
140|himalaya envelope list from john@example.com subject meeting
141|```
142|
143|### Read an Email
144|
145|Read email by ID (shows plain text):
146|
147|```bash
148|himalaya message read 42
149|```
150|
151|Export raw MIME:
152|
153|```bash
154|himalaya message export 42 --full
155|```
156|
157|### Reply to an Email
158|
159|To reply non-interactively from Hermes, read the original message, compose a reply, and pipe it:
160|
161|```bash
162|# Get the reply template, edit it, and send
163|himalaya template reply 42 | sed 's/^$/\nYour reply text here\n/' | himalaya template send
164|```
165|
166|Or build the reply manually:
167|
168|```bash
169|cat << 'EOF' | himalaya template send
170|From: you@example.com
171|To: sender@example.com
172|Subject: Re: Original Subject
173|In-Reply-To: <original-message-id>
174|
175|Your reply here.
176|EOF
177|```
178|
179|Reply-all (interactive — needs $EDITOR, use template approach above instead):
180|
181|```bash
182|himalaya message reply 42 --all
183|```
184|
185|### Forward an Email
186|
187|```bash
188|# Get forward template and pipe with modifications
189|himalaya template forward 42 | sed 's/^To:.*/To: newrecipient@example.com/' | himalaya template send
190|```
191|
192|### Write a New Email
193|
194|**Non-interactive (use this from Hermes)** — pipe the message via stdin:
195|
196|```bash
197|cat << 'EOF' | himalaya template send
198|From: you@example.com
199|To: recipient@example.com
200|Subject: Test Message
201|
202|Hello from Himalaya!
203|EOF
204|```
205|
206|Or with headers flag:
207|
208|```bash
209|himalaya message write -H "To:recipient@example.com" -H "Subject:Test" "Message body here"
210|```
211|
212|Note: `himalaya message write` without piped input opens `$EDITOR`. This works with `pty=true` + background mode, but piping is simpler and more reliable.
213|
214|### Move/Copy Emails
215|
216|Move to folder:
217|
218|```bash
219|himalaya message move 42 "Archive"
220|```
221|
222|Copy to folder:
223|
224|```bash
225|himalaya message copy 42 "Important"
226|```
227|
228|### Delete an Email
229|
230|```bash
231|himalaya message delete 42
232|```
233|
234|### Manage Flags
235|
236|Add flag:
237|
238|```bash
239|himalaya flag add 42 --flag seen
240|```
241|
242|Remove flag:
243|
244|```bash
245|himalaya flag remove 42 --flag seen
246|```
247|
248|## Multiple Accounts
249|
250|List accounts:
251|
252|```bash
253|himalaya account list
254|```
255|
256|Use a specific account:
257|
258|```bash
259|himalaya --account work envelope list
260|```
261|
262|## Attachments
263|
264|Save attachments from a message:
265|
266|```bash
267|himalaya attachment download 42
268|```
269|
270|Save to specific directory:
271|
272|```bash
273|himalaya attachment download 42 --dir ~/Downloads
274|```
275|
276|## Output Formats
277|
278|Most commands support `--output` for structured output:
279|
280|```bash
281|himalaya envelope list --output json
282|himalaya envelope list --output plain
283|```
284|
285|## Debugging
286|
287|Enable debug logging:
288|
289|```bash
290|RUST_LOG=debug himalaya envelope list
291|```
292|
293|Full trace with backtrace:
294|
295|```bash
296|RUST_LOG=trace RUST_BACKTRACE=1 himalaya envelope list
297|```
298|
299|## Tips
300|
301|- Use `himalaya --help` or `himalaya <command> --help` for detailed usage.
302|- Message IDs are relative to the current folder; re-list after folder changes.
303|- For composing rich emails with attachments, use MML syntax (see `references/message-composition.md`).
304|- Store passwords securely using `pass`, system keyring, or a command that outputs the password.
305|