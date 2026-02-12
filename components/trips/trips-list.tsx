"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
    registration_number?: string
    vehicle_type?: string
  }
  owners?: {
    owner_name?: string
    phone_primary?: string
  }
  load_requests?: {
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

export function TripsList({ trips }: { trips: Trip[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [updating, setUpdating] = useState<string | null>(null)
  const [invoiceTrip, setInvoiceTrip] = useState<Trip | null>(null)

  const handleStatusUpdate = async (tripId: string, field: string, value: boolean) => {
    setUpdating(tripId)
    const { error } = await supabase
      .from('trips')
      .update({ [field]: value })
      .eq('id', tripId)
    
    if (error) {
      alert('Error updating trip: ' + error.message)
    } else {
      router.refresh()
    }
    setUpdating(null)
  }

  const handleTimeUpdate = async (tripId: string, field: string, value: string) => {
    setUpdating(tripId)
    const { error } = await supabase
      .from('trips')
      .update({ [field]: value || null })
      .eq('id', tripId)
    
    if (error) {
      alert('Error updating trip: ' + error.message)
    } else {
      router.refresh()
    }
    setUpdating(null)
  }

  return (
    <div>
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {trips.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No trips found</div>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {trip.load_requests?.load_providers?.company_name || 'Unknown'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {trip.load_requests?.pickup_location} → {trip.load_requests?.drop_location}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Vehicle: {trip.vehicles?.registration_number || 'N/A'} • Owner: {trip.owners?.owner_name || 'N/A'}
                </p>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Client Rate:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₹{trip.client_rate.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={trip.pod_received}
                      onChange={(e) => handleStatusUpdate(trip.id, 'pod_received', e.target.checked)}
                      disabled={updating === trip.id}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="ml-2">POD</span>
                  </label>
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={trip.payment_received}
                      onChange={(e) => handleStatusUpdate(trip.id, 'payment_received', e.target.checked)}
                      disabled={updating === trip.id}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="ml-2">Payment</span>
                  </label>
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={trip.owner_paid}
                      onChange={(e) => handleStatusUpdate(trip.id, 'owner_paid', e.target.checked)}
                      disabled={updating === trip.id}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="ml-2">Owner Paid</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setInvoiceTrip(trip)}
                  className="text-sm text-green-600 dark:text-green-400 hover:underline"
                >
                  Generate Invoice
                </button>
                <Link
                  href={`/trips/${trip.id}`}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {trips.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No trips found</td>
              </tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {trip.load_requests?.load_providers?.company_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {trip.load_requests?.pickup_location} → {trip.load_requests?.drop_location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {trip.vehicles?.registration_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {trip.owners?.owner_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{trip.client_rate.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {trip.pod_received && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          POD
                        </span>
                      )}
                      {trip.payment_received && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Paid
                        </span>
                      )}
                      {trip.owner_paid && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Owner Paid
                        </span>
                      )}
                      {trip.issue_flag && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Issue
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setInvoiceTrip(trip)}
                        className="text-green-600 dark:text-green-400 hover:text-green-900"
                      >
                        Invoice
                      </button>
                      <Link
                        href={`/trips/${trip.id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      {invoiceTrip && (
        <TripInvoiceModal
          isOpen={!!invoiceTrip}
          onClose={() => setInvoiceTrip(null)}
          trip={invoiceTrip}
        />
      )}
    </div>
  )
}
