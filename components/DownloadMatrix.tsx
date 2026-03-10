import { useState } from 'react';

export default function DownloadMatrix() {
  const [loading, setLoading] = useState<string | null>(null);

  const downloadFile = async (fileName: string) => {
    setLoading(fileName);
    try {
      // 1. 请求后端获取临时下载链接
      const res = await fetch(`/api/get-download-url?fileName=${fileName}`);
      const { url, error } = await res.json();

      if (error) throw new Error(error);

      // 2. 模拟点击进行下载
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; // 提示浏览器下载
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("Download failed: " + err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center my-6">
      <h3 className="text-lg font-bold text-zinc-800 mb-2">Download Expression Matrices</h3>
      <p className="text-sm text-gray-500 mb-6">
        Full normalized expression data across all SLE and HD samples.
      </p>
      
      <div className="flex justify-center gap-6">
        <button
          onClick={() => downloadFile('gencode_Discovery_TPM_3021.txt')}
          disabled={loading !== null}
          className="flex items-center gap-2 bg-[#005682] text-white px-6 py-3 rounded-lg hover:bg-[#004466] transition-all disabled:opacity-50"
        >
          {loading === 'gencode_Discovery_TPM_3021.txt' ? 'Preparing...' : 'Discovery Cohort'}
        </button>

        <button
          onClick={() => downloadFile('gencode_Validation_TPM_416.txt')}
          disabled={loading !== null}
          className="flex items-center gap-2 bg-[#005682] text-white px-6 py-3 rounded-lg hover:bg-[#004466] transition-all disabled:opacity-50"
        >
          {loading === 'gencode_Validation_TPM_416.txt' ? 'Preparing...' : 'Validation Cohort'}
        </button>
      </div>
    </div>
  );
}