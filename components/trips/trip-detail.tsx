"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { TripInvoiceModal } from './trip-invoice-modal'

interface Trip {
  id: string
  load_request_id: string
  vehicle_id: string
  owner_id: string
  client_rate: number
  owner_rate: number
  margin_amount: number
  pickup_time?: string
  delivery_time?: string
  pod_received: boolean
  payment_received: boolean
  owner_paid: boolean
  issue_flag: boolean
  notes?: string
  vehicles?: {
    id: string
    registration_number?: string
    vehicle_type?: string
    owner_id?: string
  }
  owners?: {
    id: string
    owner_name?: string
    phone_primary?: string
  }
  load_requests?: {
    id: string
    provider_id?: string
    pickup_location?: string
    drop_location?: string
    load_providers?: {
      id: string
      company_name?: string
      contact_person?: string
      phone?: string
      whatsapp?: string
    }
  }
}

export function TripDetail({ trip }: { trip: Trip }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showReliabilityForm, setShowReliabilityForm] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [reliabilityData, setReliabilityData] = useState({
    ontime_pickup_score: 3,
    ontime_delivery_score: 3,
    communication_score: 3,
    behavior_score: 3,
    vehicle_condition_score: 3,
  })

  const handleStatusUpdate = async (field: string, value: boolean | string | null) => {
    setLoading(true)
    const { error } = await supabase
      .from('trips')
      .update({ [field]: value })
      .eq('id', trip.id)
    
    if (error) {
      alert('Error updating trip: ' + error.message)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  const handleSubmitReliability = async () => {
    if (!trip.vehicles?.id) return

    setLoading(true)
    try {
      // Check if reliability score exists
      const { data: existing } = await supabase
        .from('reliability_scores')
        .select('id, trips_completed')
        .eq('vehicle_id', trip.vehicles.id)
        .single()

      const updateData = {
        ...reliabilityData,
        trips_completed: (existing?.trips_completed || 0) + 1,
        last_trip_date: new Date().toISOString().split('T')[0],
      }

      if (existing) {
        await supabase
          .from('reliability_scores')
          .update(updateData)
          .eq('id', existing.id)
      } else {
        await supabase
          .from('reliability_scores')
          .insert([{ vehicle_id: trip.vehicles.id, ...updateData }])
      }

      setShowReliabilityForm(false)
      router.refresh()
    } catch (error: any) {
      alert('Error saving reliability score: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href="/trips" className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block">
          ← Back to Trips
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trip Details</h1>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
          >
            Generate Invoice
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Client</h3>
            <p className="text-lg text-gray-900 dark:text-white">
              {trip.load_requests?.load_providers?.company_name || '-'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Route</h3>
            <p className="text-lg text-gray-900 dark:text-white">
              {trip.load_requests?.pickup_location} → {trip.load_requests?.drop_location}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Vehicle</h3>
            <p className="text-lg text-gray-900 dark:text-white">
              {trip.vehicles?.registration_number || '-'} ({trip.vehicles?.vehicle_type || '-'})
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Owner</h3>
            <p className="text-lg text-gray-900 dark:text-white">
              {trip.owners?.owner_name || '-'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Client Rate</h3>
            <p className="text-lg text-gray-900 dark:text-white">₹{trip.client_rate.toLocaleString()}</p>
          </div>
          {trip.owner_rate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Owner Rate</h3>
              <p className="text-lg text-gray-900 dark:text-white">₹{trip.owner_rate.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Checklist</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={trip.pod_received}
                onChange={(e) => handleStatusUpdate('pod_received', e.target.checked)}
                disabled={loading}
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-3 text-gray-900 dark:text-white">POD Received</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={trip.payment_received}
                onChange={(e) => handleStatusUpdate('payment_received', e.target.checked)}
                disabled={loading}
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-3 text-gray-900 dark:text-white">Payment Received</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={trip.owner_paid}
                onChange={(e) => handleStatusUpdate('owner_paid', e.target.checked)}
                disabled={loading}
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-3 text-gray-900 dark:text-white">Owner Paid</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={trip.issue_flag}
                onChange={(e) => handleStatusUpdate('issue_flag', e.target.checked)}
                disabled={loading}
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-3 text-gray-900 dark:text-white">Issue Flag</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timestamps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pickup Time
              </label>
              <input
                type="datetime-local"
                value={trip.pickup_time ? new Date(trip.pickup_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleStatusUpdate('pickup_time', e.target.value ? new Date(e.target.value).toISOString() : null)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delivery Time
              </label>
              <input
                type="datetime-local"
                value={trip.delivery_time ? new Date(trip.delivery_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleStatusUpdate('delivery_time', e.target.value ? new Date(e.target.value).toISOString() : null)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {trip.pod_received && trip.payment_received && !showReliabilityForm && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <button
              onClick={() => setShowReliabilityForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Enter Reliability Score
            </button>
          </div>
        )}

        {showReliabilityForm && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reliability Score</h2>
            <div className="space-y-4">
              {[
                { key: 'ontime_pickup_score', label: 'On-time Pickup' },
                { key: 'ontime_delivery_score', label: 'On-time Delivery' },
                { key: 'communication_score', label: 'Communication' },
                { key: 'behavior_score', label: 'Behavior' },
                { key: 'vehicle_condition_score', label: 'Vehicle Condition' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label} (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={reliabilityData[key as keyof typeof reliabilityData]}
                    onChange={(e) => setReliabilityData({ ...reliabilityData, [key]: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>1</span>
                    <span className="font-semibold">{reliabilityData[key as keyof typeof reliabilityData]}</span>
                    <span>5</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowReliabilityForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReliability}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Score'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      <TripInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        trip={trip}
      />
    </div>
  )
}
