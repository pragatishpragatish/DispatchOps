import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { findMatchingVehicles } from '@/lib/matching'
import { MatchVehicles } from '@/components/load-requests/match-vehicles'

async function getLoadRequest(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('load_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export default async function MatchVehiclesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const request = await getLoadRequest(id)
  if (!request) notFound()

  const matches = await findMatchingVehicles({
    vehicle_type_needed: request.vehicle_type_needed,
    route: `${request.pickup_location} - ${request.drop_location}`,
    weight: request.weight_tons || undefined,
    pickup_location: request.pickup_location,
    drop_location: request.drop_location,
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Match Vehicles</h1>
      <MatchVehicles request={request} matches={matches} />
    </div>
  )
}
