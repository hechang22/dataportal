import Image from 'next/image';
import { Inter } from 'next/font/google';
import { format } from 'timeago.js';
import { promises as fs } from 'fs';
import path from 'path';
import { NextSeo } from 'next-seo';
import Layout from '@/components/Layout';
import { FlatUiTable } from '@portaljs/components';
import ToggleContent from '@/components/ToggleContent';
import SelectiveContent from '@/components/SelectiveContent';
import { ChartPieIcon, TableCellsIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export interface Article {
  date: string;
  title: string;
  url: string;
}

export interface Dataset {
  url: string;
  name: string;
  displayName: string;
  articles: Article[];
  files?: string[];
}

// Request a weekday along with a long date
const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
} as const;

export function MobileItem({ dataset }: { dataset: Dataset }) {
  return (
    <div className="flex gap-x-2 pb-2 py-4 items-center justify-between border-b border-zinc-600">
      <div className="flex flex-col">
        <span className="font-mono font-light">{dataset.name}</span>
        {dataset.articles.map((article) => (
          <div key={article.title} className="py-1 flex flex-col">
            <span className="font-bold hover:underline">{article.title}</span>
            <span className="font-light text-base">
              {format(article.date).includes('years')
                ? new Date(article.date).toLocaleString('en-US', options)
                : format(article.date)}
            </span>{' '}
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-start">
        <a
          className="ml-2 border border-zinc-900 font-light px-4 py-1 text-sm transition hover:bg-zinc-900 hover:text-white"
          href={dataset.url}
        >
          info
        </a>
        <a
          className="ml-2 border border-[#3c3c3c] px-[25px] py-2.5 text-sm transition bg-[#3c3c3c] text-white hover:bg-zinc-900"
          href={`/datasets/${dataset.name}`}
        >
          explore
        </a>
      </div>
    </div>
  );
}

export function DesktopItem({ dataset }: { dataset: Dataset }) {
  return (
    <>
      {dataset.articles.map((article, index) => (
        <tr
          key={article.url}
          className={`${
            index === dataset.articles.length - 1 ? 'border-b' : ''
          } border-zinc-400`}
        >
          <td className="py-8 font-light font-mono text-[13px] text-zinc-700">
            {index === 0 ? dataset.name : ''}
          </td>
          <td>
            <a
              className="py-8 font-bold hover:underline pr-2"
              href={article.url}
            >
              {article.title}
            </a>
          </td>
          <td className="py-8 font-light text-[14px] min-w-[138px] font-mono text-[#999]">
            {format(article.date).includes('years')
              ? new Date(article.date).toLocaleString('en-US', options)
              : format(article.date)}
          </td>
          <td>
            {index === 0 && (
            <a
              className="ml-2 border border-[#3c3c3c] px-[25px] py-2.5 text-sm transition bg-[#3c3c3c] text-white hover:bg-zinc-900"
              href={`/datasets/${dataset.name}`}
            >
              explore
            </a>
            )}
          </td>
          <td className="py-8">
            {index === 0 && (
              <a
                className="ml-2 border border-zinc-900 font-light px-[25px] py-2.5 text-sm transition hover:bg-zinc-900 hover:text-white"
                href={dataset.url}
              >
                info
              </a>
            )}
          </td>
        </tr>
      ))}
    </>
  );
}

export async function getStaticProps() {
  const jsonDirectory = path.join(process.cwd(), '/datasets.json');
  const datasetString = await fs.readFile(jsonDirectory, 'utf8');
  const datasets = JSON.parse(datasetString);
  return {
    props: { datasets },
  };
}

export default function Home({ datasets }: { datasets: Dataset[] }) {
  return (
    <>
      <NextSeo title="Data Portal for SLE" />
      <Layout>
      <main
        className={`flex min-h-screen flex-col items-center max-w-5xl mx-auto pt-20 px-2.5 ${inter.className}`}
      >
        <div>
          <h1 className="text-[23px] font-bold text-zinc-800 text-center">
            Cell-specific multi-omics landscape for systemic lupus erythematosus
          </h1>
          <p className="max-w-[1000px] text-[18px] text-center text-[#6d6f71]">
            Total RNA sequencing of 30 cellular and extracellular components of blood in systemic lupus erythematosus.
          </p>
        </div>
          
        <br/><br/>  
        <br/><br/>  
        <img
          width="700"
          height="700"
          alt="summary"
          src="figure1.jpg"
        />{' '}  
<ToggleContent
  items={[
    {
    text: 'Sample Info', 
    content: 
    <div className="prose max-w-none"> 
      <FlatUiTable url={"Discovery-sample-info-forSLEportal.csv"} /> 
    </div>
    },
    {
    text: 'Cellular Metadata', 
    content: 
    <div className="space-y-4">
      <div className="max-w-4xl mx-auto">
        <SelectiveContent
          options={[
            {
              value: 'total',
              label: 'Total-RNA-seq',
              content: <FlatUiTable url={"cellular-metadata-520.csv"} />
            },
            {
              value: 'm6A',
              label: 'm6A-seq',
              content: <FlatUiTable url={"Anno_2025_Discovery_m6Aseq_forSLEportal.csv"} />
            },
            {
              value: 'dsRIP',
              label: 'dsRIP',
              content: <FlatUiTable url={"Anno_2025_Discovery_dsRIP_forSLEportal_2.csv"} />
            }
          ]}
          buttonClassName="w-full bg-gray-100 hover:bg-gray-200 rounded-lg py-2 px-4"
          contentClassName="mt-4"
        />
      </div>
    </div>
  },
  {
  text: 'Cell-free Metadata',
  content: 
  <div className="prose max-w-none"> 
    <FlatUiTable url={"cf-metadata-520.csv"} /> 
  </div>
  }
  ]}
/>

        <article className="w-full px-2 md:hidden py-4">
          {datasets.map((dataset) => (
            <MobileItem key={dataset.name} dataset={dataset} />
          ))}
        </article>
        <table className="w-full mt-10 mb-4 hidden md:table">
          <thead className="border-b-4 pb-2 border-zinc-900">
            <tr>
              <th className="uppercase text-left font-normal text-xs pb-3">
                data set
              </th>
              <th className="uppercase text-left font-normal text-xs pb-3">
                related content
              </th>
              <th className="uppercase text-left font-normal text-xs pb-3">
                last updated
              </th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset) => (
              <DesktopItem key={dataset.name} dataset={dataset} />
            ))}
          </tbody>
          </table>     
        {/* <p className="text-[13px] py-8">
          Unless otherwise noted, our data sets are available under the{' '}
          <a
            className="text-blue-400 hover:underline"
            href="http://creativecommons.org/licenses/by/4.0/"
          >
            Creative Commons Attribution 4.0 International license
          </a>
          , and the code is available under the{' '}
          <a
            className="text-blue-400 hover:underline"
            href="http://opensource.org/licenses/MIT"
          >
            MIT license
          </a>
          . If you find this information useful, please{' '}
          <a
            className="text-blue-400 hover:underline"
            href="mailto:data@fivethirtyeight.com"
          >
            let us know
          </a>
          .
          </p>   */}
      </main>
      </Layout>
    </>
  );
}
