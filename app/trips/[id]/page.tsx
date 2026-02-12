import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { TripDetail } from '@/components/trips/trip-detail'

async function getTrip(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      vehicles (
        id,
        registration_number,
        vehicle_type,
        owner_id
      ),
      owners (
        id,
        owner_name,
        phone_primary
      ),
      load_requests (
        id,
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
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trip = await getTrip(id)
  if (!trip) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TripDetail trip={trip} />
    </div>
  )
}
