1|---
2|name: maps
3|description: "Geocode, POIs, routes, timezones via OpenStreetMap/OSRM."
4|version: 1.2.0
5|author: Mibayy
6|license: MIT
7|platforms: [linux, macos, windows]
8|metadata:
9|  hermes:
10|    tags: [maps, geocoding, places, routing, distance, directions, nearby, location, openstreetmap, nominatim, overpass, osrm]
11|    category: productivity
12|    requires_toolsets: [terminal]
13|    supersedes: [find-nearby]
14|---
15|
16|# Maps Skill
17|
18|Location intelligence using free, open data sources. 8 commands, 44 POI
19|categories, zero dependencies (Python stdlib only), no API key required.
20|
21|Data sources: OpenStreetMap/Nominatim, Overpass API, OSRM, TimeAPI.io.
22|
23|This skill supersedes the old `find-nearby` skill — all of find-nearby's
24|functionality is covered by the `nearby` command below, with the same
25|`--near "<place>"` shortcut and multi-category support.
26|
27|## When to Use
28|
29|- User sends a Telegram location pin (latitude/longitude in the message) → `nearby`
30|- User wants coordinates for a place name → `search`
31|- User has coordinates and wants the address → `reverse`
32|- User asks for nearby restaurants, hospitals, pharmacies, hotels, etc. → `nearby`
33|- User wants driving/walking/cycling distance or travel time → `distance`
34|- User wants turn-by-turn directions between two places → `directions`
35|- User wants timezone information for a location → `timezone`
36|- User wants to search for POIs within a geographic area → `area` + `bbox`
37|
38|## Prerequisites
39|
40|Python 3.8+ (stdlib only — no pip installs needed).
41|
42|Script path: `~/.hermes/skills/maps/scripts/maps_client.py`
43|
44|## Commands
45|
46|```bash
47|MAPS=~/.hermes/skills/maps/scripts/maps_client.py
48|```
49|
50|### search — Geocode a place name
51|
52|```bash
53|python3 $MAPS search "Eiffel Tower"
54|python3 $MAPS search "1600 Pennsylvania Ave, Washington DC"
55|```
56|
57|Returns: lat, lon, display name, type, bounding box, importance score.
58|
59|### reverse — Coordinates to address
60|
61|```bash
62|python3 $MAPS reverse 48.8584 2.2945
63|```
64|
65|Returns: full address breakdown (street, city, state, country, postcode).
66|
67|### nearby — Find places by category
68|
69|```bash
70|# By coordinates (from a Telegram location pin, for example)
71|python3 $MAPS nearby 48.8584 2.2945 restaurant --limit 10
72|python3 $MAPS nearby 40.7128 -74.0060 hospital --radius 2000
73|
74|# By address / city / zip / landmark — --near auto-geocodes
75|python3 $MAPS nearby --near "Times Square, New York" --category cafe
76|python3 $MAPS nearby --near "90210" --category pharmacy
77|
78|# Multiple categories merged into one query
79|python3 $MAPS nearby --near "downtown austin" --category restaurant --category bar --limit 10
80|```
81|
82|46 categories: restaurant, cafe, bar, hospital, pharmacy, hotel, guest_house,
83|camp_site, supermarket, atm, gas_station, parking, museum, park, school,
84|university, bank, police, fire_station, library, airport, train_station,
85|bus_stop, church, mosque, synagogue, dentist, doctor, cinema, theatre, gym,
86|swimming_pool, post_office, convenience_store, bakery, bookshop, laundry,
87|car_wash, car_rental, bicycle_rental, taxi, veterinary, zoo, playground,
88|stadium, nightclub.
89|
90|Each result includes: `name`, `address`, `lat`/`lon`, `distance_m`,
91|`maps_url` (clickable Google Maps link), `directions_url` (Google Maps
92|directions from the search point), and promoted tags when available —
93|`cuisine`, `hours` (opening_hours), `phone`, `website`.
94|
95|### distance — Travel distance and time
96|
97|```bash
98|python3 $MAPS distance "Paris" --to "Lyon"
99|python3 $MAPS distance "New York" --to "Boston" --mode driving
100|python3 $MAPS distance "Big Ben" --to "Tower Bridge" --mode walking
101|```
102|
103|Modes: driving (default), walking, cycling. Returns road distance, duration,
104|and straight-line distance for comparison.
105|
106|### directions — Turn-by-turn navigation
107|
108|```bash
109|python3 $MAPS directions "Eiffel Tower" --to "Louvre Museum" --mode walking
110|python3 $MAPS directions "JFK Airport" --to "Times Square" --mode driving
111|```
112|
113|Returns numbered steps with instruction, distance, duration, road name, and
114|maneuver type (turn, depart, arrive, etc.).
115|
116|### timezone — Timezone for coordinates
117|
118|```bash
119|python3 $MAPS timezone 48.8584 2.2945
120|python3 $MAPS timezone 35.6762 139.6503
121|```
122|
123|Returns timezone name, UTC offset, and current local time.
124|
125|### area — Bounding box and area for a place
126|
127|```bash
128|python3 $MAPS area "Manhattan, New York"
129|python3 $MAPS area "London"
130|```
131|
132|Returns bounding box coordinates, width/height in km, and approximate area.
133|Useful as input for the bbox command.
134|
135|### bbox — Search within a bounding box
136|
137|```bash
138|python3 $MAPS bbox 40.75 -74.00 40.77 -73.98 restaurant --limit 20
139|```
140|
141|Finds POIs within a geographic rectangle. Use `area` first to get the
142|bounding box coordinates for a named place.
143|
144|## Working With Telegram Location Pins
145|
146|When a user sends a location pin, the message contains `latitude:` and
147|`longitude:` fields. Extract those and pass them straight to `nearby`:
148|
149|```bash
150|# User sent a pin at 36.17, -115.14 and asked "find cafes nearby"
151|python3 $MAPS nearby 36.17 -115.14 cafe --radius 1500
152|```
153|
154|Present results as a numbered list with names, distances, and the
155|`maps_url` field so the user gets a tap-to-open link in chat. For "open
156|now?" questions, check the `hours` field; if missing or unclear, verify
157|with `web_search` since OSM hours are community-maintained and not always
158|current.
159|
160|## Workflow Examples
161|
162|**"Find Italian restaurants near the Colosseum":**
163|1. `nearby --near "Colosseum Rome" --category restaurant --radius 500`
164|   — one command, auto-geocoded
165|
166|**"What's near this location pin they sent?":**
167|1. Extract lat/lon from the Telegram message
168|2. `nearby LAT LON cafe --radius 1500`
169|
170|**"How do I walk from hotel to conference center?":**
171|1. `directions "Hotel Name" --to "Conference Center" --mode walking`
172|
173|**"What restaurants are in downtown Seattle?":**
174|1. `area "Downtown Seattle"` → get bounding box
175|2. `bbox S W N E restaurant --limit 30`
176|
177|## Pitfalls
178|
179|- Nominatim ToS: max 1 req/s (handled automatically by the script)
180|- `nearby` requires lat/lon OR `--near "<address>"` — one of the two is needed
181|- OSRM routing coverage is best for Europe and North America
182|- Overpass API can be slow during peak hours; the script automatically
183|  falls back between mirrors (overpass-api.de → overpass.kumi.systems)
184|- `distance` and `directions` use `--to` flag for the destination (not positional)
185|- If a zip code alone gives ambiguous results globally, include country/state
186|
187|## Verification
188|
189|```bash
190|python3 ~/.hermes/skills/maps/scripts/maps_client.py search "Statue of Liberty"
191|# Should return lat ~40.689, lon ~-74.044
192|
193|python3 ~/.hermes/skills/maps/scripts/maps_client.py nearby --near "Times Square" --category restaurant --limit 3
194|# Should return a list of restaurants within ~500m of Times Square
195|```
196|