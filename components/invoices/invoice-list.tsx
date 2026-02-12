"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/date-utils'
import { generateInvoicePDF } from '@/lib/invoice-generator'

interface Invoice {
  id: string
  provider_id: string
  invoice_number: string
  invoice_date: string
  coordination_fee: number
  description?: string
  status: 'pending' | 'paid' | 'overdue'
  payment_date?: string
  payment_reference?: string
  notes?: string
  created_at: string
  load_providers?: {
    id: string
    company_name: string
    contact_person?: string
    phone?: string
    whatsapp?: string
  }
}

interface Provider {
  id: string
  company_name: string
}

export function InvoiceList({ invoices, providers }: { invoices: Invoice[]; providers: Provider[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices

    // Filter by provider
    if (selectedProvider) {
      filtered = filtered.filter(invoice => invoice.provider_id === selectedProvider)
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(invoice => invoice.status === selectedStatus)
    }

    // Sort by date
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.invoice_date).getTime()
      const dateB = new Date(b.invoice_date).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    return sorted
  }, [invoices, selectedProvider, selectedStatus, sortOrder])

  const handleStatusUpdate = async (invoiceId: string, newStatus: string, paymentDate?: string) => {
    setUpdating(invoiceId)
    const updateData: any = { status: newStatus }
    if (newStatus === 'paid' && paymentDate) {
      updateData.payment_date = paymentDate
    }
    
    const { error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)
    
    if (error) {
      alert('Error updating invoice: ' + error.message)
    } else {
      router.refresh()
    }
    setUpdating(null)
  }

  const handleDownloadInvoice = async (invoice: Invoice) => {
    if (!invoice.load_providers) {
      alert('Provider information not found for this invoice')
      return
    }

    try {
      await generateInvoicePDF({
        provider: {
          id: invoice.load_providers.id,
          company_name: invoice.load_providers.company_name,
          contact_person: invoice.load_providers.contact_person || null,
          phone: invoice.load_providers.phone || null,
          whatsapp: invoice.load_providers.whatsapp || null,
        },
        invoiceDate: invoice.invoice_date,
        coordinationFee: invoice.coordination_fee,
        description: invoice.description || 'Coordination Fee for Logistics Services',
        invoiceNumber: invoice.invoice_number, // Use existing invoice number
      })
    } catch (error: any) {
      alert('Error downloading invoice: ' + error.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const totalPending = filteredAndSortedInvoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + Number(inv.coordination_fee), 0)
  const totalPaid = filteredAndSortedInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.coordination_fee), 0)

  return (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="provider-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Provider
            </label>
            <select
              id="provider-filter"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Providers</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.company_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort by Date
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        {(selectedProvider || selectedStatus) && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredAndSortedInvoices.length} of {invoices.length} invoices
            </span>
            <button
              onClick={() => {
                setSelectedProvider('')
                setSelectedStatus('')
              }}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{filteredAndSortedInvoices.length}</p>
          {selectedProvider && invoices.length !== filteredAndSortedInvoices.length && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">of {invoices.length} total</p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Amount</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            ₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Received</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
            ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Mobile Card View */}
        <div className="block sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {filteredAndSortedInvoices.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              {selectedProvider || selectedStatus ? 'No invoices found matching the filters' : 'No invoices found'}
            </div>
          ) : (
            filteredAndSortedInvoices.map((invoice) => (
              <div key={invoice.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{invoice.invoice_number}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.load_providers?.company_name || 'Unknown'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Date: {formatDate(invoice.invoice_date)}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Amount: ₹{invoice.coordination_fee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {invoice.payment_date && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Paid: {formatDate(invoice.payment_date)}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    onClick={() => handleDownloadInvoice(invoice)}
                    className="w-full px-3 py-2 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Invoice
                  </button>
                  <select
                    value={invoice.status}
                    onChange={(e) => {
                      if (e.target.value === 'paid') {
                        const paymentDate = prompt('Enter payment date (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
                        if (paymentDate) {
                          handleStatusUpdate(invoice.id, e.target.value, paymentDate)
                        }
                      } else {
                        handleStatusUpdate(invoice.id, e.target.value)
                      }
                    }}
                    disabled={updating === invoice.id}
                    className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payment Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {selectedProvider || selectedStatus ? 'No invoices found matching the filters' : 'No invoices found'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {invoice.load_providers?.company_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(invoice.invoice_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{invoice.coordination_fee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {invoice.payment_date ? formatDate(invoice.payment_date) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                          title="Download Invoice PDF"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="hidden sm:inline">Download</span>
                        </button>
                        <select
                          value={invoice.status}
                          onChange={(e) => {
                            if (e.target.value === 'paid') {
                              const paymentDate = prompt('Enter payment date (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
                              if (paymentDate) {
                                handleStatusUpdate(invoice.id, e.target.value, paymentDate)
                              }
                            } else {
                              handleStatusUpdate(invoice.id, e.target.value)
                            }
                          }}
                          disabled={updating === invoice.id}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
