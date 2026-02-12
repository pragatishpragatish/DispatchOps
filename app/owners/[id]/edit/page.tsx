import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { OwnerForm } from '@/components/owners/owner-form'

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

export default async function EditOwnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const owner = await getOwner(id)
  if (!owner) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Edit Owner</h1>
      <OwnerForm owner={owner} />
    </div>
  )
}
