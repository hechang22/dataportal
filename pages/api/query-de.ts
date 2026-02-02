import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  const { symbol, cellType, limit = 100 } = req.query;

  try {
    const cleanSymbol = symbol ? symbol.trim().toUpperCase() : "";
    const cleanCellType = cellType ? cellType.trim() : "";

    // 1. 读取 DE 文件
    // 注意路径：在 Next.js API 中，public 文件夹位于 process.cwd()
    const dePath = path.join(process.cwd(), 'public','DEres', 'dsEER_Differential', `${cleanCellType}.txt`);
    
    // 检查文件是否存在
    try {
      await fs.access(dePath);
    } catch {
      return res.status(200).json([]); // 如果文件不存在，返回空数组而不是报错
    }

    const deContent = await fs.readFile(dePath, 'utf-8');
    const deLines = deContent.split('\n');
    const deDataRaw = deLines.slice(1); // 去掉表头

    let matchedResults = [];

    if (cleanSymbol !== "") {
      // --- 逻辑 A: 按基因名查询 ---
      const annoPath = path.join(process.cwd(), 'public','DEres', 'dsRNA_anno_35257.txt');
      const annoContent = await fs.readFile(annoPath, 'utf-8');
      const annoLines = annoContent.split('\n');
      const annoHeaders = annoLines[0].split('\t');
      
      const v4Idx = annoHeaders.indexOf('V4');
      const symIdx = annoHeaders.indexOf('SYMBOL');

      // 找到匹配该基因的所有 ID
      const targetIds = new Set(
        annoLines.slice(1)
          .filter(line => {
            const cols = line.split('\t');
            return cols[symIdx] && cols[symIdx].trim().toUpperCase() === cleanSymbol;
          })
          .map(line => line.split('\t')[v4Idx])
      );

      // 在 DE 数据中过滤这些 ID
      matchedResults = deDataRaw.filter(line => {
        const id = line.split('\t')[0];
        return targetIds.has(id);
      });

    } else {
      // --- 逻辑 B: 展示显著差异项 (padj < 0.05) ---
      matchedResults = deDataRaw.filter(line => {
        const cols = line.split('\t');
        if (cols.length < 5) return false;
        const padj = parseFloat(cols[4]);
        return !isNaN(padj) && padj < 0.05;
      });
    }

    // 格式化前 100 条
    const formatted = matchedResults.slice(0, Number(limit)).map(line => {
      const cols = line.split('\t');
      return {
        id: cols[0],
        log2FC: cols[1],
        pvalue: cols[3],
        padj: cols[4],
        baseMean: cols[5]
      };
    });

    return res.status(200).json(formatted);

  } catch (error) {
    console.error(error);
    // 关键：即使报错也返回空数组，防止前端 map 崩溃
    return res.status(200).json([]); 
  }
}