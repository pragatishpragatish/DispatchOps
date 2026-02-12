import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TripsList } from '@/components/trips/trips-list'

async function getTrips() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
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
      ),
      load_requests (
        provider_id,
        pickup_location,
        drop_location,
        load_providers (
          id,
          company_name,
          contact_person,
          phone,
          whatsapp
        )
      )
    `)
    .order('created_at', { ascending: false })

  return { data: data || [], error }
}

export default async function TripsPage() {
  const { data: trips, error } = await getTrips()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Trips</h1>
      <TripsList trips={trips} />
    </div>
  )
}
