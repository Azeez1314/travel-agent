# Quickstart

## Prerequisites

- Node.js 18+ (or Bun)
- An [OpenAI API key](https://platform.openai.com/api-keys)

---

## 1. Install dependencies

```bash
npm install
```

---

## 2. Set up your environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then open `.env` and add your key:

```
OPENAI_API_KEY=sk-...
```

> **Note:** `.env` is gitignored and will never be committed.

---

## 3. Run the agent

Pass your travel request as a quoted string:

```bash
npx tsx index.ts "Plan me a 5-day trip to Tokyo on a $2000 budget, departing from New York (JFK) on 2025-06-01, returning 2025-06-06"
```

For best results, include:
- **Budget** — e.g. `$2000 budget`
- **Departure city** — e.g. `departing from New York (JFK)`
- **Travel dates** — e.g. `2025-06-01` to `2025-06-06`

The agent will automatically:
1. Search for available flights
2. Find hotels within your remaining budget
3. Discover restaurants and attractions for each day
4. Calculate travel times between locations
5. Generate a day-by-day itinerary

---

## 4. Example output

```
[ASSISTANT]
search_flights

[ASSISTANT]
search_hotels

[ASSISTANT]
find_places

[ASSISTANT]
get_distance

[ASSISTANT]
### 3-Day Tokyo Itinerary

**Flight:** ANA NH 847 — JFK 21:15 → NRT 05:10+1 — $595

**Hotel:** Shinjuku Granbell Hotel — $95/night × 3 nights = $285

**Day 1 — Arrival & Shinjuku**
...
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Missing required environment variable: OPENAI_API_KEY` | Add your key to `.env` |
| `PermissionDeniedError: does not have access to model dall-e-3` | Your OpenAI project lacks DALL-E 3 access — image generation will be skipped gracefully |
| Agent stops after first message without calling tools | Make sure your request includes budget, departure city, and dates |
| Stale conversation errors on re-run | The DB is cleared automatically on each run — if issues persist, delete `db.json` manually |
