import { OwnerForm } from '@/components/owners/owner-form'

export default function NewOwnerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Add New Owner</h1>
      <OwnerForm />
    </div>
  )
}
