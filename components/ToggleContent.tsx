// components/ToggleContent.tsx
import { useState } from 'react';

interface ToggleContentProps {
  button1Text?: string;
  button2Text?: string;
  content1?: React.ReactNode;
  content2?: React.ReactNode;
  button1Icon?: React.ReactNode;
  button2Icon?: React.ReactNode;
  initialActive?: 'content1' | 'content2';
}

export default function ToggleContent({
  button1Text = '按钮1',
  button2Text = '按钮2',
  content1 = <div>默认内容1</div>,
  content2 = <div>默认内容2</div>,
  button1Icon,
  button2Icon,
  initialActive = 'content1'
}: ToggleContentProps) {
  const [activeContent, setActiveContent] = useState<'content1' | 'content2'>(initialActive);

  return (
    <div className="w-full my-8 p-4 bg-white rounded-xl shadow-lg">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveContent('content1')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            activeContent === 'content1'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {button1Icon}
          {button1Text}
        </button>
        <button
          onClick={() => setActiveContent('content2')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            activeContent === 'content2'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {button2Icon}
          {button2Text}
        </button>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        {activeContent === 'content1' && content1}
        {activeContent === 'content2' && content2}
      </div>
    </div>
  );
}