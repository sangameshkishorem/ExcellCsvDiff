export default function LoadingSpinner({ message = 'Processing…' }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <div className="text-gray-700 font-medium">{message}</div>
      </div>
    </div>
  );
}
