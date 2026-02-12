import { createClient } from '@/lib/supabase/server'

export interface MatchingCriteria {
  vehicle_type_needed: string
  route?: string
  weight?: number
  pickup_location?: string
  drop_location?: string
}

export interface VehicleMatch {
  vehicle_id: string
  owner_id: string
  vehicle_type: string
  vehicle_model?: string
  registration_number?: string
  min_rate_per_km?: number
  payload_tons?: number
  max_distance_km?: number
  preferred_routes?: string[]
  avoid_routes?: string[]
  city_only?: boolean
  reliability_score?: number
  match_score: number
  owner_name?: string
  driver_phone?: string
}

export async function findMatchingVehicles(criteria: MatchingCriteria): Promise<VehicleMatch[]> {
  const supabase = await createClient()
  
  // Base query for vehicles matching type and active status
  let query = supabase
    .from('vehicles')
    .select(`
      id,
      owner_id,
      vehicle_type,
      vehicle_model,
      registration_number,
      min_rate_per_km,
      payload_tons,
      max_distance_km,
      preferred_routes,
      avoid_routes,
      city_only,
      active,
      owners (
        owner_name,
        phone_primary,
        phone_alternate
      ),
      reliability_scores (
        ontime_pickup_score,
        ontime_delivery_score,
        communication_score,
        behavior_score,
        vehicle_condition_score
      )
    `)
    .eq('vehicle_type', criteria.vehicle_type_needed)
    .eq('active', true)

  const { data: vehicles, error } = await query

  if (error || !vehicles) return []

  // Calculate match scores
  const matches: VehicleMatch[] = vehicles.map((vehicle: any) => {
    let score = 0
    const reasons: string[] = []

    // Calculate reliability score
    const reliability = vehicle.reliability_scores?.[0]
    let avgReliability = 0
    if (reliability) {
      const scores = [
        reliability.ontime_pickup_score,
        reliability.ontime_delivery_score,
        reliability.communication_score,
        reliability.behavior_score,
        reliability.vehicle_condition_score,
      ].filter(s => s !== null && s !== undefined) as number[]
      avgReliability = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      score += avgReliability * 20 // Reliability contributes up to 100 points
    }

    // Route preference matching
    if (criteria.route && vehicle.preferred_routes) {
      const routeMatch = vehicle.preferred_routes.some((r: string) =>
        r.toLowerCase().includes(criteria.route!.toLowerCase()) ||
        criteria.route!.toLowerCase().includes(r.toLowerCase())
      )
      if (routeMatch) {
        score += 30
        reasons.push('Preferred route match')
      }
    }

    // Avoid routes check
    if (criteria.route && vehicle.avoid_routes) {
      const avoidMatch = vehicle.avoid_routes.some((r: string) =>
        r.toLowerCase().includes(criteria.route!.toLowerCase())
      )
      if (avoidMatch) {
        score -= 50 // Heavy penalty for avoided routes
        reasons.push('Avoids this route')
      }
    }

    // Weight/capacity matching
    if (criteria.weight && vehicle.payload_tons) {
      if (vehicle.payload_tons >= criteria.weight) {
        score += 20
        reasons.push('Capacity sufficient')
      } else {
        score -= 30 // Penalty for insufficient capacity
        reasons.push('Insufficient capacity')
      }
    }

    // Rate competitiveness (lower rate = higher score, but not too low)
    if (vehicle.min_rate_per_km) {
      // Assume competitive rate is between 10-50 per km
      if (vehicle.min_rate_per_km >= 10 && vehicle.min_rate_per_km <= 50) {
        score += 10
      }
    }

    // Distance limit check
    if (criteria.route && vehicle.max_distance_km) {
      // Simple heuristic: if route contains distance info or city_only
      if (vehicle.city_only) {
        score += 5
        reasons.push('City operations')
      }
    }

    return {
      vehicle_id: vehicle.id,
      owner_id: vehicle.owner_id,
      vehicle_type: vehicle.vehicle_type,
      vehicle_model: vehicle.vehicle_model,
      registration_number: vehicle.registration_number,
      min_rate_per_km: vehicle.min_rate_per_km,
      payload_tons: vehicle.payload_tons,
      max_distance_km: vehicle.max_distance_km,
      preferred_routes: vehicle.preferred_routes,
      avoid_routes: vehicle.avoid_routes,
      city_only: vehicle.city_only,
      reliability_score: avgReliability,
      match_score: Math.max(0, score), // Ensure non-negative
      owner_name: vehicle.owners?.owner_name,
      driver_phone: vehicle.owners?.phone_primary || vehicle.owners?.phone_alternate,
    }
  })

  // Sort by match score descending and limit to top 10
  return matches.sort((a, b) => b.match_score - a.match_score).slice(0, 10)
}
