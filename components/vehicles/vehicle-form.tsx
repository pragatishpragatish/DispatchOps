"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Vehicle {
  id?: string
  owner_id: string
  vehicle_type: string
  vehicle_model?: string | null
  body_type?: string | null
  gvw_tons?: number | null
  payload_tons?: number | null
  length_ft?: number | null
  registration_number?: string | null
  fuel_type?: string | null
  min_rate_per_km?: number | null
  min_trip_rate?: number | null
  preferred_routes?: string[] | null
  avoid_routes?: string[] | null
  city_only?: boolean
  max_distance_km?: number | null
  active?: boolean
}

interface Owner {
  id: string
  owner_name: string
}

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [owners, setOwners] = useState<Owner[]>([])
  const [formData, setFormData] = useState<Vehicle>({
    owner_id: vehicle?.owner_id || '',
    vehicle_type: vehicle?.vehicle_type || 'pickup',
    vehicle_model: vehicle?.vehicle_model || '',
    body_type: vehicle?.body_type || '',
    gvw_tons: vehicle?.gvw_tons || null,
    payload_tons: vehicle?.payload_tons || null,
    length_ft: vehicle?.length_ft || null,
    registration_number: vehicle?.registration_number || '',
    fuel_type: vehicle?.fuel_type || 'diesel',
    min_rate_per_km: vehicle?.min_rate_per_km || null,
    min_trip_rate: vehicle?.min_trip_rate || null,
    preferred_routes: vehicle?.preferred_routes || [],
    avoid_routes: vehicle?.avoid_routes || [],
    city_only: vehicle?.city_only || false,
    max_distance_km: vehicle?.max_distance_km || null,
    active: vehicle?.active !== undefined ? vehicle.active : true,
  })

  useEffect(() => {
    const fetchOwners = async () => {
      const { data } = await supabase.from('owners').select('id, owner_name').order('owner_name')
      if (data) setOwners(data)
    }
    fetchOwners()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        preferred_routes: formData.preferred_routes?.filter(r => r.trim()) || [],
        avoid_routes: formData.avoid_routes?.filter(r => r.trim()) || [],
      }

      if (vehicle?.id) {
        const { error } = await supabase
          .from('vehicles')
          .update(submitData)
          .eq('id', vehicle.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('vehicles')
          .insert([submitData])
        if (error) throw error
      }
      router.push('/vehicles')
      router.refresh()
    } catch (error: any) {
      alert('Error saving vehicle: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addRoute = (type: 'preferred' | 'avoid') => {
    const key = type === 'preferred' ? 'preferred_routes' : 'avoid_routes'
    setFormData({
      ...formData,
      [key]: [...(formData[key] || []), ''],
    })
  }

  const updateRoute = (type: 'preferred' | 'avoid', index: number, value: string) => {
    const key = type === 'preferred' ? 'preferred_routes' : 'avoid_routes'
    const routes = [...(formData[key] || [])]
    routes[index] = value
    setFormData({ ...formData, [key]: routes })
  }

  const removeRoute = (type: 'preferred' | 'avoid', index: number) => {
    const key = type === 'preferred' ? 'preferred_routes' : 'avoid_routes'
    const routes = [...(formData[key] || [])]
    routes.splice(index, 1)
    setFormData({ ...formData, [key]: routes })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Owner *
          </label>
          <select
            id="owner_id"
            required
            value={formData.owner_id}
            onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Owner</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.owner_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vehicle Type *
          </label>
          <select
            id="vehicle_type"
            required
            value={formData.vehicle_type}
            onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="pickup">Pickup</option>
            <option value="lcv">LCV</option>
            <option value="truck">Truck</option>
            <option value="container">Container</option>
            <option value="trailer">Trailer</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="vehicle_model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vehicle Model
          </label>
          <input
            type="text"
            id="vehicle_model"
            value={formData.vehicle_model || ''}
            onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Registration Number
          </label>
          <input
            type="text"
            id="registration_number"
            value={formData.registration_number || ''}
            onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="payload_tons" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payload (Tons)
          </label>
          <input
            type="number"
            step="0.01"
            id="payload_tons"
            value={formData.payload_tons || ''}
            onChange={(e) => setFormData({ ...formData, payload_tons: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="min_rate_per_km" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Min Rate/km (₹)
          </label>
          <input
            type="number"
            step="0.01"
            id="min_rate_per_km"
            value={formData.min_rate_per_km || ''}
            onChange={(e) => setFormData({ ...formData, min_rate_per_km: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="max_distance_km" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Distance (km)
          </label>
          <input
            type="number"
            step="0.01"
            id="max_distance_km"
            value={formData.max_distance_km || ''}
            onChange={(e) => setFormData({ ...formData, max_distance_km: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="flex items-center mt-6">
            <input
              type="checkbox"
              checked={formData.city_only || false}
              onChange={(e) => setFormData({ ...formData, city_only: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">City Only</span>
          </label>
          <label className="flex items-center mt-4">
            <input
              type="checkbox"
              checked={formData.active !== undefined ? formData.active : true}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Routes</label>
        {(formData.preferred_routes || []).map((route, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={route}
              onChange={(e) => updateRoute('preferred', index, e.target.value)}
              placeholder="Route name"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => removeRoute('preferred', index)}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addRoute('preferred')}
          className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Add Preferred Route
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avoid Routes</label>
        {(formData.avoid_routes || []).map((route, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={route}
              onChange={(e) => updateRoute('avoid', index, e.target.value)}
              placeholder="Route name"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => removeRoute('avoid', index)}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addRoute('avoid')}
          className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Add Avoid Route
        </button>
      </div>

      <div className="flex justify-end space-x-4">
        <Link
          href="/vehicles"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : vehicle?.id ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
