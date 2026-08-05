import React from 'react';

export const Table = ({ headers = [], children, emptyMessage = 'No records found.' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 glass-card">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {headers.map((h, i) => (
              <th key={i} className="py-3.5 px-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-sm text-slate-200">
          {React.Children.count(children) > 0 ? (
            children
          ) : (
            <tr>
              <td colSpan={headers.length} className="py-8 text-center text-slate-500 text-sm">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
