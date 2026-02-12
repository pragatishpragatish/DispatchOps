import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VehiclesList } from '@/components/vehicles/vehicles-list'
import Link from 'next/link'

async function getVehicles(filters: {
  type?: string
  city?: string
  minRate?: string
  active?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('vehicles')
    .select(`
      *,
      owners (
        id,
        owner_name,
        phone_primary
      ),
      reliability_scores (
        *
      )
    `)
    .order('created_at', { ascending: false })

  if (filters.type) {
    query = query.eq('vehicle_type', filters.type)
  }
  if (filters.city) {
    query = query.eq('city_only', filters.city === 'city')
  }
  if (filters.minRate) {
    query = query.gte('min_rate_per_km', parseFloat(filters.minRate))
  }
  if (filters.active !== undefined) {
    query = query.eq('active', filters.active === 'true')
  }

  const { data, error } = await query
  return { data: data || [], error }
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: { type?: string; city?: string; minRate?: string; active?: string }
}) {
  const { data: vehicles, error } = await getVehicles(searchParams)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Vehicles</h1>
        <Link
          href="/vehicles/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Vehicle
        </Link>
      </div>

      <VehiclesList vehicles={vehicles} />
    </div>
  )
}
