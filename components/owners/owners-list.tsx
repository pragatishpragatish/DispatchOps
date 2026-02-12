"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Owner {
  id: string
  owner_name: string
  driver_name: string | null
  phone_primary: string
  phone_alternate: string | null
  whatsapp_available: boolean
  base_city: string | null
  base_area: string | null
  notes: string | null
}

export function OwnersList({ owners }: { owners: Owner[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this owner?')) return

    const { error } = await supabase.from('owners').delete().eq('id', id)
    if (error) {
      alert('Error deleting owner: ' + error.message)
    } else {
      router.refresh()
    }
  }

  const filteredOwners = owners.filter(owner =>
    owner.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.phone_primary.includes(searchTerm)
  )

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank')
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {filteredOwners.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No owners found</div>
        ) : (
          filteredOwners.map((owner) => (
            <div key={owner.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{owner.owner_name}</h3>
                <div className="flex space-x-2">
                  <Link
                    href={`/owners/${owner.id}/edit`}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(owner.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {owner.driver_name && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Driver: {owner.driver_name}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  onClick={() => handleCall(owner.phone_primary)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  📞 {owner.phone_primary}
                </button>
                {owner.whatsapp_available && (
                  <button
                    onClick={() => handleWhatsApp(owner.phone_primary)}
                    className="text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    💬 WhatsApp
                  </button>
                )}
              </div>
              {owner.base_city && (
                <p className="text-sm text-gray-500 dark:text-gray-500">📍 {owner.base_city}{owner.base_area ? `, ${owner.base_area}` : ''}</p>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Owner Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOwners.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No owners found</td>
              </tr>
            ) : (
              filteredOwners.map((owner) => (
                <tr key={owner.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/owners/${owner.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                      {owner.owner_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {owner.driver_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCall(owner.phone_primary)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {owner.phone_primary}
                      </button>
                      {owner.whatsapp_available && (
                        <button
                          onClick={() => handleWhatsApp(owner.phone_primary)}
                          className="text-green-600 dark:text-green-400"
                          title="WhatsApp"
                        >
                          💬
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {owner.base_city ? `${owner.base_city}${owner.base_area ? `, ${owner.base_area}` : ''}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/owners/${owner.id}/edit`}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(owner.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
