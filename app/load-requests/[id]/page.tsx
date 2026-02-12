import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatDateTime } from '@/lib/date-utils'

async function getLoadRequest(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('load_requests')
    .select(`
      *,
      load_providers (
        id,
        company_name,
        contact_person,
        phone,
        whatsapp,
        trust_level
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

async function getRelatedTrips(loadRequestId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('trips')
    .select(`
      *,
      vehicles (
        registration_number,
        vehicle_type
      ),
      owners (
        owner_name,
        phone_primary
      )
    `)
    .eq('load_request_id', loadRequestId)
    .order('created_at', { ascending: false })

  return data || []
}

export default async function LoadRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const request = await getLoadRequest(id)
  if (!request) notFound()

  const trips = await getRelatedTrips(id)

  const handleWhatsApp = (phone: string) => {
    return `https://wa.me/${phone.replace(/\D/g, '')}`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/load-requests" className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block">
          ← Back to Load Requests
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Load Request Details</h1>
          <span className={`px-3 py-1 text-sm rounded-full ${
            request.status === 'open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            request.status === 'matching' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            request.status === 'matched' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            request.status === 'closed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {request.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Provider</h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {request.load_providers?.company_name || 'Unknown'}
            </p>
            {request.load_providers?.contact_person && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Contact: {request.load_providers.contact_person}
              </p>
            )}
            {request.load_providers?.phone && (
              <div className="flex items-center space-x-2 mt-2">
                <a
                  href={`tel:${request.load_providers.phone}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  📞 {request.load_providers.phone}
                </a>
                {request.load_providers.whatsapp && (
                  <a
                    href={handleWhatsApp(request.load_providers.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400"
                  >
                    💬
                  </a>
                )}
              </div>
            )}
            {request.load_providers?.trust_level && (
              <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                request.load_providers.trust_level === 'hot' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                request.load_providers.trust_level === 'warm' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {request.load_providers.trust_level.toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Route</h3>
            <p className="text-lg text-gray-900 dark:text-white">
              {request.pickup_location} → {request.drop_location}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Vehicle Type Needed</h3>
            <p className="text-lg text-gray-900 dark:text-white capitalize">{request.vehicle_type_needed}</p>
          </div>

          {request.weight_tons && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Weight</h3>
              <p className="text-lg text-gray-900 dark:text-white">{request.weight_tons} tons</p>
            </div>
          )}

          {request.distance_km && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Distance</h3>
              <p className="text-lg text-gray-900 dark:text-white">{request.distance_km} km</p>
            </div>
          )}

          {request.quoted_budget && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Quoted Budget</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ₹{request.quoted_budget.toLocaleString()}
              </p>
            </div>
          )}

          {request.required_date && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Required Date</h3>
              <p className="text-lg text-gray-900 dark:text-white">
                {formatDate(request.required_date)}
              </p>
            </div>
          )}

          {request.material_type && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Material Type</h3>
              <p className="text-lg text-gray-900 dark:text-white">{request.material_type}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Created At</h3>
            <p className="text-lg text-gray-900 dark:text-white">
              {formatDateTime(request.created_at)}
            </p>
          </div>
        </div>

        {request.notes && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h3>
            <p className="text-gray-900 dark:text-white">{request.notes}</p>
          </div>
        )}

        {request.status === 'open' && (
          <div className="mt-6">
            <Link
              href={`/load-requests/${request.id}/match`}
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Match Vehicles
            </Link>
          </div>
        )}
      </div>

      {trips.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Related Trips ({trips.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Margin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {trips.map((trip: any) => (
                  <tr key={trip.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {trip.vehicles?.registration_number || '-'} ({trip.vehicles?.vehicle_type || '-'})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {trip.owners?.owner_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                      ₹{trip.margin_amount.toLocaleString()}
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
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/trips/${trip.id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900"
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
