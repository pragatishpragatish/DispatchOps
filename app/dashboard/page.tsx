import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/date-utils'

async function getDashboardStats() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [vehiclesResult, ownersResult, loadRequestsResult, tripsResult, reliabilityResult, invoicesResult] = await Promise.all([
    supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('owners').select('id', { count: 'exact', head: true }),
    supabase.from('load_requests').select('id', { count: 'exact', head: true }).in('status', ['open', 'matching']),
    supabase.from('trips').select('id', { count: 'exact', head: true }),
    supabase.from('reliability_scores')
      .select(`
        *,
        vehicles (
          registration_number,
          vehicle_type,
          owners (
            owner_name
          )
        )
      `)
      .order('trips_completed', { ascending: false })
      .limit(5),
    supabase.from('invoices').select('coordination_fee, status').eq('status', 'paid')
  ])

  // Calculate total invoice revenue from paid invoices
  const invoiceRevenue = invoicesResult.data?.reduce((sum, inv) => sum + (Number(inv.coordination_fee) || 0), 0) || 0

  return {
    totalVehicles: vehiclesResult.count || 0,
    activeOwners: ownersResult.count || 0,
    openLoads: loadRequestsResult.count || 0,
    matchedTrips: tripsResult.count || 0,
    invoiceRevenue,
    reliabilityLeaderboard: reliabilityResult.data || []
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Vehicles" value={stats.totalVehicles} icon="🚛" />
        <StatCard title="Active Owners" value={stats.activeOwners} icon="👥" />
        <StatCard title="Open Loads" value={stats.openLoads} icon="📦" />
        <StatCard title="Matched Trips" value={stats.matchedTrips} icon="✅" />
        <StatCard title="Invoice Revenue" value={`₹${stats.invoiceRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon="📄" />
      </div>

      {/* Reliability Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reliability Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trips Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Trip</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {stats.reliabilityLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No reliability data available
                  </td>
                </tr>
              ) : (
                stats.reliabilityLeaderboard.map((score: any) => {
                  const avgScore = (
                    (score.ontime_pickup_score || 0) +
                    (score.ontime_delivery_score || 0) +
                    (score.communication_score || 0) +
                    (score.behavior_score || 0) +
                    (score.vehicle_condition_score || 0)
                  ) / 5
                  const vehicle = score.vehicles
                  const ownerName = vehicle?.owners?.owner_name || 'Unknown'
                  const registrationNumber = vehicle?.registration_number || 'N/A'
                  const vehicleDisplay = registrationNumber !== 'N/A' 
                    ? `${registrationNumber} (${vehicle?.vehicle_type || ''})`
                    : `Vehicle ${score.vehicle_id?.slice(0, 8)}...`
                  return (
                    <tr key={score.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <div className="font-medium">{vehicleDisplay}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Owner: {ownerName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {score.trips_completed || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < Math.round(avgScore) ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                          <span className="ml-2">{avgScore.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(score.last_trip_date)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 w-full">
      <div className="flex items-center">
        <div className="text-3xl mr-4 flex-shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white truncate">{value}</p>
        </div>
      </div>
    </div>
  )
}
