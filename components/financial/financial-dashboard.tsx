"use client"

import { useState, useMemo } from 'react'
import { formatDate } from '@/lib/date-utils'
import { OtherIncomeModal } from './other-income-modal'
import { OtherExpenseModal } from './other-expense-modal'
import { IncomeExpenseList } from './income-expense-list'

interface FinancialData {
  trips: Array<{ created_at: string }>
  invoices: Array<{ coordination_fee: number; payment_date: string | null }>
  otherIncome: Array<{ id: string; amount: number; income_date: string; description?: string; category?: string }>
  otherExpenses: Array<{ id: string; amount: number; expense_date: string; description?: string; category?: string }>
}

export function FinancialDashboard({ data }: { data: FinancialData }) {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(1)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Get financial year (April to March in India)
  const getFinancialYear = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    if (currentMonth >= 4) {
      // April to December - current financial year
      return {
        start: new Date(currentYear, 3, 1), // April 1
        end: new Date(currentYear + 1, 2, 31), // March 31
        label: `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
      }
    } else {
      // January to March - previous financial year
      return {
        start: new Date(currentYear - 1, 3, 1), // April 1
        end: new Date(currentYear, 2, 31), // March 31
        label: `${currentYear - 1}-${currentYear.toString().slice(-2)}`
      }
    }
  }

  const financialYear = getFinancialYear()

  // Filter data by date range
  const filteredData = useMemo(() => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Include full end date

    // Filter trips (by created_at)
    const filteredTrips = data.trips.filter(trip => {
      const tripDate = new Date(trip.created_at)
      return tripDate >= start && tripDate <= end
    })

    // Filter invoices (by payment_date)
    const filteredInvoices = data.invoices.filter(invoice => {
      if (!invoice.payment_date) return false
      const paymentDate = new Date(invoice.payment_date)
      return paymentDate >= start && paymentDate <= end
    })

    // Filter other income
    const filteredOtherIncome = data.otherIncome.filter(income => {
      const incomeDate = new Date(income.income_date)
      return incomeDate >= start && incomeDate <= end
    })

    // Filter other expenses
    const filteredOtherExpenses = data.otherExpenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date)
      return expenseDate >= start && expenseDate <= end
    })

    return {
      trips: filteredTrips,
      invoices: filteredInvoices,
      otherIncome: filteredOtherIncome,
      otherExpenses: filteredOtherExpenses,
    }
  }, [data, startDate, endDate])

  // Calculate financial year totals
  const fyData = useMemo(() => {
    const fyStart = financialYear.start
    const fyEnd = financialYear.end

    const fyTrips = data.trips.filter(trip => {
      const tripDate = new Date(trip.created_at)
      return tripDate >= fyStart && tripDate <= fyEnd
    })

    const fyInvoices = data.invoices.filter(invoice => {
      if (!invoice.payment_date) return false
      const paymentDate = new Date(invoice.payment_date)
      return paymentDate >= fyStart && paymentDate <= fyEnd
    })

    const fyOtherIncome = data.otherIncome.filter(income => {
      const incomeDate = new Date(income.income_date)
      return incomeDate >= fyStart && incomeDate <= fyEnd
    })

    const fyOtherExpenses = data.otherExpenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date)
      return expenseDate >= fyStart && expenseDate <= fyEnd
    })

    return {
      trips: fyTrips,
      invoices: fyInvoices,
      otherIncome: fyOtherIncome,
      otherExpenses: fyOtherExpenses,
    }
  }, [data, financialYear])

  // Calculate totals for selected period
  const invoiceRevenue = filteredData.invoices.reduce((sum, inv) => sum + (Number(inv.coordination_fee) || 0), 0)
  const otherIncomeTotal = filteredData.otherIncome.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0)
  const totalIncome = invoiceRevenue + otherIncomeTotal
  const totalExpenses = filteredData.otherExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)
  const netProfit = totalIncome - totalExpenses

  // Calculate financial year totals
  const fyInvoiceRevenue = fyData.invoices.reduce((sum, inv) => sum + (Number(inv.coordination_fee) || 0), 0)
  const fyOtherIncomeTotal = fyData.otherIncome.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0)
  const fyTotalIncome = fyInvoiceRevenue + fyOtherIncomeTotal
  const fyTotalExpenses = fyData.otherExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)
  const fyNetProfit = fyTotalIncome - fyTotalExpenses

  const resetToCurrentMonth = () => {
    const date = new Date()
    date.setDate(1)
    setStartDate(date.toISOString().split('T')[0])
    setEndDate(new Date().toISOString().split('T')[0])
  }

  const resetToFinancialYear = () => {
    setStartDate(financialYear.start.toISOString().split('T')[0])
    setEndDate(financialYear.end.toISOString().split('T')[0])
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetToCurrentMonth}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              This Month
            </button>
            <button
              onClick={resetToFinancialYear}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              FY {financialYear.label}
            </button>
          </div>
        </div>
      </div>

      {/* Financial Year Summary Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Financial Year {financialYear.label}</h2>
            <p className="text-indigo-100 text-sm">April 1, {financialYear.start.getFullYear()} - March 31, {financialYear.end.getFullYear()}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <p className="text-indigo-100 text-sm mb-1">Total Income</p>
            <p className="text-3xl font-bold">{formatCurrency(fyTotalIncome)}</p>
            <p className="text-indigo-100 text-xs mt-1">Coordination Fees + Other Income</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">Total Expenses</p>
            <p className="text-3xl font-bold">{formatCurrency(fyTotalExpenses)}</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">Net Profit</p>
            <p className={`text-3xl font-bold ${fyNetProfit >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {formatCurrency(fyNetProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Period Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Income</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(startDate)} - {formatDate(endDate)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Net Profit/Loss</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>

      {/* Income Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Income Breakdown</h2>
          <button
            onClick={() => setShowIncomeModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
          >
            + Add Other Income
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-700 dark:text-gray-300">Coordination Fees (Invoices)</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(invoiceRevenue)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-700 dark:text-gray-300">Other Income</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(otherIncomeTotal)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300 dark:border-gray-600">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Total Income</span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</span>
          </div>
        </div>
      </div>

      {/* Expenses Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Expenses Breakdown</h2>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            + Add Expense
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-700 dark:text-gray-300">Other Expenses</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300 dark:border-gray-600">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Total Expenses</span>
            <span className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Detailed Lists */}
      <IncomeExpenseList
        otherIncome={filteredData.otherIncome}
        otherExpenses={filteredData.otherExpenses}
      />

      {/* Modals */}
      {showIncomeModal && (
        <OtherIncomeModal
          isOpen={showIncomeModal}
          onClose={() => setShowIncomeModal(false)}
        />
      )}
      {showExpenseModal && (
        <OtherExpenseModal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
        />
      )}
    </div>
  )
}
