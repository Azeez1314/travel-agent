import 'dotenv/config'
import { runAgent } from './src/agent.ts'
import { tools } from './src/tools/index.ts'
import { clearMessages } from './src/memory.ts'

const userMessage = process.argv[2]

if (!userMessage) {
  console.error('Please provide a message')
  process.exit(1)
}

try {
  await clearMessages()
  await runAgent({ userMessage, tools })
} catch (err: any) {
  console.error('\n[ERROR]', err?.message ?? err)
  process.exit(1)
}
