# XL Chat - 登录系统

<p align="center">
  <img src="./client/public/screenshot.png" alt="XL Chat 截图" width="600">
</p>

<p align="center">
  <strong>⚠️ 重要提示：当前版本为半成品，仅包含登录注册功能，不包含聊天主功能。</strong>
</p>

## 📋 项目简介

XL Chat 是一个现代化的用户认证系统，采用前后端分离架构实现。目前已完成登录、注册、密码重置等核心功能，可作为完整聊天系统的前端入口。

**当前版本状态**：✅ 已完成 - 用户认证系统（半成品）<br>
**计划功能**：❌ 未完成 - AI 聊天主功能

## 🚀 快速开始

### 环境要求

- Node.js 16+
- Python 3.6+（用于启动脚本）
- npm 或 yarn

### 安装步骤
```
克隆项目（git clone https://github.com/XL1126/xlchat-login-skeleton.git）
 ↓
安装第三方库（python setup.py）
 ↓
复制变量文件（cp .env.example .env）
 ↓
创建脚本（python launcher.py）
 ↓
运行脚本（完成！）

如果要开启https协议的话需要另外配置证书文件到client/certs下
```
#### 1. 安装依赖

执行下面的py文件快速安装

```bash
# 执行一键安装脚本
python setup.py
```
或手动安装
```bash
# 安装根项目依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```
---
#### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并根据实际情况修改：

```bash
cp .env.example .env
```

> ⚠️ **重要提示**：`.env` 文件包含敏感信息（邮箱密码、JWT密钥等），**请保管好文件**。

编辑 `.env` 文件，配置以下变量：

```env
# 服务器配置
PORT=3000                          # 服务器端口
NODE_ENV=development               # 环境模式：development（开发）/ production（生产）

# JWT密钥
JWT_SECRET=your-secret-key-here    # 用于加密 Token 的密钥，部署时会自动生成

# 邮件配置
EMAIL_HOST=smtp.example.com        # SMTP 服务器地址，如 smtp.qq.com、smtp.gmail.com
EMAIL_PORT=587                     # SMTP 端口，QQ/网易邮箱用 587，SSL 用 465
EMAIL_USER=your-email@example.com  # 发件人邮箱
EMAIL_PASS=your-email-password      # 邮箱授权码（非登录密码）

# 前端URL（用于邮件中的链接，部署时必须修改为实际域名）
CLIENT_URL=http://localhost:5173   # 邮件里密码重置链接的域名
                                  # 自动处理末尾斜杠，避免双斜杠问题
                                  # 未配置时默认使用 http://localhost/
```
### `.env` 文件支持动态修改，无需重启服务器

---
#### 3. 启动服务

**方式一：使用启动脚本（推荐）**

根目录下的launcher.py文件本身是 **生成启动脚本** 的，并不是启动脚本

```bash
# 查看帮助
python launcher.py

# 生成选择性启动脚本（Windows）
python launcher.py --bat

# 生成快速启动脚本（Windows HTTPS）
python launcher.py --bat --https

# 生成选择性启动脚本（Linux/Mac）
python launcher.py --sh

# 生成快速启动脚本（Linux/Mac HTTPS）
python launcher.py --sh --https
```

**方式二：手动启动**

```bash
# 开发模式（同时运行前后端，HTTP）
npm run dev

# 开发模式（HTTPS）
npm run dev:https

# 仅运行后端
npm run server:dev

# 仅运行前端
npm run client:dev
```
手动启动还可以更复杂一点
```bash
# 开启后端服务
node server/index.js

# 开启前端服务
cd client
npm run dev
```
---
### 4. 配置 SSL 证书（如需使用 HTTPS）

如果你需要使用 HTTPS 模式，需要准备 SSL 证书并放置到 `client/certs/` 目录下：

```
client/certs/
├── fullchain.pem     # 证书链文件（必填）
└── privatekey.pem   # 私钥文件（必填）
```

> ⚠️ **注意**：证书文件名必须使用 `fullchain.pem` 和 `privatekey.pem`这；两个名称，配置文件中指定了使用在这个两个名称。

证书准备方法：
可以前往 [这个](https://github.com/XL1126/xlchat-login-skeleton/tree/main/client/certs) 目录查看如何配置证书

---
### 5. 访问应用

启动后访问以下地址：

- **[HTTP](http://localhost:5173) 模式**: http://localhost:5173
- **[HTTPS](https://localhost) 模式**: https://localhost
- **后端 API**: http://localhost:3000

## 📁 基本项目结构

```
XL-chat/
├── client/                 # 前端代码 (React 18 + Vite)
│   ├── certs/               # SSL 证书（HTTPS 使用）
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── contexts/       # React Context
│   │   ├── pages/         # 页面组件
│   │   ├── App.jsx        # 路由配置
│   │   └── App.css        # 全局样式
│   ├── public/            # 静态资源
│   └── vite.config.js     # Vite 配置
├── server/                # 后端代码 (Express + SQLite)
│   ├── index.js          # 服务器入口
│   ├── database.js       # 数据库配置
│   └── mailer.js        # 邮件发送模块
├── database/             # SQLite 数据库文件（项目会自动创建）
├── launcher.py          # 启动脚本生成器
├── setup.py             # 快速安装第三方库
├── package.json        # 根项目依赖
├── .env                # 环境变量（需手动创建）
├── .env.example        # 环境变量示例
└── README.md           # 项目说明
```

## ✨ 现有功能

- [x] **用户注册** - 邮箱验证码注册
- [x] **用户登录** - 密码登录 / 验证码登录
- [x] **忘记密码** - 邮箱验证重置密码
- [x] **密码重置** - 安全链接重置
- [x] **JWT 认证** - 无状态身份验证
- [x] **邮件发送** - Nodemailer 邮件服务
- [x] **数据持久化** - SQLite 数据库
- [x] **丝滑动画** - 270ms 进出场动画
- [x] **深色主题** - 现代 UI 设计
- [x] **防自动填充** - 防止浏览器自动填充

## 🛠️ 技术栈

### 后端

- **Express.js** - Web 框架
- **SQLite3** - 轻量级数据库
- **JWT** - JSON Web Token 认证
- **bcrypt** - 密码加密
- **Nodemailer** - 邮件发送

### 前端

- **React 18** - UI 框架
- **React Router 6** - 路由管理
- **Vite** - 构建工具
- **CSS3** - 样式设计

## 🔧 API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/sign_up` | 用户注册 |
| POST | `/api/sign_in` | 用户登录 |
| POST | `/api/send_verification_code` | 发送验证码 |
| POST | `/api/forgot_password` | 忘记密码 |
| POST | `/api/reset_password` | 重置密码 |
| POST | `/api/logout` | 用户登出 |

## 🔐 安全说明

1. **密码加密**：使用 bcrypt 进行密码哈希
2. **Token 认证**：JWT 无状态认证
3. **验证码**：一次性验证码，5分钟有效期
4. **邮件链接**：重置链接有时效性

## ⚙️ 服务器部署指南

1. 安装 Node.js 和 Python
2. 克隆项目到服务器
3. 安装依赖
4. 配置 `.env` 文件
5. 使用 PM2 或类似工具管理进程
6. 配置 Nginx 反向代理（可选）
7. 配置 SSL 证书（生产环境推荐使用 HTTPS）

### 开发人员

- **XL1126** - 项目创始人 [@XL1126](https://github.com/XL1126)
- **Trae AI** - 大部分代码由 Trae AI 生成

### 联系方式

- 邮箱：xiaoli201126@qq.com

## 📄 许可证

本项目采用 **MIT 许可证** 进行开源。

## ⚠️ 其他声明

当前版本为**半成品**，仅实现了用户登录注册功能。XL Chat 的核心聊天功能需要开发者自行根据需求进行后续开发。本项目仅提供认证系统的基础框架，使用者需自行承担开发完整功能的责任。

---
