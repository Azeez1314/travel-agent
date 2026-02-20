import { z } from 'zod'
import type { ToolFn } from '../../types'

export const findPlacesToolDefinition = {
  name: 'find_places',
  parameters: z.object({
    city:     z.string().describe('City to search in'),
    category: z.enum(['restaurant', 'attraction', 'museum', 'park', 'shopping'])
                .describe('Type of place to find'),
    cuisine:  z.string().nullable().optional().describe('Cuisine type e.g. "ramen", "sushi" — restaurants only'),
    budget:   z.enum(['budget', 'mid-range', 'luxury']).describe('Price range preference'),
  }).describe('Find top-rated restaurants and attractions in a city'),
}

type Args = z.infer<typeof findPlacesToolDefinition.parameters>

export const findPlaces: ToolFn<Args, string> = async ({ toolArgs }) => {
  const places: Record<string, object[]> = {
    restaurant: [
      { name: 'Ichiran Ramen Shibuya', rating: 4.7, price: '$', cuisine: 'Ramen',   address: '1-22-7 Dogenzaka, Shibuya' },
      { name: 'Sukiyabashi Jiro',      rating: 4.9, price: '$$$', cuisine: 'Sushi', address: '4-2-15 Ginza, Chuo' },
      { name: 'Gonpachi Nishi-Azabu',  rating: 4.5, price: '$$', cuisine: 'Yakitori', address: '1-13-11 Nishi-Azabu, Minato' },
    ],
    attraction: [
      { name: 'Senso-ji Temple',     rating: 4.8, type: 'Temple',  area: 'Asakusa',    free: true },
      { name: 'Shibuya Crossing',    rating: 4.9, type: 'Landmark', area: 'Shibuya',   free: true },
      { name: 'teamLab Borderless',  rating: 4.8, type: 'Museum',  area: 'Odaiba',     price: '$25' },
    ],
  }

  const results = places[toolArgs.category] ?? places['attraction']
  return JSON.stringify(
    { city: toolArgs.city, category: toolArgs.category, results },
    null, 2
  )
}
