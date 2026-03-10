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

for (file_path in file_list) {
  
  file_name <- basename(file_path)
  message(paste("Processing:", file_name))
  
  df <- read.csv(file_path, sep = '\t') %>% rownames_to_column(var = 'raw_id')
  
  # 通用处理逻辑：拆分出 ENSG 和 Symbol
  # 使用 extract 通过正则捕获：
  # ^([^.]+)  -> 匹配开头到第一个点之前的内容 (去掉版本号)
  # .*?\\|.*?\\| -> 跳过中间的数字 ID 部分
  # ([^|]+)   -> 匹配 Symbol 部分
  processed_df <- df %>%
    extract(raw_id, 
            into = c("ENSG_ID", "Symbol"), 
            regex = "^([^.]+).*?\\|.*?\\|([^|]+)\\|", 
            remove = FALSE) # remove = FALSE 保留原始行名(raw_id)
  
  # --- 分流保存 ---
  
  # 1. Protein Coding 类
  protein_out <- processed_df %>% 
    filter(str_detect(raw_id, "protein_coding$"))
  
  write_tsv(protein_out, file.path(protein_dir, file_name))
  
  # 2. Others 类
  others_out <- processed_df %>% 
    filter(!str_detect(raw_id, "protein_coding$"))
  
  write_tsv(others_out, file.path(other_dir, file_name))
}

message("处理完成！ENSG版本号已移除，原始行名已保留。")