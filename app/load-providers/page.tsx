import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoadProvidersList } from '@/components/load-providers/load-providers-list'
import Link from 'next/link'

async function getLoadProviders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('load_providers')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: data || [], error }
}

export default async function LoadProvidersPage() {
  const { data: providers, error } = await getLoadProviders()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Load Providers</h1>
        <Link
          href="/load-providers/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Provider
        </Link>
      </div>

      <LoadProvidersList providers={providers} />
    </div>
  )
}
