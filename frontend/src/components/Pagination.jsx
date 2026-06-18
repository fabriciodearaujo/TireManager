const Pagination = ({ current, total, pageSize, onChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm">
      <span className="text-xs text-gray-400">{total} registro(s)</span>
      <div className="flex items-center gap-1">
        <button disabled={current <= 1} onClick={() => onChange(current - 1)} className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">‹</button>
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)} className={`px-2.5 py-1 text-xs rounded border ${p === current ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-200 hover:bg-gray-50'}`}>{p}</button>
        ))}
        <button disabled={current >= totalPages} onClick={() => onChange(current + 1)} className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">›</button>
      </div>
    </div>
  );
};

export default Pagination;
