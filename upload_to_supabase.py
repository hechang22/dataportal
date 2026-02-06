import psycopg2
import os
import io

# ================= 配置区域 =================
# 替换为你在 Supabase 获取的真实连接字符串
DB_URI = "postgresql://postgres.qwyxctxaevlpqtpmvasy:[password]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"

# 数据存放的根目录
BASE_DIR = "./public"
ANNO_FILE = os.path.join(BASE_DIR, "dsRNA_anno_35257.txt")

# 文件夹与类型的映射
FOLDERS = {
    "mRNA": "mRNA_Differential",
    "ncRNA": "ncRNA_Differential",
    "dsEER": "dsEER_Differential",
    "dsRIP": "dsRIP_Differential"
}
# ===========================================

def get_connection():
    return psycopg2.connect(DB_URI)

def clear_tables():
    """上传前清空旧数据，防止重复"""
    print("Cleaning up old data...")
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("TRUNCATE TABLE anno, de_results;")
    conn.commit()
    cur.close()
    conn.close()

def upload_anno():
    """导入 Anno 注释文件"""
    print(f"Uploading Anno: {ANNO_FILE}")
    conn = get_connection()
    cur = conn.cursor()
    
    with open(ANNO_FILE, 'r', encoding='utf-8') as f:
        header = f.readline().strip().split('\t')
        v4_idx = header.index('V4')
        sym_idx = header.index('SYMBOL')
        
        # 准备内存中的数据流
        output = io.StringIO()
        seen = set()
        for line in f:
            cols = line.strip().split('\t')
            if len(cols) > max(v4_idx, sym_idx):
                ds_id, symbol = cols[v4_idx], cols[sym_idx]
                if ds_id not in seen:
                    output.write(f"{ds_id}\t{symbol}\n")
                    seen.add(ds_id)
        
        output.seek(0)
        cur.copy_from(output, 'anno', columns=('id', 'symbol'), sep='\t')
    
    conn.commit()
    cur.close()
    conn.close()
    print("Anno upload complete.")

def upload_de_files():
    """批量导入所有差异分析文件"""
    conn = get_connection()
    cur = conn.cursor()

    for analysis_type, folder_name in FOLDERS.items():
        dir_path = os.path.join(BASE_DIR, folder_name)
        if not os.path.exists(dir_path):
            print(f"Warning: Folder {dir_path} not found, skipping...")
            continue
        
        for filename in os.listdir(dir_path):
            if not filename.endswith('.txt'): continue
            
            cell_type = filename.replace('.txt', '')
            file_path = os.path.join(dir_path, filename)
            print(f"Streaming {analysis_type} | {cell_type}...")

            with open(file_path, 'r', encoding='utf-8') as f:
                f.readline() # 跳过表头
                output = io.StringIO()
                
                for line in f:
                    cols = line.strip().split('\t')
                    if len(cols) < 5: continue
                    
                    # 根据数据类型处理列映射
                    # 目标表结构: analysis_type, cell_type, id, symbol, ensg_id, log2fc, logcpm, pvalue, padj, basemean
                    if analysis_type.startswith('ds'):
                        # dsRNA 格式: ID, log2FC, logCPM, pval, padj, baseMean
                        # Symbol 和 ENSG 填 \N (Postgres 的空值)
                        res = [analysis_type, cell_type, cols[0], '\\N', '\\N', cols[1], cols[2], cols[3], cols[4], cols[5]]
                    else:
                        # mRNA/ncRNA 格式: raw_id, ENSG_ID, Symbol, log2FC, logCPM, pvalue, padj, baseMean
                        res = [analysis_type, cell_type, cols[0], cols[2], cols[1], cols[3], cols[4], cols[5], cols[6], cols[7]]
                    
                    output.write('\t'.join(res) + '\n')
                
                output.seek(0)
                cur.copy_from(output, 'de_results', sep='\t', null='\\N',
                             columns=('analysis_type', 'cell_type', 'id', 'symbol', 'ensg_id', 'log2fc', 'logcpm', 'pvalue', 'padj', 'basemean'))
        
        conn.commit() # 每个模块提交一次

    cur.close()
    conn.close()
    print("DE results upload complete.")

if __name__ == "__main__":
    try:
        clear_tables()
        upload_anno()
        upload_de_files()
        print("\nSUCCESS: All bioinformatics data uploaded to Supabase!")
    except Exception as e:
        print(f"\nERROR: {e}")