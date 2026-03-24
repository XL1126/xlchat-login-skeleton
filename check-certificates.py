#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
证书文件验证工具

功能：
1. 检测相对路径下是否有证书文件
2. 支持检测 .pem、.key、.pfx、.crt、.jks 后缀的文件，以及无后缀文件
3. 验证文件是否符合项目的格式要求
4. 相对路径无法打开或没有文件时，打开选择框选择文件
5. 标注适合项目的格式和建议的文件名
6. 打印检测结果后程序结束
"""

import os
import sys
import tkinter as tk
from tkinter import filedialog

# 相对路径的证书目录
RELATIVE_CERT_DIR = 'client/certs'

# 项目规范的证书文件名
EXPECTED_FILES = {
    'fullchain.pem': '证书链文件',
    'privatekey.pem': '私钥文件'
}

def print_banner():
    print()
    print("=" * 60)
    print("  证书文件验证工具")
    print("=" * 60)
    print()

def detect_file_type(content):
    """检测文件类型"""
    content = content.strip()
    
    # 检测证书链文件（可能包含多个证书）
    if '-----BEGIN CERTIFICATE-----' in content and '-----END CERTIFICATE-----' in content:
        return 'fullchain.pem'
    # 检测私钥文件
    elif '-----BEGIN PRIVATE KEY-----' in content and '-----END PRIVATE KEY-----' in content:
        return 'privatekey.pem'
    return None

def select_files():
    """打开文件选择对话框"""
    root = tk.Tk()
    root.withdraw()  # 隐藏主窗口
    
    try:
        file_paths = filedialog.askopenfilenames(
            title="选择证书文件",
            filetypes=[
                ("Certificate files", "*.pem *.key *.pfx *.crt *.jks"),
                ("All files", "*.*")
            ]
        )
        return list(file_paths)
    except Exception as e:
        print(f"  ✗ 打开文件选择框失败: {str(e)}")
        return []

def process_files(file_paths):
    """处理选择的文件并返回分类结果"""
    invalid_files = []
    fullchain_files = []
    privatekey_files = []
    
    for file_path in file_paths:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检测文件类型
            file_type = detect_file_type(content)
            if file_type == 'fullchain.pem':
                fullchain_files.append(os.path.basename(file_path))
            elif file_type == 'privatekey.pem':
                privatekey_files.append(os.path.basename(file_path))
            else:
                invalid_files.append(os.path.basename(file_path))
                
        except UnicodeDecodeError:
            invalid_files.append(os.path.basename(file_path))
        except Exception:
            invalid_files.append(os.path.basename(file_path))
    
    return invalid_files, fullchain_files, privatekey_files

def print_results(invalid_files, fullchain_files, privatekey_files):
    """按照要求的格式打印结果"""
    print()
    print("-" * 50)
    
    # 打印不符合要求的文件
    if invalid_files:
        print("不符合项目要求的文件：")
        for file_name in invalid_files:
            print(f"  ✗ {file_name}")
    else:
        print("不符合项目要求的文件：")
        print("    - 无")
    
    print("-" * 50)
    
    # 打印证书链文件
    print("证书链文件（可以更改文件名为：fullchain.pem）：")
    if fullchain_files:
        for file_name in fullchain_files:
            print(f"  ✓ {file_name}")
    else:
        print("    - 无")
    
    print("-" * 50)
    
    # 打印私钥文件
    print("私钥文件（可以更改文件名为：privatekey.pem）：")
    if privatekey_files:
        for file_name in privatekey_files:
            print(f"  ✓ {file_name}")
    else:
        print("    - 无")
    
    print("-" * 50)

def check_relative_path():
    """检查相对路径下的文件"""
    print("\n检查相对路径下的证书文件...")
    print(f"  检测路径: {RELATIVE_CERT_DIR}")
    
    try:
        if not os.path.exists(RELATIVE_CERT_DIR):
            print("  ⚠ 相对路径不存在")
            return [], [], []
        
        if not os.path.isdir(RELATIVE_CERT_DIR):
            print("  ⚠ 相对路径不是目录")
            return [], [], []
        
        # 检测支持的文件类型
        supported_extensions = ['.pem', '.key', '.pfx', '.crt', '.jks']
        found_files = []
        
        for file_name in os.listdir(RELATIVE_CERT_DIR):
            file_path = os.path.join(RELATIVE_CERT_DIR, file_name)
            
            # 跳过 README.md
            if file_name == 'README.md':
                continue
            
            # 检查文件是否支持
            ext = os.path.splitext(file_name)[1].lower()
            if ext in supported_extensions or '.' not in file_name:
                found_files.append(file_path)
        
        if not found_files:
            print("  ⚠ 未找到支持的证书文件")
            return [], [], []
        
        # 检测文件
        print(f"  找到 {len(found_files)} 个文件")
        return process_files(found_files)
        
    except Exception as e:
        print(f"  ✗ 检查相对路径失败: {str(e)}")
        return [], [], []

def main():
    print_banner()
    
    # 检查相对路径
    invalid_files, fullchain_files, privatekey_files = check_relative_path()
    
    # 如果相对路径检查失败，让用户选择文件
    if not (invalid_files or fullchain_files or privatekey_files):
        print("\n请选择证书文件...")
        file_paths = select_files()
        
        if file_paths:
            invalid_files, fullchain_files, privatekey_files = process_files(file_paths)
        else:
            print("  ✗ 未选择任何文件")
    
    # 打印结果
    if invalid_files or fullchain_files or privatekey_files:
        print_results(invalid_files, fullchain_files, privatekey_files)
    
    # 最终结果
    print("\n" + "=" * 60)
    print("  检测完成")
    print("=" * 60)
    print()
    print("  项目需要的证书文件:")
    for filename, description in EXPECTED_FILES.items():
        print(f"    - {filename} ({description})")
    print()
    print("  注意: 脚本不会自动重命名文件，请手动将文件重命名为上述格式")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n操作已取消")
