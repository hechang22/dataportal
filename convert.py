import sqlite3
import os
import csv

# 路径设置
db_path = 'public/DEres/dsRNA_DEres.db'
anno_path = 'public/DEres/dsRNA_anno_35257.txt'
de_dir = 'public/DEres/dsEER_Differential'

if os.path.exists(db_path): os.remove(db_path)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute('PRAGMA journal_mode = WAL')

print("--- Initializing Database ---")
cursor.execute('CREATE TABLE anno (id TEXT, symbol TEXT)')
cursor.execute('CREATE INDEX idx_anno_id ON anno (id)')
cursor.execute('CREATE INDEX idx_anno_symbol ON anno (symbol)')

cursor.execute('''CREATE TABLE de_results (
                    id TEXT, cell_type TEXT, log2FC REAL, 
                    pvalue REAL, padj REAL, baseMean REAL)''')
cursor.execute('CREATE INDEX idx_de_cell_padj ON de_results (cell_type, padj)')

# 1. 导入 Anno (修正列定位)
print(f"Reading {anno_path}...")
with open(anno_path, 'r', encoding='utf-8') as f:
    header = f.readline().strip().split('\t')
    
    # 动态查找索引，确保万无一失
    v4_idx = header.index('V4')      # 对应 chr1:136025...
    symbol_idx = header.index('SYMBOL') # 对应 LOC100996442
    
    seen_ids = set()
    anno_data = []
    for line in f:
        cols = line.strip().split('\t')
        if len(cols) > max(v4_idx, symbol_idx):
            dsrna_id = cols[v4_idx].strip()
            symbol = cols[symbol_idx].strip()
            if dsrna_id and dsrna_id not in seen_ids:
                anno_data.append((dsrna_id, symbol))
                seen_ids.add(dsrna_id)
    
    cursor.executemany('INSERT INTO anno VALUES (?, ?)', anno_data)
    print(f"  Loaded {len(anno_data)} unique annotations.")

# 2. 导入 DE 结果
print("Reading DE files...")
for filename in os.listdir(de_dir):
    if filename.endswith('.txt'):
        cell_type = filename.replace('.txt', '')
        file_path = os.path.join(de_dir, filename)
        with open(file_path, 'r', encoding='utf-8') as f:
            f.readline() # 跳过表头
            de_data = []
            for line in f:
                cols = line.strip().split('\t')
                if len(cols) >= 6:
                    try:
                        # 格式：ID, log2FC, logCPM, pvalue, padj, baseMean
                        de_data.append((cols[0], cell_type, float(cols[1]), 
                                       float(cols[3]), float(cols[4]), float(cols[5])))
                    except: continue
            cursor.executemany('INSERT INTO de_results VALUES (?, ?, ?, ?, ?, ?)', de_data)

conn.commit()
cursor.execute('ANALYZE')
conn.close()

print(f"--- Done! Database size is approx {os.path.getsize(db_path)//1024//1024} MB ---")