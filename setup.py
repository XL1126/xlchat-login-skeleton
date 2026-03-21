#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import subprocess

def print_banner():
    print()
    print("=" * 60)
    print("  XL Chat 依赖安装工具")
    print("=" * 60)
    print()

def check_node():
    print("正在检查 Node.js 环境...")
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True, check=True)
        print(f"  ✓ Node.js 版本: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("  ✗ 错误: 未找到 Node.js")
        print("    请先安装 Node.js: https://nodejs.org/")
        return False

def check_npm():
    print("正在检查 npm 环境...")
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True, check=True)
        print(f"  ✓ npm 版本: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("  ✗ 错误: 未找到 npm")
        print("    请先安装 npm")
        return False

def install_root_deps():
    print()
    print("-" * 60)
    print("  正在安装根项目依赖...")
    print("-" * 60)

    if not os.path.exists('package.json'):
        print("  ✗ 错误: 未找到 package.json")
        return False

    try:
        subprocess.run(['npm', 'install'], check=True, cwd=os.path.dirname(os.path.abspath(__file__)))
        print("  ✓ 根项目依赖安装完成")
        return True
    except subprocess.CalledProcessError:
        print("  ✗ 根项目依赖安装失败")
        return False

def install_client_deps():
    print()
    print("-" * 60)
    print("  正在安装前端依赖...")
    print("-" * 60)

    client_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'client')
    client_package = os.path.join(client_path, 'package.json')

    if not os.path.exists(client_package):
        print("  ✗ 错误: 未找到 client/package.json")
        return False

    try:
        subprocess.run(['npm', 'install'], check=True, cwd=client_path)
        print("  ✓ 前端依赖安装完成")
        return True
    except subprocess.CalledProcessError:
        print("  ✗ 前端依赖安装失败")
        return False

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    print_banner()

    print("正在检查环境...")
    print()

    if not check_node():
        print()
        input("按 Enter 键退出...")
        return

    if not check_npm():
        print()
        input("按 Enter 键退出...")
        return

    print()
    print("=" * 60)
    print("  开始安装依赖")
    print("=" * 60)
    print()

    success = True

    if not install_root_deps():
        success = False

    if not install_client_deps():
        success = False

    print()
    print("=" * 60)

    if success:
        print("  ✓ 所有依赖安装成功！")
        print()
        print("  现在可以运行:")
        print("    python launcher.py")
        print("  或")
        print("    npm run dev")
        print()
    else:
        print("  ✗ 依赖安装过程中出现错误")
        print()
        print("  请检查网络连接后重试")
        print()

    print("=" * 60)
    print()

    input("按 Enter 键退出...")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print()
        print()
        print("安装已取消")
        print()
