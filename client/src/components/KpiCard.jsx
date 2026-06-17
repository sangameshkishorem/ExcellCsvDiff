export default function KpiCard({ label, value, color }) {
  const colorMap = {
    default: 'border-gray-200 text-primary',
    success: 'border-success/30 text-success',
    warning: 'border-warning/30 text-warning',
    danger:  'border-danger/30 text-danger',
  };
  const cls = colorMap[color] ?? colorMap.default;

  return (
    <div className={`bg-white rounded-xl border-2 p-5 flex flex-col gap-1 shadow-sm ${cls}`}>
      <div className="text-3xl font-bold">{value?.toLocaleString() ?? '—'}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
