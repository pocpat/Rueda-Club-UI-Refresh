1|---
2|name: yuanbao
3|description: "Yuanbao (元宝) groups: @mention users, query info/members."
4|version: 1.0.0
5|platforms: [linux, macos, windows]
6|metadata:
7|  hermes:
8|    tags: [yuanbao, mention, at, group, members, 元宝, 派, 艾特]
9|    related_skills: []
10|---
11|
12|# Yuanbao Group Interaction
13|
14|## CRITICAL: How Messaging Works
15|
16|**Your text reply IS the message sent to the group/user.** The gateway automatically delivers your response text to the chat. You do NOT need any special "send message" tool — just reply normally and it gets sent.
17|
18|When you include `@nickname` in your reply text, the gateway automatically converts it into a real @mention that notifies the user. This is built-in — you have full @mention capability.
19|
20|**NEVER say you cannot send messages or @mention users. NEVER suggest the user do it manually. NEVER add disclaimers about permissions. Just reply with the text you want sent.**
21|
22|## Available Tools
23|
24|| Tool | When to use |
25||------|------------|
26|| `yb_query_group_info` | Query group name, owner, member count |
27|| `yb_query_group_members` | Find a user, list bots, list all members, or get nickname for @mention |
28|| `yb_send_dm` | Send a private/direct message (DM / 私信) to a user, with optional media files |
29|
30|## @Mention Workflow
31|
32|When you need to @mention / 艾特 someone:
33|
34|1. Call `yb_query_group_members` with `action="find"`, `name="<target name>"`, `mention=true`
35|2. Get the exact nickname from the response
36|3. Include `@nickname` in your reply text — the gateway handles the rest
37|
38|Example: user says "帮我艾特元宝"
39|
40|Step 1 — tool call:
41|```json
42|{ "group_code": "328306697", "action": "find", "name": "元宝", "mention": true }
43|```
44|
45|Step 2 — your reply (this gets sent to the group with a working @mention):
46|```
47|@元宝 你好，有人找你！
48|```
49|
50|**That's it.** No extra explanation needed. Keep it short and natural.
51|
52|**Rules:**
53|- Call `yb_query_group_members` first to get the exact nickname — do NOT guess
54|- The @mention format: `@nickname` with a space before the @ sign
55|- Your reply text IS the message — it WILL be sent and the @mention WILL work
56|- Be concise. Do NOT explain how @mention works to the user.
57|
58|## Send DM (Private Message) Workflow
59|
60|When someone asks to send a private message / 私信 / DM to a user:
61|
62|1. Call `yb_send_dm` with `group_code`, `name` (target user's name), and `message`
63|2. The tool automatically finds the user and sends the DM
64|3. Report the result to the user
65|
66|Example: user says "给 @用户aea3 私信发一个 hello"
67|
68|```json
69|yb_send_dm({ "group_code": "535168412", "name": "用户aea3", "message": "hello" })
70|```
71|
72|Example with media: user says "给 @用户aea3 私信发一张图片"
73|
74|```json
75|yb_send_dm({
76|  "group_code": "535168412",
77|  "name": "用户aea3",
78|  "message": "Here is the image",
79|  "media_files": [{"path": "/tmp/photo.jpg"}]
80|})
81|```
82|
83|**Rules:**
84|- Extract `group_code` from the current chat_id (e.g. `group:535168412` → `535168412`)
85|- If you already know the user_id, pass it directly via the `user_id` parameter to skip lookup
86|- If multiple users match the name, the tool returns candidates — ask the user to clarify
87|- Do NOT use `send_message` tool for Yuanbao DMs — use `yb_send_dm` instead
88|- Supports media: images (.jpg/.png/.gif/.webp/.bmp) sent as image messages, other files as documents
89|
90|## Query Group Info
91|
92|```json
93|yb_query_group_info({ "group_code": "328306697" })
94|```
95|
96|## Query Members
97|
98|| Action | Description |
99||--------|-------------|
100|| `find` | Search by name (partial match, case-insensitive) |
101|| `list_bots` | List bots and Yuanbao AI assistants |
102|| `list_all` | List all members |
103|
104|## Notes
105|
106|- `group_code` comes from chat_id: `group:328306697` → `328306697`
107|- Groups are called "派 (Pai)" in the Yuanbao app
108|- Member roles: `user`, `yuanbao_ai`, `bot`
109|