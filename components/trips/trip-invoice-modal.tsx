"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateInvoicePDF } from '@/lib/invoice-generator'

interface LoadProvider {
  id: string
  company_name: string
  contact_person?: string | null
  phone?: string | null
  whatsapp?: string | null
}

interface TripInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  trip: {
    id: string
    client_rate: number
    created_at?: string
    load_requests?: {
      provider_id?: string
      load_providers?: {
        id: string
        company_name?: string
        contact_person?: string | null
        phone?: string | null
        whatsapp?: string | null
      }
    }
  }
}

export function TripInvoiceModal({ isOpen, onClose, trip }: TripInvoiceModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  
  // Calculate 10% of trip cost
  const defaultFee = (trip.client_rate * 0.1).toFixed(2)
  
  // Format trip date for description
  const tripDate = trip.created_at 
    ? new Date(trip.created_at).toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
  
  const [formData, setFormData] = useState({
    invoice_date: new Date().toISOString().split('T')[0],
    coordination_fee: defaultFee,
    description: `Coordination Fee for Trip - ${trip.id.slice(0, 8)} (${tripDate})`,
  })

  const provider = trip.load_requests?.load_providers

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!provider || !provider.company_name) {
      alert('Provider information not found for this trip')
      return
    }

    if (!formData.coordination_fee || parseFloat(formData.coordination_fee) <= 0) {
      alert('Please enter a valid coordination fee')
      return
    }

    setLoading(true)

    try {
      await generateInvoicePDF({
        provider: {
          id: provider.id,
          company_name: provider.company_name,
          contact_person: provider.contact_person || null,
          phone: provider.phone || null,
          whatsapp: provider.whatsapp || null,
        },
        invoiceDate: formData.invoice_date,
        coordinationFee: parseFloat(formData.coordination_fee),
        description: formData.description,
      })

      router.refresh()
      onClose()
    } catch (error: any) {
      alert('Error generating invoice: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generate Invoice</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!provider || !provider.company_name ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">Provider information not found for this trip</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  <strong>Provider:</strong> {provider.company_name}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  <strong>Trip Cost:</strong> ₹{trip.client_rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Suggested Fee (10%):</strong> ₹{defaultFee}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="invoice_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Invoice Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="invoice_date"
                    required
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="coordination_fee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Pre-filled with 10% of trip cost. You can edit this amount.
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Service description..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate & Download Invoice'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
