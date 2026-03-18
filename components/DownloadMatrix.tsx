// components/DownloadMatrix.tsx

export default function DownloadMatrix() {
  // 在这里替换为你真实的网盘分享链接
  const DOWNLOAD_LINKS = {
    cohort1: "https://cloud.tsinghua.edu.cn/f/cf0b383b6c25425bb898/?dl=1", 
    cohort2: "https://cloud.tsinghua.edu.cn/f/56b586e73f9b4f46b220/?dl=1",     
  };

  const handleRedirect = (url: string) => {
    // 在新窗口打开网盘页面
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center my-6">
      <h3 className="text-lg font-bold text-zinc-800 mb-2">Download Expression Matrices</h3>
      <p className="text-sm text-gray-500 mb-6">
        Full normalized expression data available via tsinghua cloud. 
      </p>
      
      <div className="flex justify-center gap-6">
        <button
          onClick={() => handleRedirect(DOWNLOAD_LINKS.cohort1)}
          className="flex items-center gap-2 bg-[#005682] text-white px-8 py-3 rounded-lg hover:bg-[#004466] transition-all font-bold shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="text-M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Cohort 1
        </button>

        <button
          onClick={() => handleRedirect(DOWNLOAD_LINKS.cohort2)}
          className="flex items-center gap-2 bg-[#005682] text-white px-8 py-3 rounded-lg hover:bg-[#004466] transition-all font-bold shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Cohort 2
        </button>
      </div>
    </div>
  );
}