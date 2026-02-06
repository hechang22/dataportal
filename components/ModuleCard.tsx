// components/ModuleCard.tsx
export default function ModuleCard({ title, description, image, onExplore }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center transition-all hover:shadow-md hover:-translate-y-1">
      {/* 模块图片 */}
      <div className="h-40 w-full flex items-center justify-center mb-6">
        <img 
          src={image} 
          alt={title} 
          className="max-h-full max-w-full object-contain"
        />
      </div>
      
      {/* 文字说明 */}
      <h3 className="text-[#005682] text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-6 h-12">
        {description}
      </p>

      {/* Explore 按钮 */}
      <button 
        onClick={onExplore}
        className="bg-[#005682] text-white px-8 py-2 rounded-md font-medium hover:bg-[#004466] transition-colors"
      >
        Explore
      </button>
    </div>
  );
}