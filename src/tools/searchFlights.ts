import { z } from 'zod'
import type { ToolFn } from '../../types'

export const searchFlightsToolDefinition = {
  name: 'search_flights',
  parameters: z.object({
    origin: z.string().describe('Origin city or airport code, e.g. "LOS" or "Lagos"'),
    destination: z.string().describe('Destination city or airport code, e.g. "NRT" or "Tokyo"'),
    departureDate: z.string().describe('Departure date in YYYY-MM-DD format'),
    returnDate: z.string().describe('Return date in YYYY-MM-DD format'),
    budget: z.number().describe('Max total flight budget in USD'),
  }).describe('Search for available flights between two cities within a budget'),
}

type Args = z.infer<typeof searchFlightsToolDefinition.parameters>

// ─── Step 1: Resolve a city/airport name → { skyId, entityId } ──────────────
const searchAirport = async (query: string): Promise<{ skyId: string; entityId: string }> => {
  const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${encodeURIComponent(query)}&locale=en-US`
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
      'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
    },
  })
  if (!res.ok) throw new Error(`Airport lookup failed for "${query}": ${res.status} ${res.statusText}`)

  type AirportResult = { skyId: string; entityId: string; [key: string]: any }
  const json = await res.json() as { data?: AirportResult[] }

  const place = json.data?.[0]
  if (!place) throw new Error(`No airport found for "${query}"`)
  return { skyId: place.skyId, entityId: place.entityId }
}

// ─── Step 2: Search flights ──────────────────────────────────────────────────
export const searchFlights: ToolFn<Args, string> = async ({ toolArgs }) => {
  const { origin, destination, departureDate, returnDate, budget } = toolArgs

  // Resolve entity IDs for both airports (required by Sky Scrapper API)
  const [originPlace, destinationPlace] = await Promise.all([
    searchAirport(origin),
    searchAirport(destination),
  ])

  const params = new URLSearchParams({
    originSkyId: originPlace.skyId,
    destinationSkyId: destinationPlace.skyId,
    originEntityId: originPlace.entityId,
    destinationEntityId: destinationPlace.entityId,
    date: departureDate,
    returnDate,
    cabinClass: 'economy',
    adults: '1',
    currency: 'USD',
    market: 'US',
    countryCode: 'US',
    locale: 'en-US',
    sortBy: 'best',
  })

  const url = `https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlightsComplete?${params}`
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
      'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
    },
  })
  if (!res.ok) throw new Error(`Flight search failed: ${res.status} ${res.statusText}`)

  type FlightResponse = { data?: { itineraries?: any[] } }
  const json = await res.json() as FlightResponse
  const itineraries: any[] = json.data?.itineraries ?? []

  // Normalise to a flat, readable shape and filter by budget
  const flights = itineraries
    .map((it: any) => {
      const price: number = it?.price?.raw ?? Infinity
      const outbound = it?.legs?.[0]
      const ret = it?.legs?.[1]
      const carrier = outbound?.carriers?.marketing?.[0]
      const seg = outbound?.segments?.[0]
      return {
        airline: carrier?.name ?? 'Unknown',
        flightNumber: seg ? `${carrier?.alternateId ?? ''} ${seg.flightNumber}`.trim() : 'N/A',
        departure: outbound?.departure ?? departureDate,
        arrival: outbound?.arrival ?? 'N/A',
        returnDeparture: ret?.departure ?? returnDate,
        durationMinutes: outbound?.durationInMinutes ?? null,
        stops: outbound?.stopCount ?? 0,
        price,
        priceFormatted: it?.price?.formatted ?? `$${price}`,
        class: 'Economy',
      }
    })
    .filter((f) => f.price <= budget)
    .slice(0, 5) // return top 5 results

  if (flights.length === 0) {
    return `No flights found from ${origin} to ${destination} within $${budget} budget.`
  }

  return JSON.stringify(flights, null, 2)
}
