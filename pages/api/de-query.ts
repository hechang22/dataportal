import { promises as fs } from 'fs';
import path from 'path';

let dsRNA_Anno_Cache: any[] = [];

export default async function handler(req: any, res: any) {
  // 1. 统一参数名：使用 symbol 对应前端的 symbol
  const { type, cellType, symbol, limit = 100 } = req.query; 

  try {
    const cleanQuery = symbol ? symbol.trim().toUpperCase() : "";
    
    const dirMap: Record<string, string> = {
      dsEER: 'dsEER_Differential',
      dsRIP: 'dsRIP_Differential',
      ncRNA: 'ncRNA_Differential',
      mRNA: 'mRNA_Differential'
    };

    const filePath = path.join(process.cwd(), 'public', dirMap[type], `${cellType}.txt`);
    const deContent = await fs.readFile(filePath, 'utf-8');
    const deLines = deContent.split('\n').filter(l => l.trim() !== "");
    const deDataRaw = deLines.slice(1);

    let finalResults = [];

    // --- 分支 A: dsRNA (dsEER / dsRIP) ---
    if (type === 'dsEER' || type === 'dsRIP') {
      if (dsRNA_Anno_Cache.length === 0) {
        const annoPath = path.join(process.cwd(), 'public', 'dsRNA_anno_35257.txt');
        const annoContent = await fs.readFile(annoPath, 'utf-8');
        const annoLines = annoContent.split('\n');
        const headers = annoLines[0].split('\t');
        const v4Idx = headers.indexOf('V4');
        const symIdx = headers.indexOf('SYMBOL');
        dsRNA_Anno_Cache = annoLines.slice(1).map(line => {
          const cols = line.split('\t');
          return { id: cols[v4Idx], symbol: cols[symIdx]?.trim().toUpperCase() };
        });
      }

      if (cleanQuery !== "") {
        // 【核心逻辑】有搜索词：只匹配 ID，不看 p-value（展示非显著结果）
        const targetIds = new Set(
          dsRNA_Anno_Cache.filter(item => item.symbol === cleanQuery).map(item => item.id)
        );
        finalResults = deDataRaw.filter(line => targetIds.has(line.split('\t')[0]));
      } else {
        // 【核心逻辑】搜索词为空：筛选 p-value < 0.05
        finalResults = deDataRaw.filter(line => {
          const pval = parseFloat(line.split('\t')[3]);
          return !isNaN(pval) && pval < 0.05;
        });
      }

      return res.status(200).json(finalResults.slice(0, Number(limit)).map(line => {
        const cols = line.split('\t');
        return { id: cols[0], log2FC: cols[1], logCPM: cols[2], pvalue: cols[3], baseMean: cols[5], padj: null };
      }));
    } 

    // --- 分支 B: ncRNA / mRNA ---
    else {
      if (cleanQuery !== "") {
        // 【核心逻辑】有搜索词：匹配 ENSG_ID (cols[1]) 或 Symbol (cols[2])，不看 padj（展示非显著结果）
        finalResults = deDataRaw.filter(line => {
          const cols = line.split('\t');
          const ensg = cols[1]?.trim().toUpperCase();
          const sym = cols[2]?.trim().toUpperCase();
          return (ensg === cleanQuery || sym === cleanQuery);
        });
      } else {
        // 【核心逻辑】搜索词为空：筛选 padj < 0.05
        finalResults = deDataRaw.filter(line => {
          const cols = line.split('\t');
          const padj = parseFloat(cols[6]);
          return !isNaN(padj) && padj < 0.05;
        });
      }

      return res.status(200).json(finalResults.slice(0, Number(limit)).map(line => {
        const cols = line.split('\t');
        return { id: cols[2], ensg: cols[1], log2FC: cols[3], logCPM: cols[4], pvalue: cols[5], padj: cols[6], baseMean: cols[7] };
      }));
    }

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(200).json([]);
  }
}