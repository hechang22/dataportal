import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import fs from 'fs';
import path from 'path';

// --- 关键优化：在 handler 外部定义缓存变量 ---
// 这样当 Vercel 函数处于“热启动”状态时，不需要重新读取 8MB 的文件
let cachedAnnoMap: Map<string, string[]> | null = null;

// 建议将 Client 放在 Handler 外部，但要确保它能捕获到变量
const getS3Client = () => {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT;

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error(`Missing R2 credentials: ID=${!!accessKeyId}, Secret=${!!secretAccessKey}, End=${!!endpoint}`);
  }

  return new S3Client({
    region: "auto", // R2 必须是 auto
    endpoint: endpoint,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
};

// 辅助函数：将 R2 流转字符串
async function streamToString(stream: Readable): Promise<string> {
  const chunks: any[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

// 辅助函数：读取并解析本地 Anno 文件
function getAnnoMap() {
  if (cachedAnnoMap) return cachedAnnoMap;

  console.log("Loading Anno file from local storage...");
  const annoPath = path.join(process.cwd(), 'public', 'dsRNA_anno_35257.txt');
  const content = fs.readFileSync(annoPath, 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split('\t');
  const v4Idx = headers.indexOf('V4');
  const symIdx = headers.indexOf('SYMBOL');

  const map = new Map<string, string[]>();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (cols.length > Math.max(v4Idx, symIdx)) {
      const sym = cols[symIdx].trim().toUpperCase();
      const id = cols[v4Idx].trim();
      if (!map.has(sym)) {
        map.set(sym, []);
      }
      map.get(sym)?.push(id);
    }
  }

  cachedAnnoMap = map;
  return map;
}

export default async function handler(req: any, res: any) {
  const { type, cellType, symbol, limit = 100 } = req.query;

  try {
    const dirMap: Record<string, string> = {
      dsEER: 'dsEER_Differential',
      dsRIP: 'dsRIP_Differential',
      ncRNA: 'ncRNA_Differential',
      mRNA: 'mRNA_Differential'
    };

    const key = `${dirMap[type]}/${cellType}.txt`;
    const s3 = getS3Client();

    // 1. 从 R2 下载对应的差异分析结果文件 (这部分保持不变)
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });
    const response = await s3.send(command);
    const content = await streamToString(response.Body as Readable);
    const deLines = content.split('\n').filter(l => l.trim() !== "");
    const deDataRaw = deLines.slice(1);

    const cleanQuery = symbol ? symbol.trim().toUpperCase() : "";
    let finalResults = [];

    // --- 分支 A: mRNA / ncRNA 逻辑 ---
    if (!type.startsWith('ds')) {
      if (cleanQuery !== "") {
        finalResults = deDataRaw.filter(line => {
          const cols = line.split('\t');
          return cols[1]?.toUpperCase() === cleanQuery || cols[2]?.toUpperCase() === cleanQuery;
        });
      } else {
        finalResults = deDataRaw.filter(line => parseFloat(line.split('\t')[6]) < 0.05);
      }
      const formatted = finalResults.slice(0, Number(limit)).map(line => {
        const cols = line.split('\t');
        return { id: cols[2], ensg: cols[1], log2FC: cols[3], pvalue: cols[5], padj: cols[6], baseMean: cols[7] };
      });
      
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      return res.status(200).json(formatted);
    } 
    
    // --- 分支 B: dsRNA 逻辑 (使用本地 Anno) ---
    else {
      if (cleanQuery !== "") {
        // 使用本地缓存的 Map 进行 O(1) 级别的查询，速度极快
        const annoMap = getAnnoMap();
        const targetIds = annoMap.get(cleanQuery) || [];
        
        finalResults = deDataRaw.filter(line => {
            const id = line.split('\t')[0];
            return targetIds.includes(id);
        });
      } else {
        // 如果没有搜索词，直接按 p-value < 0.05 过滤 DE 文件，完全不涉及 Anno
        finalResults = deDataRaw.filter(line => {
          const pval = parseFloat(line.split('\t')[3]);
          return !isNaN(pval) && pval < 0.05;
        });
      }

      const formatted = finalResults.slice(0, Number(limit)).map(line => {
        const cols = line.split('\t');
        return { id: cols[0], log2FC: cols[1], pvalue: cols[3], baseMean: cols[5], padj: null };
      });

      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      return res.status(200).json(formatted);
    }

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}