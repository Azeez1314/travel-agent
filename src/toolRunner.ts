import type OpenAI from 'openai'
import { searchFlights }  from './tools/searchFlights'
import { searchHotels }   from './tools/searchHotels'
import { findPlaces }     from './tools/findPlaces'
import { getDistance }    from './tools/getDistance'
import { generateImage }  from './tools/generateImage'

export const runTool = async (
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  userMessage: string
): Promise<string> => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments),
  }
  try {
    switch (toolCall.function.name) {
      case 'search_flights':  return await searchFlights(input)
      case 'search_hotels':   return await searchHotels(input)
      case 'find_places':     return await findPlaces(input)
      case 'get_distance':    return await getDistance(input)
      case 'generate_image':  return await generateImage(input)
      default: return `Error: Unknown tool "${toolCall.function.name}"`
    }
  } catch (err: any) {
    return `Error running tool "${toolCall.function.name}": ${err?.message ?? String(err)}`
  }
}
