import { useState } from 'react';
import { CELL_TYPES } from '@/config/cellTypes'; 

export default function DSrnaSearch() {
  const [symbol, setSymbol] = useState('');
  const [cellType, setCellType] = useState(CELL_TYPES[0].value); // 默认选第一个
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    // 注意：我们将 cellType (文件名) 发送给后端
    const res = await fetch(`/api/query-de?symbol=${symbol.trim()}&cellType=${cellType}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white border rounded-xl shadow-sm">
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        {/* 1. 基因输入框 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Gene Symbol</label>
          <input 
            className="border p-2 rounded w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. WASF2 (Leave empty for all DEG)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
        </div>

        {/* 2. 细胞类型下拉框 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Cell Type</label>
          <select 
            className="border p-2 rounded w-64 bg-white"
            value={cellType}
            onChange={(e) => setCellType(e.target.value)}
          >
            {CELL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleSearch}
          className="bg-zinc-800 text-white px-8 py-2.5 rounded-lg hover:bg-black transition-colors"
        >
          {loading ? 'Processing...' : 'Search'}
        </button>
      </div>

      {/* 结果表格 */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left font-semibold">dsRNA ID</th>
              <th className="p-3 text-left font-semibold">log2FC</th>
              <th className="p-3 text-left font-semibold">p-value</th>
              <th className="p-3 text-left font-semibold">FDR (padj)</th>
              <th className="p-3 text-left font-semibold">BaseMean</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((row: any) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 font-mono text-xs text-blue-600">{row.id}</td>
                <td className={`p-3 font-medium ${parseFloat(row.log2FC) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {parseFloat(row.log2FC).toFixed(3)}
                </td>
                <td className="p-3 text-gray-600">{parseFloat(row.pvalue).toExponential(2)}</td>
                <td className="p-3 font-bold text-gray-900">{parseFloat(row.padj).toExponential(2)}</td>
                <td className="p-3 text-gray-500">{Math.round(row.baseMean)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-400">
            No results found. {symbol === '' ? 'No significantly different dsRNAs (FDR < 0.05) in this cell type.' : ''}
          </div>
        )}
      </div>
    </div>
  );
}