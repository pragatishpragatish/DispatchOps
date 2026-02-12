"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/date-utils'

interface IncomeExpenseListProps {
  otherIncome: Array<{ id: string; amount: number; income_date: string; description?: string; category?: string }>
  otherExpenses: Array<{ id: string; amount: number; expense_date: string; description?: string; category?: string }>
}

export function IncomeExpenseList({ otherIncome, otherExpenses }: IncomeExpenseListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income')

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleDelete = async (type: 'income' | 'expenses', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    const table = type === 'income' ? 'other_income' : 'other_expenses'
    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) {
      alert('Error deleting item: ' + error.message)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('income')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'income'
                ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Other Income ({otherIncome.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'expenses'
                ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Other Expenses ({otherExpenses.length})
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'income' ? (
          <div className="space-y-4">
            {otherIncome.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No other income recorded</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {otherIncome.map((income) => (
                      <tr key={income.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(income.income_date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{income.description || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {income.category || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400 text-right">
                          {formatCurrency(income.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleDelete('income', income.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {otherExpenses.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No expenses recorded</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {otherExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(expense.expense_date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{expense.description || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {expense.category || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-red-600 dark:text-red-400 text-right">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleDelete('expenses', expense.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
