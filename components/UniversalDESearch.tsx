import { useState } from 'react';
import { CELL_TYPES } from '@/config/cellTypes';

interface SearchProps {
  type: 'dsEER' | 'dsRIP' | 'ncRNA' | 'mRNA';
  title?: string;
}

export default function UniversalDESearch({ type, title }: SearchProps) {
  const [symbol, setSymbol] = useState('');
  const [cellType, setCellType] = useState(CELL_TYPES[0].value);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 根据类型判断 UI 特性
  const isDsRNA = type.startsWith('ds');
  const placeholder = isDsRNA ? "Gene Symbol (e.g. WASF2)" : "Symbol or ENSG ID";
  const pValLabel = isDsRNA ? "p-value" : "p-value"; // 统一显示，逻辑在后端区分

  const handleSearch = async () => {
    setLoading(true);
    try {
      // 确保这里的参数名是 symbol，与后端 destructuring 一致
      const res = await fetch(`/api/de-query?type=${type}&symbol=${symbol.trim()}&cellType=${cellType}&limit=100`);
      const json = await res.json();
      
      if (json.length === 0 && symbol.trim() !== "") {
        // 可选：如果没搜到，给个提示
        alert("No matching gene found in this cell type.");
      }
      
      setData(Array.isArray(json) ? json : []);
    } catch (e) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4 p-5 border rounded-xl bg-white shadow-sm">
      {title && <h3 className="font-bold text-lg text-zinc-800 border-b pb-2">{title}</h3>}
      
      <div className="flex flex-wrap gap-4 items-end">
        {/* 查询框 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search Query</label>
          <input 
            className="border p-2 rounded w-64 text-black focus:ring-2 focus:ring-zinc-400 outline-none"
            placeholder={placeholder}
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* 细胞选择 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cell Type</label>
          <select 
            className="border p-2 rounded w-64 bg-white text-black outline-none"
            value={cellType}
            onChange={(e) => setCellType(e.target.value)}
          >
            {CELL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <button 
          onClick={handleSearch}
          disabled={loading}
          className="bg-zinc-800 text-white px-8 py-2 rounded hover:bg-black transition-colors h-[42px] disabled:bg-gray-400"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto border rounded-lg max-h-[500px]">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 border-b z-10">
            <tr>
              <th className="p-3 text-left font-semibold">{isDsRNA ? 'dsRNA ID' : 'Symbol'}</th>
              <th className="p-3 text-left font-semibold text-zinc-600">log2FC</th>
              <th className="p-3 text-left font-semibold text-zinc-600">{pValLabel}</th>
              {/* 仅 mRNA/ncRNA 展示 padj 列 */}
              {!isDsRNA && <th className="p-3 text-left font-semibold text-zinc-600">FDR (padj)</th>}
              <th className="p-3 text-left font-semibold text-zinc-600">BaseMean</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-zinc-50">
                <td className="p-3 font-mono text-[11px] max-w-[200px] break-all">
                   {row.id} {row.ensg && <span className="text-gray-400 block">({row.ensg})</span>}
                </td>
                <td className={`p-3 font-bold ${parseFloat(row.log2FC) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {parseFloat(row.log2FC).toFixed(3)}
                </td>
                <td className="p-3 text-gray-600">{parseFloat(row.pvalue).toExponential(2)}</td>
                {!isDsRNA && (
                  <td className="p-3 font-bold text-zinc-800">{parseFloat(row.padj).toExponential(2)}</td>
                )}
                <td className="p-3 text-gray-400">{Math.round(row.baseMean)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-400 text-sm">
            {symbol === '' ? `Enter query or search for all significant results.` : 'No matches found.'}
          </div>
        )}
      </div>
    </div>
  );
}