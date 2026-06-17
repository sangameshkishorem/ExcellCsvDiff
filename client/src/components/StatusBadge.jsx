const CONFIG = {
  'Full Match':         { bg: 'bg-success/10', text: 'text-success',  icon: '✅' },
  'Mismatch':           { bg: 'bg-warning/10', text: 'text-warning',  icon: '⚠️' },
  'Missing in Target':  { bg: 'bg-danger/10',  text: 'text-danger',   icon: '❌' },
  'Missing in Source':  { bg: 'bg-danger/10',  text: 'text-danger',   icon: '❌' },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', icon: '?' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span>{cfg.icon}</span>
      {status}
    </span>
  );
}
