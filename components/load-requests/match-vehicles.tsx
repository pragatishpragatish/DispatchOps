"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { VehicleMatch } from '@/lib/matching'

interface LoadRequest {
  id: string
  pickup_location: string
  drop_location: string
  weight_tons?: number
  vehicle_type_needed: string
  quoted_budget?: number
}

export function MatchVehicles({ request, matches }: { request: LoadRequest; matches: VehicleMatch[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [clientRate, setClientRate] = useState(request.quoted_budget?.toString() || '')
  const [ownerRate, setOwnerRate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateTrip = async () => {
    if (!selectedVehicle || !clientRate) {
      alert('Please select a vehicle and enter client rate')
      return
    }

    setLoading(true)
    try {
      // Get vehicle details
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('owner_id')
        .eq('id', selectedVehicle)
        .single()

      if (!vehicle) throw new Error('Vehicle not found')

      // Create trip
      // Note: margin_amount is a GENERATED column, so we don't include it in the insert
      // owner_rate is required by the schema, so we use client_rate as default if not provided
      const tripData = {
        load_request_id: request.id,
        vehicle_id: selectedVehicle,
        owner_id: vehicle.owner_id,
        client_rate: parseFloat(clientRate),
        owner_rate: ownerRate ? parseFloat(ownerRate) : parseFloat(clientRate), // Use client_rate as fallback
      }
      
      const { error: tripError } = await supabase.from('trips').insert([tripData])

      if (tripError) throw tripError

      // Update load request status
      await supabase
        .from('load_requests')
        .update({ status: 'matched' })
        .eq('id', request.id)

      router.push('/trips')
      router.refresh()
    } catch (error: any) {
      alert('Error creating trip: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < Math.round(score) ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
        <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">{score.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Request Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Route</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {request.pickup_location} → {request.drop_location}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Type</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{request.vehicle_type_needed}</p>
          </div>
          {request.weight_tons && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{request.weight_tons} tons</p>
            </div>
          )}
          {request.quoted_budget && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Quoted Budget</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">₹{request.quoted_budget.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Matching Vehicles (Top {matches.length} Best Matches)
        </h2>
        {matches.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No matching vehicles found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Owner/Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Driver Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Preferred Routes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Avoid Routes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Match Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {matches.map((match, index) => (
                  <tr
                    key={match.vehicle_id}
                    className={`cursor-pointer transition-colors ${
                      selectedVehicle === match.vehicle_id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      setSelectedVehicle(match.vehicle_id)
                      if (match.min_rate_per_km) {
                        setOwnerRate((match.min_rate_per_km * 100).toString()) // Estimate based on rate/km
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                          index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {match.vehicle_model || match.registration_number || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {match.vehicle_type}
                        {match.registration_number && match.vehicle_model && (
                          <span className="ml-1">({match.registration_number})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {match.owner_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {match.driver_phone ? (
                        <a
                          href={`tel:${match.driver_phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          {match.driver_phone}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {match.preferred_routes && match.preferred_routes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {match.preferred_routes.slice(0, 3).map((route, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                              {route}
                            </span>
                          ))}
                          {match.preferred_routes.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{match.preferred_routes.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {match.avoid_routes && match.avoid_routes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {match.avoid_routes.slice(0, 3).map((route, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            >
                              {route}
                            </span>
                          ))}
                          {match.avoid_routes.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{match.avoid_routes.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {match.min_rate_per_km && (
                          <div>Rate: ₹{match.min_rate_per_km}/km</div>
                        )}
                        {match.payload_tons && (
                          <div>Capacity: {match.payload_tons} tons</div>
                        )}
                        {match.max_distance_km && (
                          <div>Max: {match.max_distance_km} km</div>
                        )}
                        {match.reliability_score !== undefined && match.reliability_score > 0 && (
                          <div className="mt-1">{renderStars(match.reliability_score)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {match.match_score.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {index === 0 ? 'Best Match' : index < 3 ? 'Good Match' : 'Match'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedVehicle && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create Trip</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Rate (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={clientRate}
                onChange={(e) => setClientRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Amount charged to client"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Owner Rate (₹) <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={ownerRate}
                onChange={(e) => setOwnerRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Amount paid to owner"
              />
            </div>
          </div>
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Note: Revenue is generated through coordination fees invoiced separately, not through margin between rates.
            </p>
          </div>
          <div className="flex justify-end space-x-4">
            <Link
              href="/load-requests"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              onClick={handleCreateTrip}
              disabled={loading || !clientRate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
