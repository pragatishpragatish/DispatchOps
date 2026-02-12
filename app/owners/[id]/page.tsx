import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

async function getOwner(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

async function getOwnerVehicles(ownerId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  return data || []
}

export default async function OwnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const owner = await getOwner(id)
  if (!owner) notFound()

  const vehicles = await getOwnerVehicles(id)

  const handleWhatsApp = (phone: string) => {
    return `https://wa.me/${phone.replace(/\D/g, '')}`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/owners" className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block">
          ← Back to Owners
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{owner.owner_name}</h1>
          <Link
            href={`/owners/${owner.id}/edit`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Edit
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Driver Name</h3>
            <p className="text-lg text-gray-900 dark:text-white">{owner.driver_name || '-'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Phone</h3>
            <div className="flex items-center space-x-2">
              <a href={`tel:${owner.phone_primary}`} className="text-lg text-blue-600 dark:text-blue-400 hover:underline">
                {owner.phone_primary}
              </a>
              {owner.whatsapp_available && (
                <a
                  href={handleWhatsApp(owner.phone_primary)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 dark:text-green-400"
                >
                  💬
                </a>
              )}
            </div>
          </div>
          {owner.phone_alternate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Alternate Phone</h3>
              <a href={`tel:${owner.phone_alternate}`} className="text-lg text-blue-600 dark:text-blue-400 hover:underline">
                {owner.phone_alternate}
              </a>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Base Location</h3>
            <p className="text-lg text-gray-900 dark:text-white">
              {owner.base_city || '-'}{owner.base_area ? `, ${owner.base_area}` : ''}
            </p>
          </div>
          {owner.notes && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h3>
              <p className="text-lg text-gray-900 dark:text-white">{owner.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Vehicles ({vehicles.length})</h2>
        {vehicles.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No vehicles registered for this owner</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Registration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {vehicles.map((vehicle: any) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{vehicle.vehicle_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{vehicle.vehicle_model || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{vehicle.registration_number || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${vehicle.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {vehicle.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
