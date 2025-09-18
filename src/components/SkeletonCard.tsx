export default function SkeletonCard() {
  return (
    <div className="bg-white border rounded-2xl shadow-lg p-0 flex flex-col animate-pulse overflow-hidden">
      <div className="w-full h-40 bg-gray-200" />
      <div className="flex-1 flex flex-col p-4 gap-2">
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/3 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
        <div className="flex gap-2 mt-2">
          <div className="h-8 w-20 bg-gray-200 rounded-full" />
          <div className="h-8 w-20 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
} 