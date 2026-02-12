"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/date-utils'

interface LoadProvider {
  id: string
  company_name: string
  contact_person: string | null
  phone: string
  whatsapp: string | null
  industry_type: string | null
  typical_load: string | null
  payment_cycle_days: number
  trust_level: 'cold' | 'warm' | 'hot'
  last_contact_date: string | null
  notes: string | null
}

export function LoadProvidersList({ providers }: { providers: LoadProvider[] }) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return
    const { error } = await supabase.from('load_providers').delete().eq('id', id)
    if (error) {
      alert('Error deleting provider: ' + error.message)
    } else {
      router.refresh()
    }
  }

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'hot':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'warm':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cold':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank')
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div>
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {providers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No providers found</div>
        ) : (
          providers.map((provider) => (
            <div key={provider.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{provider.company_name}</h3>
                  {provider.contact_person && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{provider.contact_person}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/load-providers/${provider.id}/edit`}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(provider.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getTrustLevelColor(provider.trust_level)}`}>
                  {provider.trust_level.toUpperCase()}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  {provider.payment_cycle_days} days payment
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  onClick={() => handleCall(provider.phone)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  📞 {provider.phone}
                </button>
                {provider.whatsapp && (
                  <button
                    onClick={() => handleWhatsApp(provider.whatsapp!)}
                    className="text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    💬 WhatsApp
                  </button>
                )}
              </div>
              {provider.last_contact_date && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Last contact: {formatDate(provider.last_contact_date)}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trust Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payment Cycle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Last Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {providers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No providers found</td>
              </tr>
            ) : (
              providers.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/load-providers/${provider.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600">
                      {provider.company_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {provider.contact_person || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCall(provider.phone)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {provider.phone}
                      </button>
                      {provider.whatsapp && (
                        <button
                          onClick={() => handleWhatsApp(provider.whatsapp!)}
                          className="text-green-600 dark:text-green-400"
                          title="WhatsApp"
                        >
                          💬
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTrustLevelColor(provider.trust_level)}`}>
                      {provider.trust_level.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {provider.payment_cycle_days} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(provider.last_contact_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/load-providers/${provider.id}/edit`}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(provider.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
