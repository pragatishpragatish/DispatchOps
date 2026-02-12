"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ReliabilityScore {
  id: string
  vehicle_id: string
  ontime_pickup_score?: number
  ontime_delivery_score?: number
  communication_score?: number
  behavior_score?: number
  vehicle_condition_score?: number
  trips_completed?: number
}

interface Vehicle {
  id: string
  owner_id: string
  vehicle_type: string
  vehicle_model?: string
  body_type?: string
  gvw_tons?: number
  payload_tons?: number
  registration_number?: string
  min_rate_per_km?: number
  min_trip_rate?: number
  city_only: boolean
  max_distance_km?: number
  active: boolean
  owners?: {
    owner_name: string
    phone_primary: string
  }
  reliability_scores?: ReliabilityScore[]
}

export function VehiclesList({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    city: searchParams.get('city') || '',
    minRate: searchParams.get('minRate') || '',
    active: searchParams.get('active') || '',
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    router.push(`/vehicles?${params.toString()}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) {
      alert('Error deleting vehicle: ' + error.message)
    } else {
      router.refresh()
    }
  }

  const getReliabilityScore = (vehicle: Vehicle): number => {
    const score = vehicle.reliability_scores?.[0]
    if (!score) return 0
    const scores = [
      score.ontime_pickup_score,
      score.ontime_delivery_score,
      score.communication_score,
      score.behavior_score,
      score.vehicle_condition_score,
    ].filter(s => s !== null && s !== undefined) as number[]
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  }

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < Math.round(score) ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{score.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vehicle Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="pickup">Pickup</option>
              <option value="lcv">LCV</option>
              <option value="truck">Truck</option>
              <option value="container">Container</option>
              <option value="trailer">Trailer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City Only</label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All</option>
              <option value="city">City Only</option>
              <option value="any">Any Distance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Rate/km</label>
            <input
              type="number"
              value={filters.minRate}
              onChange={(e) => handleFilterChange('minRate', e.target.value)}
              placeholder="Min rate"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={filters.active}
              onChange={(e) => handleFilterChange('active', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {vehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No vehicles found</div>
        ) : (
          vehicles.map((vehicle) => {
            const score = getReliabilityScore(vehicle)
            return (
              <div key={vehicle.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{vehicle.vehicle_type}</h3>
                    {vehicle.registration_number && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{vehicle.registration_number}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/vehicles/${vehicle.id}/edit`}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {vehicle.owners && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Owner: {vehicle.owners.owner_name}</p>
                )}
                {vehicle.payload_tons && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Capacity: {vehicle.payload_tons} tons</p>
                )}
                {score > 0 && (
                  <div className="mb-2">{renderStars(score)}</div>
                )}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded-full ${vehicle.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {vehicle.active ? 'Active' : 'Inactive'}
                  </span>
                  {vehicle.min_rate_per_km && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">₹{vehicle.min_rate_per_km}/km</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Registration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ton</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reliability</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rate/km</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No vehicles found</td>
              </tr>
            ) : (
              vehicles.map((vehicle) => {
                const score = getReliabilityScore(vehicle)
                return (
                  <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {vehicle.vehicle_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.vehicle_model || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.registration_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.payload_tons ? `${vehicle.payload_tons} tons` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.owners?.owner_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {score > 0 ? renderStars(score) : <span className="text-gray-400">No data</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.min_rate_per_km ? `₹${vehicle.min_rate_per_km}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${vehicle.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {vehicle.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/vehicles/${vehicle.id}/edit`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
