# Agent for Travel — AI Travel Planner

An agentic AI travel planner powered by OpenAI's GPT-4o-mini. Given a natural language request, it autonomously searches for flights, hotels, restaurants, attractions, and distances — then delivers a full day-by-day itinerary.

---

## Features

- Flight search between any two cities
- Hotel search filtered by budget and dates
- Restaurant and attraction discovery by category
- Travel time and distance calculations between locations
- Optional destination image generation via DALL-E 3
- Persistent conversation history via a local JSON database

---

## Tech Stack

| Package  | Purpose                          |
| -------- | -------------------------------- |
| `openai` | LLM + image generation           |
| `zod`    | Tool parameter schema validation |
| `lowdb`  | Lightweight JSON file database   |
| `dotenv` | Environment variable loading     |
| `ora`    | Terminal spinner UI              |
| `uuid`   | Message ID generation            |
| `tsx`    | TypeScript execution             |

---

## Project Structure

```
agent-for-travel/
├── index.ts              # Entry point
├── types.ts              # Shared TypeScript types
├── db.json               # Local conversation store (auto-managed)
├── src/
│   ├── agent.ts          # Main agent loop
│   ├── ai.ts             # OpenAI client
│   ├── llm.ts            # LLM call wrapper
│   ├── memory.ts         # DB read/write helpers
│   ├── systemPrompt.ts   # LLM system instructions
│   ├── toolRunner.ts     # Tool dispatcher
│   ├── ui.ts             # Terminal output helpers
│   └── tools/
│       ├── index.ts          # Tool registry
│       ├── searchFlights.ts  # Flight search tool
│       ├── searchHotels.ts   # Hotel search tool
│       ├── findPlaces.ts     # Restaurant/attraction tool
│       ├── getDistance.ts    # Distance/travel time tool
│       └── generateImage.ts  # DALL-E 3 image tool
```

---

## Quickstart

See [QUICKSTART.md](./QUICKSTART.md) for setup and usage instructions.
