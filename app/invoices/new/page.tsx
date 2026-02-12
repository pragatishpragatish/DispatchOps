import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InvoiceForm } from '@/components/invoices/invoice-form'

async function getLoadProviders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('load_providers')
    .select('*')
    .order('company_name')

  return { data: data || [], error }
}

export default async function NewInvoicePage() {
  const { data: providers, error } = await getLoadProviders()

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <InvoiceForm providers={providers} />
    </div>
  )
}
