import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OwnersList } from '@/components/owners/owners-list'
import Link from 'next/link'

async function getOwners(search?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase.from('owners').select('*').order('created_at', { ascending: false })

  if (search) {
    query = query.or(`owner_name.ilike.%${search}%,driver_name.ilike.%${search}%,phone_primary.ilike.%${search}%`)
  }

  const { data, error } = await query
  return { data: data || [], error }
}

export default async function OwnersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const { data: owners, error } = await getOwners(searchParams.search)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Owners</h1>
        <Link
          href="/owners/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Owner
        </Link>
      </div>

      <OwnersList owners={owners} />
    </div>
  )
}
