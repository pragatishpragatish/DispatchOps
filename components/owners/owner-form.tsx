"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Owner {
  id?: string
  owner_name: string
  driver_name?: string | null
  phone_primary: string
  phone_alternate?: string | null
  whatsapp_available?: boolean
  base_city?: string | null
  base_area?: string | null
  notes?: string | null
}

interface VehicleData {
  vehicle_type: string
  vehicle_model?: string
  registration_number?: string
  payload_tons?: number | null
  min_rate_per_km?: number | null
  max_distance_km?: number | null
  city_only?: boolean
  active?: boolean
}

export function OwnerForm({ owner }: { owner?: Owner }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [formData, setFormData] = useState<Owner>({
    owner_name: owner?.owner_name || '',
    driver_name: owner?.driver_name || '',
    phone_primary: owner?.phone_primary || '',
    phone_alternate: owner?.phone_alternate || '',
    whatsapp_available: owner?.whatsapp_available || false,
    base_city: owner?.base_city || '',
    base_area: owner?.base_area || '',
    notes: owner?.notes || '',
  })
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    vehicle_type: 'pickup',
    vehicle_model: '',
    registration_number: '',
    payload_tons: null,
    min_rate_per_km: null,
    max_distance_km: null,
    city_only: false,
    active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (owner?.id) {
        // Update existing owner
        const { error } = await supabase
          .from('owners')
          .update(formData)
          .eq('id', owner.id)
        if (error) throw error
      } else {
        // Create new owner
        const { data: newOwner, error } = await supabase
          .from('owners')
          .insert([formData])
          .select()
          .single()
        if (error) throw error

        // If vehicle form is shown and has data, create vehicle
        if (showVehicleForm && newOwner?.id) {
          const hasVehicleData = vehicleData.vehicle_type || 
            vehicleData.vehicle_model || 
            vehicleData.registration_number ||
            vehicleData.payload_tons ||
            vehicleData.min_rate_per_km

          if (hasVehicleData) {
            const vehicleSubmitData = {
              owner_id: newOwner.id,
              vehicle_type: vehicleData.vehicle_type || 'pickup',
              vehicle_model: vehicleData.vehicle_model || null,
              registration_number: vehicleData.registration_number || null,
              payload_tons: vehicleData.payload_tons || null,
              min_rate_per_km: vehicleData.min_rate_per_km || null,
              max_distance_km: vehicleData.max_distance_km || null,
              city_only: vehicleData.city_only || false,
              active: vehicleData.active !== undefined ? vehicleData.active : true,
              preferred_routes: [],
              avoid_routes: [],
            }

            const { error: vehicleError } = await supabase
              .from('vehicles')
              .insert([vehicleSubmitData])
            if (vehicleError) {
              console.error('Error creating vehicle:', vehicleError)
              // Don't throw - owner was created successfully
            }
          }
        }
      }
      router.push('/owners')
      router.refresh()
    } catch (error: any) {
      alert('Error saving owner: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Owner Name *
          </label>
          <input
            type="text"
            id="owner_name"
            required
            value={formData.owner_name}
            onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="driver_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Driver Name
          </label>
          <input
            type="text"
            id="driver_name"
            value={formData.driver_name || ''}
            onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="phone_primary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Primary Phone *
          </label>
          <input
            type="tel"
            id="phone_primary"
            required
            value={formData.phone_primary}
            onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="phone_alternate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alternate Phone
          </label>
          <input
            type="tel"
            id="phone_alternate"
            value={formData.phone_alternate || ''}
            onChange={(e) => setFormData({ ...formData, phone_alternate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="base_city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Base City
          </label>
          <input
            type="text"
            id="base_city"
            value={formData.base_city || ''}
            onChange={(e) => setFormData({ ...formData, base_city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="base_area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Base Area
          </label>
          <input
            type="text"
            id="base_area"
            value={formData.base_area || ''}
            onChange={(e) => setFormData({ ...formData, base_area: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.whatsapp_available || false}
            onChange={(e) => setFormData({ ...formData, whatsapp_available: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">WhatsApp Available</span>
        </label>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Optional Vehicle Form - Only show when creating new owner */}
      {!owner?.id && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Vehicle (Optional)</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showVehicleForm}
                onChange={(e) => setShowVehicleForm(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Add vehicle now</span>
            </label>
          </div>

          {showVehicleForm && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    id="vehicle_type"
                    value={vehicleData.vehicle_type}
                    onChange={(e) => setVehicleData({ ...vehicleData, vehicle_type: e.target.value })}
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
                    value={vehicleData.vehicle_model || ''}
                    onChange={(e) => setVehicleData({ ...vehicleData, vehicle_model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Tata 407"
                  />
                </div>

                <div>
                  <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    id="registration_number"
                    value={vehicleData.registration_number || ''}
                    onChange={(e) => setVehicleData({ ...vehicleData, registration_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., MH-01-AB-1234"
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
                    value={vehicleData.payload_tons || ''}
                    onChange={(e) => setVehicleData({ ...vehicleData, payload_tons: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 5.0"
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
                    value={vehicleData.min_rate_per_km || ''}
                    onChange={(e) => setVehicleData({ ...vehicleData, min_rate_per_km: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 25.00"
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
                    value={vehicleData.max_distance_km || ''}
                    onChange={(e) => setVehicleData({ ...vehicleData, max_distance_km: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={vehicleData.city_only || false}
                    onChange={(e) => setVehicleData({ ...vehicleData, city_only: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">City Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={vehicleData.active !== undefined ? vehicleData.active : true}
                    onChange={(e) => setVehicleData({ ...vehicleData, active: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 You can add more vehicles later from the Vehicles page
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Link
          href="/owners"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : owner?.id ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
