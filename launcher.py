#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import argparse

def print_help():
    script_name = os.path.basename(sys.argv[0]) if len(sys.argv[0]) > 1 else "launcher.py"
    print()
    print("=" * 60)
    print("  错误的用法")
    print("=" * 60)
    print()
    print("用法:")
    print(f"  python {script_name} --<格式> --<协议>")
    print()
    print("参数说明:")
    print("  --bat    生成 Windows 批处理文件 (.bat)")
    print("  --sh     生成 Linux/Mac Shell 脚本 (.sh)")
    print()
    print("  --http   使用 HTTP 协议")
    print("  --https  使用 HTTPS 协议")
    print()
    print("示例:")
    print(f"  python {script_name} --bat --http")
    print(f"  python {script_name} --sh --https")
    print(f"  python {script_name} --bat")
    print()
    print("注意:")
    print("  - 使用 --sh 时建议先执行: chmod +x launcher.py")
    print()
    print("=" * 60)
    print()

def generate_bat_selective():
    content = '''@echo off
chcp 65001 > nul 2>&1

echo.
echo ======================================================
echo.
echo              XL Chat 服务启动器
echo.
echo ======================================================
echo.
echo  请选择协议:
echo.
echo    1 - HTTP 协议 ^(端口 5173^)
echo    2 - HTTPS 协议 ^(端口 443^)
echo.
set /p user_choice="请输入选项 [1/2]: "

if "%user_choice%"=="1" goto http
if "%user_choice%"=="2" goto https
goto invalid

:http
cls
echo.
echo  正在启动 HTTP 服务...
echo.
echo  后端地址: http://localhost:3000
echo  前端地址: http://localhost:5173
echo.
echo  按 Ctrl+C 停止服务
echo.
start cmd /k "npm run dev"
goto end

:https
cls
echo.
echo  正在启动 HTTPS 服务...
echo.
echo  后端地址: http://localhost:3000
echo  前端地址: https://localhost:443
echo.
echo  按 Ctrl+C 停止服务
echo.
start cmd /k "npm run dev:https"
goto end

:invalid
cls
echo.
echo  错误: 无效的选项
echo  请输入 1 或 2
echo.
pause

:end
'''
    return content

def generate_bat_quick(protocol):
    if protocol == 'http':
        content = '''@echo off
chcp 65001 > nul 2>&1

echo.
echo  正在启动 XL Chat HTTP 服务...
echo.
echo  后端地址: http://localhost:3000
echo  前端地址: http://localhost:5173
echo.
echo  按 Ctrl+C 停止服务
echo.

npm run dev
'''
    else:
        content = '''@echo off
chcp 65001 > nul 2>&1

echo.
echo  正在启动 XL Chat HTTPS 服务...
echo.
echo  后端地址: http://localhost:3000
echo  前端地址: https://localhost:443
echo.
echo  按 Ctrl+C 停止服务
echo.

npm run dev:https
'''
    return content

def generate_sh_selective():
    content = '''#!/bin/bash

echo "========================================="
echo "  XL Chat 服务启动器"
echo "========================================="
echo ""
echo "请选择协议："
echo "1) HTTP 协议 (端口 5173)"
echo "2) HTTPS 协议 (端口 443)"
echo ""
read -p "请输入选项 (1/2): " choice

case $choice in
    1)
        echo ""
        echo "正在启动 HTTP 服务..."
        echo "后端地址: http://localhost:3000"
        echo "前端地址: http://localhost:5173"
        echo ""
        echo "按 Ctrl+C 停止服务"
        echo ""
        read -p "按 Enter 键继续..."
        npm run dev
        ;;
    2)
        echo ""
        echo "正在启动 HTTPS 服务..."
        echo "后端地址: http://localhost:3000"
        echo "前端地址: https://localhost:443"
        echo ""
        echo "按 Ctrl+C 停止服务"
        echo ""
        read -p "按 Enter 键继续..."
        npm run dev:https
        ;;
    *)
        echo ""
        echo "无效选项，请输入 1 或 2"
        ;;
esac
'''
    return content

def generate_sh_quick(protocol):
    if protocol == 'http':
        content = '''#!/bin/bash

echo ""
echo "  正在启动 XL Chat HTTP 服务..."
echo ""
echo "  后端地址: http://localhost:3000"
echo "  前端地址: http://localhost:5173"
echo ""
echo "  按 Ctrl+C 停止服务"
echo ""

npm run dev
'''
    else:
        content = '''#!/bin/bash

echo ""
echo "  正在启动 XL Chat HTTPS 服务..."
echo ""
echo "  后端地址: http://localhost:3000"
echo "  前端地址: https://localhost:443"
echo ""
echo "  按 Ctrl+C 停止服务"
echo ""

npm run dev:https
'''
    return content

def main():
    parser = argparse.ArgumentParser(description='XL Chat 启动脚本生成器', add_help=False)
    parser.add_argument('--bat', action='store_true', help='生成 Windows 批处理文件')
    parser.add_argument('--sh', action='store_true', help='生成 Linux/Mac Shell 脚本')
    parser.add_argument('--http', action='store_true', help='使用 HTTP 协议')
    parser.add_argument('--https', action='store_true', help='使用 HTTPS 协议')

    args = parser.parse_args()

    if len(sys.argv) == 1 or (len(sys.argv) == 2 and sys.argv[1] in ['--help', '-h', '/?']):
        print_help()
        return

    script_dir = os.path.dirname(os.path.abspath(__file__))

    if args.bat:
        if args.http or args.https:
            protocol = 'https' if args.https else 'http'
            content = generate_bat_quick(protocol)
            output_file = os.path.join(script_dir, f'start-{protocol}.bat')
            print(f"正在生成快速启动脚本: {output_file}")
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"已成功生成: {output_file}")
        else:
            content = generate_bat_selective()
            output_file = os.path.join(script_dir, 'start.bat')
            print(f"正在生成选择性脚本: {output_file}")
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"已成功生成: {output_file}")

    elif args.sh:
        if args.http or args.https:
            protocol = 'https' if args.https else 'http'
            content = generate_sh_quick(protocol)
            output_file = os.path.join(script_dir, f'start-{protocol}.sh')
            print(f"正在生成快速启动脚本: {output_file}")
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"已成功生成: {output_file}")
            os.chmod(output_file, 0o755)
            print(f"已设置执行权限: {output_file}")
        else:
            content = generate_sh_selective()
            output_file = os.path.join(script_dir, 'start.sh')
            print(f"正在生成选择性脚本: {output_file}")
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"已成功生成: {output_file}")
            os.chmod(output_file, 0o755)
            print(f"已设置执行权限: {output_file}")

    else:
        script_name = os.path.basename(sys.argv[0]) if len(sys.argv[0]) > 1 else "launcher.py"
        print()
        print("错误: 缺少文件格式参数")
        print()
        print("请使用 --bat 或 --sh 指定文件格式")
        print()
        print("示例:")
        print(f"  python {script_name} --bat --http")
        print(f"  python {script_name} --sh --https")
        print(f"  python {script_name} --bat")
        print()
        print("=" * 60)
        print()

if __name__ == '__main__':
    main()
