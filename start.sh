#!/bin/bash

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
