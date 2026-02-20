import { z } from 'zod'
import type { ToolFn } from '../../types'

export const searchHotelsToolDefinition = {
  name: 'search_hotels',
  parameters: z.object({
    city: z.string().describe('City to search hotels in'),
    checkIn: z.string().describe('Check-in date YYYY-MM-DD'),
    checkOut: z.string().describe('Check-out date YYYY-MM-DD'),
    maxPricePerNight: z.number().describe('Maximum price per night in USD'),
    guests: z.number().describe('Number of guests'),
  }).describe('Find hotels in a city that match budget and dates'),
}

type Args = z.infer<typeof searchHotelsToolDefinition.parameters>

// ─── Step 1: Resolve city name → dest_id ────────────────────────────────────
const resolveDestination = async (city: string): Promise<string> => {
  const url = `https://booking-com.p.rapidapi.com/v1/hotels/locations?name=${encodeURIComponent(city)}&locale=en-us`
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
      'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
    },
  })
  if (!res.ok) throw new Error(`Destination lookup failed for "${city}": ${res.status} ${res.statusText}`)

  type LocationResult = { dest_id: string; [key: string]: any }
  const json = await res.json() as LocationResult[]

  const place = json[0]
  if (!place?.dest_id) throw new Error(`No destination found for "${city}"`)
  return place.dest_id
}

// ─── Step 2: Search hotels ───────────────────────────────────────────────────
export const searchHotels: ToolFn<Args, string> = async ({ toolArgs }) => {
  const { city, checkIn, checkOut, maxPricePerNight, guests } = toolArgs

  const nights = Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  )

  const destId = await resolveDestination(city)

  const params = new URLSearchParams({
    dest_id: destId,
    dest_type: 'city',
    checkin_date: checkIn,
    checkout_date: checkOut,
    adults_number: String(guests),
    room_number: '1',
    order_by: 'price',
    filter_by_currency: 'USD',
    locale: 'en-us',
    units: 'metric',
  })

  const url = `https://booking-com.p.rapidapi.com/v1/hotels/search?${params}`
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
      'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
    },
  })
  if (!res.ok) throw new Error(`Hotel search failed: ${res.status} ${res.statusText}`)

  type HotelSearchResponse = { result?: any[] }
  const json = await res.json() as HotelSearchResponse
  const results: any[] = json.result ?? []

  // Normalise and filter by price
  const hotels = results
    .map((h: any) => {
      const pricePerNight: number = h?.min_total_price ? h.min_total_price / Math.max(nights, 1) : Infinity
      return {
        name: h?.hotel_name ?? 'Unknown',
        location: `${h?.district ?? h?.city_name_en ?? city}`,
        pricePerNight: Math.round(pricePerNight),
        totalPrice: Math.round(pricePerNight * nights),
        nights,
        rating: h?.review_score ?? null,
        ratingWord: h?.review_score_word ?? null,
        stars: h?.class ?? null,
        url: h?.url ?? null,
      }
    })
    .filter((h) => h.pricePerNight <= maxPricePerNight)
    .slice(0, 5) // return top 5

  if (hotels.length === 0) {
    return `No hotels found in ${city} under $${maxPricePerNight}/night for ${nights} nights.`
  }

  return JSON.stringify(hotels, null, 2)
}
