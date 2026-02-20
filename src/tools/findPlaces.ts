import { z } from 'zod'
import type { ToolFn } from '../../types'

export const findPlacesToolDefinition = {
  name: 'find_places',
  parameters: z.object({
    city: z.string().describe('City to search in'),
    category: z
      .enum(['restaurant', 'attraction', 'museum', 'park', 'shopping'])
      .describe('Type of place to find'),
    cuisine: z
      .string()
      .nullable()
      .optional()
      .describe('Cuisine type e.g. "ramen", "sushi" — restaurants only'),
    budget: z
      .enum(['budget', 'mid-range', 'luxury'])
      .describe('Price range preference'),
  }).describe('Find top-rated restaurants and attractions in a city'),
}

type Args = z.infer<typeof findPlacesToolDefinition.parameters>

// Map our category names → Google Places "includedType" values
// https://developers.google.com/maps/documentation/places/web-service/place-types
const categoryToType: Record<string, string> = {
  restaurant: 'restaurant',
  attraction: 'tourist_attraction',
  museum: 'museum',
  park: 'park',
  shopping: 'shopping_mall',
}

// Map budget preference → Google price_levels filter
const budgetToPriceLevel: Record<string, string> = {
  budget: 'PRICE_LEVEL_INEXPENSIVE',
  'mid-range': 'PRICE_LEVEL_MODERATE',
  luxury: 'PRICE_LEVEL_EXPENSIVE',
}

export const findPlaces: ToolFn<Args, string> = async ({ toolArgs }) => {
  const { city, category, cuisine, budget } = toolArgs

  // Build a natural language text query
  const queryParts = [
    cuisine ?? null,
    category,
    'in',
    city,
  ].filter(Boolean)
  const textQuery = queryParts.join(' ')

  // Google Places API (New) — Text Search
  // Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
  const url = 'https://places.googleapis.com/v1/places:searchText'

  const body = {
    textQuery,
    languageCode: 'en',
    maxResultCount: 8,
    // Restrict results to the correct place type (e.g. tourist_attraction, museum)
    includedType: categoryToType[category],
    // Filter by price level
    ...(budgetToPriceLevel[budget] && {
      priceLevels: [budgetToPriceLevel[budget]],
    }),
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Field mask — only request what we need (billed per field)
      'X-Goog-FieldMask':
        'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.types,places.websiteUri,places.regularOpeningHours',
      'X-Goog-Api-Key': process.env.GOOGLE_API_KEY!,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Google Places search failed: ${res.status} ${res.statusText} — ${errText}`)
  }

  const json = await res.json() as { places?: any[] }
  const places: any[] = json.places ?? []

  const results = places.map((p: any) => ({
    name: p?.displayName?.text ?? 'Unknown',
    address: p?.formattedAddress ?? null,
    rating: p?.rating ?? null,
    totalRatings: p?.userRatingCount ?? null,
    priceLevel: p?.priceLevel ?? null,
    types: p?.types ?? [],
    website: p?.websiteUri ?? null,
    openNow: p?.regularOpeningHours?.openNow ?? null,
  }))

  if (results.length === 0) {
    return `No ${category} places found in ${city} for the "${budget}" budget.`
  }

  return JSON.stringify({ city, category, budget, results }, null, 2)
}
