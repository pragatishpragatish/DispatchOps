import { LoadProviderForm } from '@/components/load-providers/load-provider-form'

export default function NewLoadProviderPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Add New Load Provider</h1>
      <LoadProviderForm />
    </div>
  )
}
