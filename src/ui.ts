import ora from 'ora'
import type { AIMessage } from '../types'

export const showLoader = (text: string) => {
  const spinner = ora({ text, color: 'cyan' }).start()
  return {
    stop:    () => spinner.stop(),
    succeed: (text?: string) => spinner.succeed(text),
    fail:    (text?: string) => spinner.fail(text),
    update:  (text: string)  => (spinner.text = text),
  }
}

export const logMessage = (message: AIMessage) => {
  const roleColors = { user: '\x1b[36m', assistant: '\x1b[32m' }
  const reset = '\x1b[0m'
  const role  = message.role
  const color = roleColors[role as keyof typeof roleColors] || '\x1b[37m'

  if (role === 'tool') {
    // If the tool response looks like a DALL-E image URL, print it visibly
    const content = (message as any).content as string
    if (typeof content === 'string' && content.startsWith('https://') && content.includes('blob.core.windows.net')) {
      const yellow = '\x1b[33m'
      console.log(`\n${yellow}[IMAGE GENERATED]${reset}`)
      console.log(`${yellow}🖼️  Open this URL in your browser (expires in ~1 hour):${reset}`)
      console.log(`${content}\n`)
    }
    return
  }

  if (role === 'user') {
    console.log(`\n${color}[USER]${reset}`)
    console.log(`${message.content}\n`)
    return
  }

  if (role === 'assistant') {
    if ('tool_calls' in message && message.tool_calls) {
      message.tool_calls.forEach((tool) => {
        console.log(`\n${color}[ASSISTANT]${reset}`)
        console.log(`${tool.function.name}\n`)
      })
      return
    }
    if (message.content) {
      console.log(`\n${color}[ASSISTANT]${reset}`)
      console.log(`${message.content}\n`)
    }
  }
}
