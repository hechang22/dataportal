import Image from 'next/image';
import { Inter } from 'next/font/google';
import { format } from 'timeago.js';
import { promises as fs } from 'fs';
import path from 'path';
import { NextSeo } from 'next-seo';
import Layout from '@/components/Layout';

import { ChartPieIcon, TableCellsIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { text } from 'stream/consumers';
import UniversalDESearch from '@/components/UniversalDESearch';
import ModuleCard  from '@/components/ModuleCard';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {

  // 状态：null 表示首页卡片流，'mRNA'|'ncRNA'|'dsEER'|'dsRIP' 表示具体模块
  const [activeModule, setActiveModule] = useState(null);

  // 模块数据配置
  const modules = [
    {
      id: 'mRNA',
      title: 'mRNA',
      description: 'Explore differential analysis on protein-coding RNAs.',
      image: '/figures/mRNA.png' // 替换为你实际的图片路径
    },
    {
      id: 'ncRNA',
      title: 'ncRNA',
      description: 'Investigate non-coding RNA variations.',
      image: '/figures/ncRNA.png'
    },
    {
      id: 'dsEER',
      title: 'dsRNA',
      description: 'Differential dsRNA landscape including dsEER and dsRIP',
      image: '/figures/dsRNA.jpg'
    }
  ];

  return (
    <Layout>
      <main
        className={`flex min-h-screen flex-col items-center max-w-5xl mx-auto pt-20 px-2.5 ${inter.className}`}
      >
      
      <div>
          <h1 className="text-[23px] font-bold text-zinc-800 text-center">
            Cell-specific RNA landscape for systemic lupus erythematosus
          </h1>
          <p className="max-w-[1000px] text-[18px] text-center text-[#6d6f71]">
            Total RNA sequencing of 30 cellular and extracellular components of blood in systemic lupus erythematosus.
          </p>
      </div>

      <br/><br/>

        {/* 如果没有选中模块，显示卡片网格 */}
        {!activeModule ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            {modules.map(mod => (
              <ModuleCard 
                key={mod.id}
                title={mod.title}
                description={mod.description}
                image={mod.image}
                onExplore={() => setActiveModule(mod.id)}
              />
            ))}
          </div>
        ) : (
          /* 如果选中了模块，显示对应的查询组件，并带有一个“返回”按钮 */
          <div className="space-y-6">
            <button 
              onClick={() => setActiveModule(null)}
              className="flex items-center text-[#005682] hover:underline font-medium"
            >
              ← Back to Analysis Modules
            </button>
            
            {/* 根据选择渲染查询组件 */}
            {activeModule === 'dsEER' ? (
               <div className="space-y-4">
                  {/* 这里可以再放一个小切换，或者直接分两个组件 */}
                  <UniversalDESearch type="dsEER" title="dsRNA (dsEER) Analysis" />
                  <div className="mt-8">
                    <UniversalDESearch type="dsRIP" title="dsRNA (dsRIP) Analysis" />
                  </div>
               </div>
            ) : (
              <UniversalDESearch 
                type={activeModule} 
                title={`${activeModule} Differential Expression`} 
              />
            )}
          </div>
        )}

      </main>
    </Layout>
  );
}
