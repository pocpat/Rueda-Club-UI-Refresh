1|---
2|name: openhue
3|description: "Control Philips Hue lights, scenes, rooms via OpenHue CLI."
4|version: 1.0.0
5|author: community
6|license: MIT
7|platforms: [linux, macos, windows]
8|metadata:
9|  hermes:
10|    tags: [Smart-Home, Hue, Lights, IoT, Automation]
11|    homepage: https://www.openhue.io/cli
12|prerequisites:
13|  commands: [openhue]
14|---
15|
16|# OpenHue CLI
17|
18|Control Philips Hue lights and scenes via a Hue Bridge from the terminal.
19|
20|## Prerequisites
21|
22|```bash
23|# Linux (pre-built binary)
24|curl -sL https://github.com/openhue/openhue-cli/releases/latest/download/openhue-linux-amd64 -o ~/.local/bin/openhue && chmod +x ~/.local/bin/openhue
25|
26|# macOS
27|brew install openhue/cli/openhue-cli
28|```
29|
30|First run requires pressing the button on your Hue Bridge to pair. The bridge must be on the same local network.
31|
32|## When to Use
33|
34|- "Turn on/off the lights"
35|- "Dim the living room lights"
36|- "Set a scene" or "movie mode"
37|- Controlling specific Hue rooms, zones, or individual bulbs
38|- Adjusting brightness, color, or color temperature
39|
40|## Common Commands
41|
42|### List Resources
43|
44|```bash
45|openhue get light       # List all lights
46|openhue get room        # List all rooms
47|openhue get scene       # List all scenes
48|```
49|
50|### Control Lights
51|
52|```bash
53|# Turn on/off
54|openhue set light "Bedroom Lamp" --on
55|openhue set light "Bedroom Lamp" --off
56|
57|# Brightness (0-100)
58|openhue set light "Bedroom Lamp" --on --brightness 50
59|
60|# Color temperature (warm to cool: 153-500 mirek)
61|openhue set light "Bedroom Lamp" --on --temperature 300
62|
63|# Color (by name or hex)
64|openhue set light "Bedroom Lamp" --on --color red
65|openhue set light "Bedroom Lamp" --on --rgb "#FF5500"
66|```
67|
68|### Control Rooms
69|
70|```bash
71|# Turn off entire room
72|openhue set room "Bedroom" --off
73|
74|# Set room brightness
75|openhue set room "Bedroom" --on --brightness 30
76|```
77|
78|### Scenes
79|
80|```bash
81|openhue set scene "Relax" --room "Bedroom"
82|openhue set scene "Concentrate" --room "Office"
83|```
84|
85|## Quick Presets
86|
87|```bash
88|# Bedtime (dim warm)
89|openhue set room "Bedroom" --on --brightness 20 --temperature 450
90|
91|# Work mode (bright cool)
92|openhue set room "Office" --on --brightness 100 --temperature 250
93|
94|# Movie mode (dim)
95|openhue set room "Living Room" --on --brightness 10
96|
97|# Everything off
98|openhue set room "Bedroom" --off
99|openhue set room "Office" --off
100|openhue set room "Living Room" --off
101|```
102|
103|## Notes
104|
105|- Bridge must be on the same local network as the machine running Hermes
106|- First run requires physically pressing the button on the Hue Bridge to authorize
107|- Colors only work on color-capable bulbs (not white-only models)
108|- Light and room names are case-sensitive — use `openhue get light` to check exact names
109|- Works great with cron jobs for scheduled lighting (e.g. dim at bedtime, bright at wake)
110|