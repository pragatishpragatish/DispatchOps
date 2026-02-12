import { VehicleForm } from '@/components/vehicles/vehicle-form'

export default function NewVehiclePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Add New Vehicle</h1>
      <VehicleForm />
    </div>
  )
}
