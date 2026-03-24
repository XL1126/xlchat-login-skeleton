@echo off
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
