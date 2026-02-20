import { z } from 'zod'
import type { ToolFn } from '../../types'

export const searchFlightsToolDefinition = {
  name: 'search_flights',
  parameters: z.object({
    origin:        z.string().describe('Origin city or airport code, e.g. "LOS" or "Lagos"'),
    destination:   z.string().describe('Destination city or airport code, e.g. "NRT" or "Tokyo"'),
    departureDate: z.string().describe('Departure date in YYYY-MM-DD format'),
    returnDate:    z.string().describe('Return date in YYYY-MM-DD format'),
    budget:        z.number().describe('Max total flight budget in USD'),
  }).describe('Search for available flights between two cities within a budget'),
}

type Args = z.infer<typeof searchFlightsToolDefinition.parameters>

export const searchFlights: ToolFn<Args, string> = async ({ toolArgs }) => {
  const mock = [
    {
      airline:       'Japan Airlines',
      flightNumber:  'JL 789',
      departure:     `${toolArgs.origin} at 23:55`,
      arrival:       `${toolArgs.destination} at 06:30+1`,
      duration:      '13h 35m',
      price:         680,
      class:         'Economy',
    },
    {
      airline:       'ANA',
      flightNumber:  'NH 847',
      departure:     `${toolArgs.origin} at 21:15`,
      arrival:       `${toolArgs.destination} at 05:10+1`,
      duration:      '14h 55m',
      price:         595,
      class:         'Economy',
    },
  ].filter(f => f.price <= toolArgs.budget)

  if (mock.length === 0) {
    return `No flights found from ${toolArgs.origin} to ${toolArgs.destination} within $${toolArgs.budget} budget.`
  }

  return JSON.stringify(mock, null, 2)
}