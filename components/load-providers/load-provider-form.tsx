"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface LoadProvider {
  id?: string
  company_name: string
  contact_person?: string | null
  phone: string
  whatsapp?: string | null
  industry_type?: string | null
  typical_load?: string | null
  typical_routes?: string[] | null
  vehicle_types_used?: string[] | null
  payment_cycle_days?: number
  backup_vendor_ok?: boolean
  trust_level?: 'cold' | 'warm' | 'hot'
  notes?: string | null
  last_contact_date?: string | null
}

export function LoadProviderForm({ provider }: { provider?: LoadProvider }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<LoadProvider>({
    company_name: provider?.company_name || '',
    contact_person: provider?.contact_person || '',
    phone: provider?.phone || '',
    whatsapp: provider?.whatsapp || '',
    industry_type: provider?.industry_type || '',
    typical_load: provider?.typical_load || '',
    typical_routes: provider?.typical_routes || [],
    vehicle_types_used: provider?.vehicle_types_used || [],
    payment_cycle_days: provider?.payment_cycle_days || 30,
    backup_vendor_ok: provider?.backup_vendor_ok || false,
    trust_level: provider?.trust_level || 'cold',
    notes: provider?.notes || '',
    last_contact_date: provider?.last_contact_date || null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        typical_routes: formData.typical_routes?.filter(r => r.trim()) || [],
        vehicle_types_used: formData.vehicle_types_used?.filter(v => v.trim()) || [],
      }

      if (provider?.id) {
        const { error } = await supabase
          .from('load_providers')
          .update(submitData)
          .eq('id', provider.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('load_providers')
          .insert([submitData])
        if (error) throw error
      }
      router.push('/load-providers')
      router.refresh()
    } catch (error: any) {
      alert('Error saving provider: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addItem = (type: 'routes' | 'vehicles') => {
    const key = type === 'routes' ? 'typical_routes' : 'vehicle_types_used'
    setFormData({
      ...formData,
      [key]: [...(formData[key] || []), ''],
    })
  }

  const updateItem = (type: 'routes' | 'vehicles', index: number, value: string) => {
    const key = type === 'routes' ? 'typical_routes' : 'vehicle_types_used'
    const items = [...(formData[key] || [])]
    items[index] = value
    setFormData({ ...formData, [key]: items })
  }

  const removeItem = (type: 'routes' | 'vehicles', index: number) => {
    const key = type === 'routes' ? 'typical_routes' : 'vehicle_types_used'
    const items = [...(formData[key] || [])]
    items.splice(index, 1)
    setFormData({ ...formData, [key]: items })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            id="company_name"
            required
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contact Person
          </label>
          <input
            type="text"
            id="contact_person"
            value={formData.contact_person || ''}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            id="whatsapp"
            value={formData.whatsapp || ''}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="trust_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trust Level
          </label>
          <select
            id="trust_level"
            value={formData.trust_level}
            onChange={(e) => setFormData({ ...formData, trust_level: e.target.value as 'cold' | 'warm' | 'hot' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="cold">Cold</option>
            <option value="warm">Warm</option>
            <option value="hot">Hot</option>
          </select>
        </div>

        <div>
          <label htmlFor="payment_cycle_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Cycle (days)
          </label>
          <input
            type="number"
            id="payment_cycle_days"
            value={formData.payment_cycle_days || 30}
            onChange={(e) => setFormData({ ...formData, payment_cycle_days: parseInt(e.target.value) || 30 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="industry_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Industry Type
          </label>
          <input
            type="text"
            id="industry_type"
            value={formData.industry_type || ''}
            onChange={(e) => setFormData({ ...formData, industry_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="flex items-center mt-6">
            <input
              type="checkbox"
              checked={formData.backup_vendor_ok || false}
              onChange={(e) => setFormData({ ...formData, backup_vendor_ok: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Backup Vendor OK</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="typical_load" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Typical Load
        </label>
        <input
          type="text"
          id="typical_load"
          value={formData.typical_load || ''}
          onChange={(e) => setFormData({ ...formData, typical_load: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Typical Routes</label>
        {(formData.typical_routes || []).map((route, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={route}
              onChange={(e) => updateItem('routes', index, e.target.value)}
              placeholder="Route name"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => removeItem('routes', index)}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addItem('routes')}
          className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300"
        >
          Add Route
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vehicle Types Used</label>
        {(formData.vehicle_types_used || []).map((vehicle, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={vehicle}
              onChange={(e) => updateItem('vehicles', index, e.target.value)}
              placeholder="Vehicle type"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => removeItem('vehicles', index)}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addItem('vehicles')}
          className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300"
        >
          Add Vehicle Type
        </button>
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
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Link
          href="/load-providers"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : provider?.id ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
