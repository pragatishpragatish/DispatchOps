"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface LoadProvider {
  id: string
  company_name: string
}

export function LoadRequestForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<LoadProvider[]>([])
  const [formData, setFormData] = useState({
    provider_id: '',
    pickup_location: '',
    drop_location: '',
    material_type: '',
    weight_tons: '',
    distance_km: '',
    vehicle_type_needed: 'pickup',
    quoted_budget: '',
    status: 'open',
    required_date: '',
    notes: '',
  })

  useEffect(() => {
    const fetchProviders = async () => {
      const { data } = await supabase.from('load_providers').select('id, company_name').order('company_name')
      if (data) setProviders(data)
    }
    fetchProviders()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        weight_tons: formData.weight_tons ? parseFloat(formData.weight_tons) : null,
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
        quoted_budget: formData.quoted_budget ? parseFloat(formData.quoted_budget) : null,
        required_date: formData.required_date || null,
      }

      const { error } = await supabase.from('load_requests').insert([submitData])
      if (error) throw error

      router.push('/load-requests')
      router.refresh()
    } catch (error: any) {
      alert('Error creating load request: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="provider_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Load Provider *
          </label>
          <select
            id="provider_id"
            required
            value={formData.provider_id}
            onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.company_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vehicle_type_needed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vehicle Type Needed *
          </label>
          <select
            id="vehicle_type_needed"
            required
            value={formData.vehicle_type_needed}
            onChange={(e) => setFormData({ ...formData, vehicle_type_needed: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="pickup">Pickup</option>
            <option value="lcv">LCV</option>
            <option value="truck">Truck</option>
            <option value="container">Container</option>
            <option value="trailer">Trailer</option>
          </select>
        </div>

        <div>
          <label htmlFor="pickup_location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pickup Location *
          </label>
          <input
            type="text"
            id="pickup_location"
            required
            value={formData.pickup_location}
            onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="drop_location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Drop Location *
          </label>
          <input
            type="text"
            id="drop_location"
            required
            value={formData.drop_location}
            onChange={(e) => setFormData({ ...formData, drop_location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="weight_tons" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Weight (Tons)
          </label>
          <input
            type="number"
            step="0.01"
            id="weight_tons"
            value={formData.weight_tons}
            onChange={(e) => setFormData({ ...formData, weight_tons: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="distance_km" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Distance (km)
          </label>
          <input
            type="number"
            step="0.01"
            id="distance_km"
            value={formData.distance_km}
            onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Distance in kilometers"
          />
        </div>

        <div>
          <label htmlFor="quoted_budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quoted Budget (₹)
          </label>
          <input
            type="number"
            step="0.01"
            id="quoted_budget"
            value={formData.quoted_budget}
            onChange={(e) => setFormData({ ...formData, quoted_budget: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="required_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Required Date
          </label>
          <input
            type="date"
            id="required_date"
            value={formData.required_date}
            onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="material_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Material Type
          </label>
          <input
            type="text"
            id="material_type"
            value={formData.material_type}
            onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Link
          href="/load-requests"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Request'}
        </button>
      </div>
    </form>
  )
}
