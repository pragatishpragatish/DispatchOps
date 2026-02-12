"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateInvoicePDF } from '@/lib/invoice-generator'

interface LoadProvider {
  id: string
  company_name: string
  contact_person?: string | null
  phone?: string | null
  whatsapp?: string | null
}

export function InvoiceForm({ providers }: { providers: LoadProvider[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    provider_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    coordination_fee: '',
    description: 'Coordination Fee for Logistics Services',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedProvider = providers.find(p => p.id === formData.provider_id)
      if (!selectedProvider) {
        alert('Please select a load provider')
        setLoading(false)
        return
      }

      if (!formData.coordination_fee || parseFloat(formData.coordination_fee) <= 0) {
        alert('Please enter a valid coordination fee')
        setLoading(false)
        return
      }

      await generateInvoicePDF({
        provider: {
          id: selectedProvider.id,
          company_name: selectedProvider.company_name,
          contact_person: selectedProvider.contact_person,
          phone: selectedProvider.phone,
          whatsapp: selectedProvider.whatsapp,
        },
        invoiceDate: formData.invoice_date,
        coordinationFee: parseFloat(formData.coordination_fee),
        description: formData.description,
      })

      // Optionally redirect or show success message
      router.push('/invoices')
    } catch (error: any) {
      alert('Error generating invoice: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedProvider = providers.find(p => p.id === formData.provider_id)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Create New Invoice</h2>
          <p className="text-indigo-100 text-sm mt-1">Generate professional invoices for load providers</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Main Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="provider_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Load Provider <span className="text-red-500">*</span>
              </label>
              <select
                id="provider_id"
                required
                value={formData.provider_id}
                onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Select a load provider...</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="invoice_date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="invoice_date"
                required
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="coordination_fee" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Coordination Fee (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 font-medium">₹</span>
                <input
                  type="number"
                  step="0.01"
                  id="coordination_fee"
                  required
                  value={formData.coordination_fee}
                  onChange={(e) => setFormData({ ...formData, coordination_fee: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Service Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Invoice Preview Card */}
          {selectedProvider && formData.coordination_fee && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Invoice Preview
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Provider</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedProvider.company_name}</p>
                  {selectedProvider.contact_person && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedProvider.contact_person}</p>
                  )}
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Invoice Date</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {new Date(formData.invoice_date).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{parseFloat(formData.coordination_fee || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/invoices"
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-all text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.provider_id || !formData.coordination_fee}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate & Download Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
