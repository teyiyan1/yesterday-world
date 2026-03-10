#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
提取PDF文本并按章节分割

使用方法:
1. 安装PDF处理库（任选其一）:
   pip3 install pymupdf  (推荐，速度快)
   或
   pip3 install pdfplumber
   或
   pip3 install PyPDF2

2. 运行脚本:
   python3 extract_pdf.py

输出文件: books/yesterday-world/data/content.json
"""

import json
import re
import sys
from pathlib import Path

# 尝试多个PDF库
pdf_lib = None
try:
    import fitz  # PyMuPDF
    pdf_lib = 'pymupdf'
    print("使用 PyMuPDF 库")
except ImportError:
    try:
        import pdfplumber
        pdf_lib = 'pdfplumber'
        print("使用 pdfplumber 库")
    except ImportError:
        try:
            import PyPDF2
            pdf_lib = 'pypdf2'
            print("使用 PyPDF2 库")
        except ImportError:
            print("\n错误: 未找到PDF处理库")
            print("\n请安装以下任一库:")
            print("  pip3 install pymupdf  (推荐，速度快)")
            print("  pip3 install pdfplumber")
            print("  pip3 install PyPDF2")
            print("\n如果安装失败，请尝试:")
            print("  python3 -m pip install --user pymupdf")
            sys.exit(1)

def extract_text_from_pdf(pdf_path):
    """从PDF中提取文本"""
    text = ""
    try:
        if pdf_lib == 'pymupdf':
            import fitz
            doc = fitz.open(pdf_path)
            for page in doc:
                text += page.get_text() + "\n"
            doc.close()
        elif pdf_lib == 'pdfplumber':
            import pdfplumber
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        elif pdf_lib == 'pypdf2':
            import PyPDF2
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
    except Exception as e:
        print(f"提取PDF文本时出错: {e}")
        import traceback
        traceback.print_exc()
        return None
    return text

def split_into_chapters(text):
    """按章节分割文本"""
    chapters = []
    
    # 已知的章节标题列表（从目录中提取）
    known_chapters = [
        '前言', '文前', '太平世界', '上世纪的学校', '情窦初开', 
        '大学生活', '永葆青春的城市——巴黎', '我的崎岖道路', 
        '走出欧洲', '欧洲的光彩和阴暗', '一九一四年战争爆发初期',
        '为崇高的情谊而奋斗', '在欧洲的心脏', '重返奥地利', 
        '又回到世界上', '日落', '希特勒的崛起', '和平的濒死状态'
    ]
    
    # 常见的章节标题模式（中文）
    chapter_patterns = [
        r'^第[一二三四五六七八九十]+章\s*(.+)',           # 第一章 标题
        r'^第[0-9]+章\s*(.+)',                            # 第1章 标题
        r'^[一二三四五六七八九十]+[、．]\s*(.+)',          # 一、标题
        r'^[0-9]+[、．]\s*(.+)',                          # 1. 标题
        r'^第[一二三四五六七八九十]+部分\s*(.+)',         # 第一部分 标题
    ]
    
    # 按段落分割
    paragraphs = text.split('\n')
    
    current_chapter = None
    current_content = []
    skip_until_content = True  # 跳过目录部分
    
    for i, para in enumerate(paragraphs):
        para = para.strip()
        
        # 跳过空行
        if not para:
            if current_content:  # 保留空行作为段落分隔
                current_content.append('')
            continue
        
        # 检查是否是已知的章节标题（独立成行，前后有空行或长段落）
        is_known_chapter = False
        if para in known_chapters:
            # 检查前后上下文，确保是独立的章节标题
            prev_empty = i == 0 or not paragraphs[i-1].strip()
            next_long = (i < len(paragraphs) - 1 and 
                        len(paragraphs[i+1].strip()) > 50)
            
            # 如果是在目录部分，跳过
            if skip_until_content:
                # 找到"前言"或"文前"后，开始记录内容
                if para in ['前言', '文前']:
                    skip_until_content = False
                    is_known_chapter = True
            elif prev_empty or next_long:
                is_known_chapter = True
        
        # 检查是否符合章节标题模式
        is_pattern_match = False
        chapter_title = None
        
        if not is_known_chapter:
            for pattern in chapter_patterns:
                match = re.match(pattern, para)
                if match:
                    is_pattern_match = True
                    # 提取标题内容
                    if match.lastindex and match.group(match.lastindex):
                        chapter_title = match.group(match.lastindex).strip()
                    else:
                        # 如果没有捕获组，尝试从原文本提取
                        title_match = re.search(r'第[一二三四五六七八九十0-9]+[章节部分]?\s*(.+)', para)
                        if title_match:
                            chapter_title = title_match.group(1).strip()
                        else:
                            # 提取序号后的内容
                            title_match = re.search(r'[一二三四五六七八九十0-9]+[、．]\s*(.+)', para)
                            if title_match:
                                chapter_title = title_match.group(1).strip()
                            else:
                                chapter_title = para
                    break
        
        # 如果是章节标题
        if is_known_chapter or is_pattern_match:
            # 保存上一章
            if current_chapter is not None and current_content:
                content_text = "\n".join(current_content).strip()
                if content_text:  # 确保内容不为空
                    chapters.append({
                        "index": len(chapters) + 1,
                        "title": current_chapter,
                        "content": content_text
                    })
            
            # 开始新章节
            if is_known_chapter:
                current_chapter = para
            else:
                current_chapter = chapter_title or para
            current_content = []
            skip_until_content = False  # 开始记录内容
        else:
            if not skip_until_content:
                if current_chapter is None:
                    # 如果没有找到章节标题，使用第一个非空段落作为第一章
                    current_chapter = "前言"
                current_content.append(para)
    
    # 添加最后一章
    if current_chapter is not None and current_content:
        content_text = "\n".join(current_content).strip()
        if content_text:
            chapters.append({
                "index": len(chapters) + 1,
                "title": current_chapter,
                "content": content_text
            })
    
    # 如果没有找到章节，将整个文本作为一章
    if not chapters:
        content_text = text.strip()
        if content_text:
            chapters.append({
                "index": 1,
                "title": "全文",
                "content": content_text
            })
    
    return chapters

def main():
    # PDF文件路径
    pdf_path = Path("书籍完整内容/昨日的世界：一个欧洲人的回忆 (【奥】斯特凡·茨威格 著；徐友敬 译) (1).pdf")
    
    # 输出路径
    output_dir = Path("books/yesterday-world/data")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "content.json"
    
    print(f"正在提取PDF文本: {pdf_path}")
    text = extract_text_from_pdf(pdf_path)
    
    if text is None:
        print("提取失败")
        return
    
    print(f"提取了 {len(text)} 个字符")
    print("正在按章节分割...")
    
    chapters = split_into_chapters(text)
    
    print(f"\n找到 {len(chapters)} 个章节:")
    for i, chapter in enumerate(chapters[:10], 1):  # 显示前10章
        title_preview = chapter['title'][:50] + ('...' if len(chapter['title']) > 50 else '')
        content_length = len(chapter['content'])
        print(f"  第{i}章: {title_preview} ({content_length} 字符)")
    
    if len(chapters) > 10:
        print(f"  ... 还有 {len(chapters) - 10} 个章节")
    
    # 保存为JSON
    result = {
        "chapters": chapters
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n已保存到: {output_path}")
    print(f"共 {len(chapters)} 个章节，总字符数: {sum(len(c['content']) for c in chapters)}")

if __name__ == "__main__":
    main()
