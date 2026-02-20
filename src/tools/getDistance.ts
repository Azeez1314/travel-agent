import { z } from 'zod'
import type { ToolFn } from '../../types'

export const getDistanceToolDefinition = {
  name: 'get_distance',
  parameters: z.object({
    origin:      z.string().describe('Starting location or landmark'),
    destination: z.string().describe('Ending location or landmark'),
    mode:        z.enum(['walking', 'transit', 'driving'])
                   .describe('Mode of transport'),
  }).describe('Get travel time and distance between two locations in a city'),
}

type Args = z.infer<typeof getDistanceToolDefinition.parameters>

export const getDistance: ToolFn<Args, string> = async ({ toolArgs }) => {
  const mock = {
    origin:      toolArgs.origin,
    destination: toolArgs.destination,
    mode:        toolArgs.mode,
    distance:    '3.2 km',
    duration:    toolArgs.mode === 'walking' ? '38 mins'
               : toolArgs.mode === 'transit' ? '12 mins'
               : '8 mins',
    tip: toolArgs.mode === 'transit'
       ? 'Take the Yamanote Line — runs every 2-3 minutes'
       : undefined,
  }
  return JSON.stringify(mock, null, 2)
}
