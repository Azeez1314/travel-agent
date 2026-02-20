import type { AIMessage } from '../types.ts'
import { runLLM } from './llm.ts'
import { z } from 'zod'
import { runTool } from './toolRunner.ts'
import { addMessages, getMessages, saveToolResponse } from './memory.ts'
import { logMessage, showLoader } from './ui.ts'

export const runAgent = async ({
  turns = 20,
  userMessage,
  tools = [],
}: {
  turns?: number
  userMessage: string
  tools?: { name: string; parameters: z.AnyZodObject }[]
}) => {
  await addMessages([{ role: 'user', content: userMessage }])

  const loader = showLoader('Planning your trip...')

  let turnsLeft = turns
  while (turnsLeft > 0) {
    turnsLeft--
    const history = await getMessages()
    const response = await runLLM({ messages: history, tools })
    await addMessages([response])
    logMessage(response)

    if (response.tool_calls && response.tool_calls.length > 0) {
      const toolCall = response.tool_calls[0]
      loader.update(`executing: ${toolCall.function.name}`)
      const toolResponse = await runTool(toolCall, userMessage)
      await saveToolResponse(toolCall.id, toolResponse)
      loader.update(`executed: ${toolCall.function.name}`)
    } else {
      // No tool calls — this is the final text response
      loader.stop()
      return getMessages()
    }
  }

  loader.fail('Max turns reached without a final response')
  return getMessages()
}
