1|---
2|name: polymarket
3|description: "Query Polymarket: markets, prices, orderbooks, history."
4|version: 1.0.0
5|author: Hermes Agent + Teknium
6|tags: [polymarket, prediction-markets, market-data, trading]
7|platforms: [linux, macos, windows]
8|---
9|
10|# Polymarket — Prediction Market Data
11|
12|Query prediction market data from Polymarket using their public REST APIs.
13|All endpoints are read-only and require zero authentication.
14|
15|See `references/api-endpoints.md` for the full endpoint reference with curl examples.
16|
17|## When to Use
18|
19|- User asks about prediction markets, betting odds, or event probabilities
20|- User wants to know "what are the odds of X happening?"
21|- User asks about Polymarket specifically
22|- User wants market prices, orderbook data, or price history
23|- User asks to monitor or track prediction market movements
24|
25|## Key Concepts
26|
27|- **Events** contain one or more **Markets** (1:many relationship)
28|- **Markets** are binary outcomes with Yes/No prices between 0.00 and 1.00
29|- Prices ARE probabilities: price 0.65 means the market thinks 65% likely
30|- `outcomePrices` field: JSON-encoded array like `["0.80", "0.20"]`
31|- `clobTokenIds` field: JSON-encoded array of two token IDs [Yes, No] for price/book queries
32|- `conditionId` field: hex string used for price history queries
33|- Volume is in USDC (US dollars)
34|
35|## Three Public APIs
36|
37|1. **Gamma API** at `gamma-api.polymarket.com` — Discovery, search, browsing
38|2. **CLOB API** at `clob.polymarket.com` — Real-time prices, orderbooks, history
39|3. **Data API** at `data-api.polymarket.com` — Trades, open interest
40|
41|## Typical Workflow
42|
43|When a user asks about prediction market odds:
44|
45|1. **Search** using the Gamma API public-search endpoint with their query
46|2. **Parse** the response — extract events and their nested markets
47|3. **Present** market question, current prices as percentages, and volume
48|4. **Deep dive** if asked — use clobTokenIds for orderbook, conditionId for history
49|
50|## Presenting Results
51|
52|Format prices as percentages for readability:
53|- outcomePrices `["0.652", "0.348"]` becomes "Yes: 65.2%, No: 34.8%"
54|- Always show the market question and probability
55|- Include volume when available
56|
57|Example: `"Will X happen?" — 65.2% Yes ($1.2M volume)`
58|
59|## Parsing Double-Encoded Fields
60|
61|The Gamma API returns `outcomePrices`, `outcomes`, and `clobTokenIds` as JSON strings
62|inside JSON responses (double-encoded). When processing with Python, parse them with
63|`json.loads(market['outcomePrices'])` to get the actual array.
64|
65|## Rate Limits
66|
67|Generous — unlikely to hit for normal usage:
68|- Gamma: 4,000 requests per 10 seconds (general)
69|- CLOB: 9,000 requests per 10 seconds (general)
70|- Data: 1,000 requests per 10 seconds (general)
71|
72|## Limitations
73|
74|- This skill is read-only — it does not support placing trades
75|- Trading requires wallet-based crypto authentication (EIP-712 signatures)
76|- Some new markets may have empty price history
77|- Geographic restrictions apply to trading but read-only data is globally accessible
78|