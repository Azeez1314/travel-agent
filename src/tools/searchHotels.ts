import { z } from 'zod'
import type { ToolFn } from '../../types'

export const searchHotelsToolDefinition = {
  name: 'search_hotels',
  parameters: z.object({
    city:              z.string().describe('City to search hotels in'),
    checkIn:           z.string().describe('Check-in date YYYY-MM-DD'),
    checkOut:          z.string().describe('Check-out date YYYY-MM-DD'),
    maxPricePerNight:  z.number().describe('Maximum price per night in USD'),
    guests:            z.number().describe('Number of guests'),
  }).describe('Find hotels in a city that match budget and dates'),
}

type Args = z.infer<typeof searchHotelsToolDefinition.parameters>

export const searchHotels: ToolFn<Args, string> = async ({ toolArgs }) => {
  const nights = Math.round(
    (new Date(toolArgs.checkOut).getTime() -
     new Date(toolArgs.checkIn).getTime()) /
    (1000 * 60 * 60 * 24)
  )

  const mock = [
    {
      name:          'Shinjuku Granbell Hotel',
      location:      'Shinjuku, Tokyo',
      pricePerNight: 95,
      totalPrice:    95 * nights,
      rating:        4.3,
      amenities:     ['WiFi', 'Breakfast', 'City View'],
    },
    {
      name:          'APA Hotel Akihabara',
      location:      'Akihabara, Tokyo',
      pricePerNight: 72,
      totalPrice:    72 * nights,
      rating:        4.1,
      amenities:     ['WiFi', 'Gym'],
    },
  ].filter(h => h.pricePerNight <= toolArgs.maxPricePerNight)

  return JSON.stringify(mock, null, 2)
}
