# Contributing to Agent for Travel

Thank you for your interest in contributing! Contributions of all kinds are welcome — bug fixes, new tools, documentation improvements, and more.

---

## Getting Started

1. **Fork** the repository and clone your fork:
   ```bash
   git clone https://github.com/your-username/agent-for-travel.git
   cd agent-for-travel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment:**
   ```bash
   cp .env.example .env
   # Add your OPENAI_API_KEY to .env
   ```

4. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## Project Structure

```
src/
├── agent.ts          # Main agentic loop
├── tools/            # Add new tools here
│   ├── index.ts      # Register tools here
│   └── *.ts          # Individual tool files
```

---

## Adding a New Tool

1. Create a new file in `src/tools/`, e.g. `src/tools/searchCars.ts`.
2. Export a `ToolFn` function and a Zod schema for the parameters.
3. Register the tool in `src/tools/index.ts`.

A minimal tool looks like this:

```typescript
import { z } from 'zod'
import type { ToolFn } from '../../types'

export const searchCarsParameters = z.object({
  city: z.string().describe('City where you want to rent a car'),
  pickupDate: z.string().describe('Pick-up date (YYYY-MM-DD)'),
  dropoffDate: z.string().describe('Drop-off date (YYYY-MM-DD)'),
})

type Args = z.infer<typeof searchCarsParameters>

export const searchCars: ToolFn<Args> = async ({ city, pickupDate, dropoffDate }) => {
  // Your implementation here
  return JSON.stringify({ city, pickupDate, dropoffDate, result: '...' })
}
```

---

## Code Style

- **Formatter:** [Prettier](https://prettier.io/) — run `npx prettier --write .` before committing.
- **Language:** TypeScript with `strict: true`.
- **No semicolons**, single quotes (enforced by `.prettierrc`).

---

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR.
- Write a clear PR title and description explaining the motivation.
- Make sure the project runs cleanly with your changes:
  ```bash
  npx tsx index.ts "Plan a weekend trip to Paris"
  ```
- If you add a new tool, mention it in the PR description with an example prompt that exercises it.

---

## Reporting Issues

Open an issue and include:
- Node.js version (`node --version`)
- The exact command you ran
- The full error output

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
