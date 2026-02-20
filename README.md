# Agent for Travel — AI Travel Planner

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

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

See [QUICKSTART.md](./QUICKSTART.md) for full setup and usage instructions.

**TL;DR:**

```bash
npm install
cp .env.example .env   # add your OPENAI_API_KEY
npx tsx index.ts "Plan me a 5-day trip to Tokyo on a $2000 budget, departing from New York (JFK) on 2025-06-01, returning 2025-06-06"
```

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

- Found a bug? [Open an issue](https://github.com/wikimasters/agent-for-travel/issues)
- Want to add a feature? [Submit a pull request](https://github.com/wikimasters/agent-for-travel/pulls)

---

## License

[MIT](./LICENSE) — free to use, modify, and distribute.
