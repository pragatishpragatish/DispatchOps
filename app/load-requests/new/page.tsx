import { LoadRequestForm } from '@/components/load-requests/load-request-form'

export default function NewLoadRequestPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create Load Request</h1>
      <LoadRequestForm />
    </div>
  )
}
