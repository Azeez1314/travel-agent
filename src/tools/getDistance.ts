import { z } from 'zod'
import type { ToolFn } from '../../types'

export const getDistanceToolDefinition = {
  name: 'get_distance',
  parameters: z.object({
    origin: z.string().describe('Starting location or landmark'),
    destination: z.string().describe('Ending location or landmark'),
    mode: z
      .enum(['walking', 'transit', 'driving'])
      .describe('Mode of transport'),
  }).describe('Get travel time and distance between two locations in a city'),
}

type Args = z.infer<typeof getDistanceToolDefinition.parameters>

// Map our mode names → Google Distance Matrix travel mode values
const modeMap: Record<string, string> = {
  walking: 'walking',
  transit: 'transit',
  driving: 'driving',
}

export const getDistance: ToolFn<Args, string> = async ({ toolArgs }) => {
  const { origin, destination, mode } = toolArgs

  // Google Maps Distance Matrix API
  // Docs: https://developers.google.com/maps/documentation/distance-matrix/distance-matrix
  const params = new URLSearchParams({
    origins: origin,
    destinations: destination,
    mode: modeMap[mode],
    units: 'metric',
    language: 'en',
    key: process.env.GOOGLE_API_KEY!,
  })

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Distance Matrix request failed: ${res.status} ${res.statusText}`)
  }

  type DistanceElement = {
    status: string
    distance?: { text: string; value: number }
    duration?: { text: string; value: number }
  }
  type DistanceMatrixResponse = {
    status: string
    error_message?: string
    origin_addresses?: string[]
    destination_addresses?: string[]
    rows?: Array<{ elements: DistanceElement[] }>
  }

  const json = await res.json() as DistanceMatrixResponse

  // Top-level API status
  if (json.status !== 'OK') {
    throw new Error(`Distance Matrix API error: ${json.status} — ${json.error_message ?? 'unknown'}`)
  }

  const element = json.rows?.[0]?.elements?.[0]
  if (!element || element.status !== 'OK') {
    return `Could not calculate ${mode} distance from "${origin}" to "${destination}". The route may not exist for this mode of transport.`
  }

  const result = {
    origin: json.origin_addresses?.[0] ?? origin,       // array may be empty
    destination: json.destination_addresses?.[0] ?? destination,
    mode,
    distance: element.distance?.text ?? null,         // e.g. "3.2 km"
    distanceMeters: element.distance?.value ?? null,  // e.g. 3200
    duration: element.duration?.text ?? null,         // e.g. "12 mins"
    durationSeconds: element.duration?.value ?? null, // e.g. 720
    tip: mode === 'transit'
      ? 'Check Google Maps for the exact line and platform before you go.'
      : undefined,
  }

  return JSON.stringify(result, null, 2)
}
