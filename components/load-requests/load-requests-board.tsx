"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/date-utils'

interface LoadRequest {
  id: string
  provider_id: string
  pickup_location: string
  drop_location: string
  material_type?: string
  weight_tons?: number
  distance_km?: number
  vehicle_type_needed: string
  quoted_budget?: number
  status: 'open' | 'matching' | 'matched' | 'closed' | 'failed'
  required_date?: string
  notes?: string
  created_at: string
  load_providers?: {
    company_name: string
    contact_person?: string
    phone: string
  }
}

interface RequestsByStatus {
  open: LoadRequest[]
  matching: LoadRequest[]
  matched: LoadRequest[]
  closed: LoadRequest[]
  failed: LoadRequest[]
}

export function LoadRequestsBoard({ requestsByStatus }: { requestsByStatus: RequestsByStatus }) {
  const router = useRouter()
  const supabase = createClient()
  const [matchingRequestId, setMatchingRequestId] = useState<string | null>(null)

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    const { error } = await supabase
      .from('load_requests')
      .update({ status: newStatus })
      .eq('id', requestId)
    
    if (error) {
      alert('Error updating status: ' + error.message)
    } else {
      router.refresh()
    }
  }

  const handleMatch = async (requestId: string) => {
    setMatchingRequestId(requestId)
    router.push(`/load-requests/${requestId}/match`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'matching':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'matched':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    { id: 'open', title: 'Open', requests: requestsByStatus.open },
    { id: 'matching', title: 'Matching', requests: requestsByStatus.matching },
    { id: 'matched', title: 'Matched', requests: requestsByStatus.matched },
    { id: 'failed', title: 'Failed', requests: requestsByStatus.failed },
  ]

  return (
    <div className="space-y-6">
      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-64">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-t-lg p-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {column.title} ({column.requests.length})
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-b-lg p-3 space-y-3 min-h-[400px]">
                {column.requests.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                    No requests
                  </div>
                ) : (
                  column.requests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          {request.quoted_budget && (
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              ₹{request.quoted_budget.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                          {request.load_providers?.company_name || 'Unknown Provider'}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {request.pickup_location} → {request.drop_location}
                        </p>
                        {request.weight_tons && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {request.weight_tons} tons • {request.vehicle_type_needed}
                            {request.distance_km && ` • ${request.distance_km} km`}
                          </p>
                        )}
                        {request.required_date && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Required: {formatDate(request.required_date)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {request.status === 'open' && (
                          <button
                            onClick={() => handleMatch(request.id)}
                            className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                          >
                            Match
                          </button>
                        )}
                        {request.status === 'matching' && (
                          <button
                            onClick={() => handleMatch(request.id)}
                            className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                          >
                            View Matches
                          </button>
                        )}
                        <Link
                          href={`/load-requests/${request.id}`}
                          className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          View
                        </Link>
                        {request.status !== 'closed' && request.status !== 'failed' && (
                          <select
                            value={request.status}
                            onChange={(e) => handleStatusChange(request.id, e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="open">Open</option>
                            <option value="matching">Matching</option>
                            <option value="matched">Matched</option>
                            <option value="closed">Closed</option>
                            <option value="failed">Failed</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Loads Table */}
      {requestsByStatus.closed.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Completed Loads ({requestsByStatus.closed.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Required Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {requestsByStatus.closed.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {request.load_providers?.company_name || 'Unknown Provider'}
                      </div>
                      {request.load_providers?.contact_person && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {request.load_providers.contact_person}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {request.pickup_location}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        → {request.drop_location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {request.weight_tons && `${request.weight_tons} tons`}
                        {request.weight_tons && request.vehicle_type_needed && ' • '}
                        {request.vehicle_type_needed}
                      </div>
                      {request.distance_km && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {request.distance_km} km
                        </div>
                      )}
                      {request.material_type && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {request.material_type}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.quoted_budget ? (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ₹{request.quoted_budget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {request.required_date ? formatDate(request.required_date) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/load-requests/${request.id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
