import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoadRequestsBoard } from '@/components/load-requests/load-requests-board'
import Link from 'next/link'

async function getLoadRequests() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('load_requests')
    .select(`
      *,
      load_providers (
        company_name,
        contact_person,
        phone
      )
    `)
    .order('created_at', { ascending: false })

  return { data: data || [], error }
}

export default async function LoadRequestsPage() {
  const { data: requests, error } = await getLoadRequests()

  const requestsByStatus = {
    open: requests.filter((r: any) => r.status === 'open'),
    matching: requests.filter((r: any) => r.status === 'matching'),
    matched: requests.filter((r: any) => r.status === 'matched'),
    closed: requests.filter((r: any) => r.status === 'closed'),
    failed: requests.filter((r: any) => r.status === 'failed'),
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Load Requests</h1>
        <Link
          href="/load-requests/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create Load Request
        </Link>
      </div>

      <LoadRequestsBoard requestsByStatus={requestsByStatus} />
    </div>
  )
}
