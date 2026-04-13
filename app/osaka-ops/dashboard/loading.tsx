// app/osaka-ops/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-2xl" />
    </div>
  )
}