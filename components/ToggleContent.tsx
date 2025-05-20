// components/ToggleContent.tsx
import { useState } from 'react';

interface ToggleItem {
  text: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface ToggleContentProps {
  items: ToggleItem[];
  initialActiveIndex?: number;
  buttonClassName?: string;
  contentClassName?: string;
}

export default function ToggleContent({
  items = [
    { text: '按钮1', content: <div>默认内容1</div> },
    { text: '按钮2', content: <div>默认内容2</div> }
  ],
  initialActiveIndex = 0,
  buttonClassName = '',
  contentClassName = ''
}: ToggleContentProps) {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  return (
    <div className="w-full my-8 p-4 bg-white rounded-xl shadow-lg">
      <div className="flex flex-wrap gap-4 mb-6">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              activeIndex === index
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${buttonClassName}`}
          >
            {item.icon}
            {item.text}
          </button>
        ))}
      </div>

      <div className={`p-6 bg-gray-50 rounded-lg border border-gray-200 ${contentClassName}`}>
        {items[activeIndex]?.content}
      </div>
    </div>
  );
}

// 应用示例
// 示例1: 两个选项
{/* <ToggleContent
  items={[
    { text: '新闻', content: <NewsList />, icon: <NewsIcon /> },
    { text: '公告', content: <Announcement />, icon: <NoticeIcon /> }
  ]}
/> */}

// 示例2: 三个选项
{/* <ToggleContent
  items={[
    { text: '简介', content: <Profile /> },
    { text: '项目', content: <Projects />, icon: <FolderIcon /> },
    { text: '联系方式', content: <ContactForm /> }
  ]}
  initialActiveIndex={1}
  contentClassName="min-h-[200px]"
/> */}