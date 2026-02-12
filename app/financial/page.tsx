import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FinancialDashboard } from '@/components/financial/financial-dashboard'

async function getAllFinancialData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get all trips (for count only, revenue comes from coordination fees)
  const { data: allTrips } = await supabase
    .from('trips')
    .select('created_at')

  // Get all paid invoices
  const { data: allInvoices } = await supabase
    .from('invoices')
    .select('coordination_fee, payment_date')
    .eq('status', 'paid')

  // Get all other income
  const { data: allOtherIncome } = await supabase
    .from('other_income')
    .select('id, amount, income_date, description, category')

  // Get all other expenses
  const { data: allOtherExpenses } = await supabase
    .from('other_expenses')
    .select('id, amount, expense_date, description, category')

  return {
    trips: allTrips || [],
    invoices: allInvoices || [],
    otherIncome: allOtherIncome || [],
    otherExpenses: allOtherExpenses || [],
  }
}

export default async function FinancialPage() {
  const data = await getAllFinancialData()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Financial Dashboard</h1>
      <FinancialDashboard data={data} />
    </div>
  )
}
