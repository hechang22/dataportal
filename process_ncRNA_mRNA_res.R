# 加载必要的库
library(tidyverse)
library(readr)

# 1. 设置路径 (请根据你的实际情况修改)
input_dir <- "/Users/hechang/lulab/dataportal/public/DEres/DE"      # 原始txt所在的文件夹
protein_dir <- "/Users/hechang/lulab/dataportal/public/DEres/mRNA"     # 存放 protein_coding 的文件夹
other_dir <- "/Users/hechang/lulab/dataportal/public/DEres/ncRNA"       # 存放其他的文件夹

# 创建输出目录（如果不存在的话）
if (!dir.exists(protein_dir)) dir.create(protein_dir, recursive = TRUE)
if (!dir.exists(other_dir)) dir.create(other_dir, recursive = TRUE)

# 2. 获取所有txt文件列表
file_list <- list.files(input_dir, pattern = "\\.txt$", full.names = TRUE)

# 3. 循环处理
for (file_path in file_list) {
  
  # 获取文件名（不含路径），用于后续保存
  file_name <- basename(file_path)
  message(paste("正在处理:", file_name))
  
  # 读取数据
  # 注意：由于你的第一列没有表头名，这里通常需要处理一下或者手动指定列名
  # 假设第一列（基因信息列）读入后默认名为 V1 或 row_info
  df <- read.csv(file_path, sep = '\t') %>% rownames_to_column(var = 'gene_info')
  
  # --- 处理 A 部分：Protein Coding ---
  # 逻辑：筛选以 protein_coding 结尾的行
  protein_df <- df %>%
    filter(str_detect(gene_info, "protein_coding$")) %>%
    # 拆分基因信息列
    # 格式示例: ENSG00000000003.15|4536|TSPAN6|protein_coding
    separate(gene_info, 
             into = c("ENSG_ID", "ID2", "Symbol", "Type"), 
             sep = "\\|", 
             remove = TRUE) %>%
    # 根据你的要求：单独单列记录ENSG号，单独单列记录基因名
    # 这里我们保留 ENSG_ID 和 Symbol，去掉中间的数字 ID2 和末尾的 Type
    select(ENSG_ID, Symbol, everything(), -ID2, -Type)
  
  # 保存 protein_coding 文件
  write_tsv(protein_df, file.path(protein_dir, file_name))
  
  # --- 处理 B 部分：Others ---
  # 逻辑：筛选不以 protein_coding 结尾的行
  other_df <- df %>%
    filter(!str_detect(gene_info, "protein_coding$"))
  
  # 保存其他文件（行名不动，即保留原始 gene_info 列）
  write_tsv(other_df, file.path(other_dir, file_name))
}

message("所有文件处理完成！")