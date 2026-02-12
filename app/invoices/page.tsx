import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InvoiceList } from '@/components/invoices/invoice-list'
import Link from 'next/link'

async function getInvoices() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      load_providers (
        id,
        company_name,
        contact_person,
        phone,
        whatsapp
      )
    `)
    .order('invoice_date', { ascending: false })

  return { data: data || [], error }
}

async function getProviders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('load_providers')
    .select('id, company_name')
    .order('company_name')

  return { data: data || [], error }
}

export default async function InvoicesPage() {
  const [invoicesResult, providersResult] = await Promise.all([
    getInvoices(),
    getProviders(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Invoices</h1>
        <Link
          href="/invoices/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create Invoice
        </Link>
      </div>

      <InvoiceList invoices={invoicesResult.data} providers={providersResult.data} />
    </div>
  )
}
