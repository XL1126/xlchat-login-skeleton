# SSL 证书配置说明

## 需要的文件

使用 HTTPS 协议需要准备以下两个证书文件，放置到此目录：

```
client/certs/
├── fullchain.pem     # 证书链文件（必填）
└── privatekey.pem   # 私钥文件（必填）
```

## 使用 Let's Encrypt（免费）

### 1. 安装 Certbot

- **Windows**: 下载 Certbot 安装包
- **Linux/Mac**: `sudo apt-get install certbot` 或 `brew install certbot`

### 2. 申请证书

```bash
certbot certonly --manual --preferred-challenges dns -d yourdomain.com -d *.yourdomain.com
```

### 3. 复制证书

生成的证书通常在：

- **Linux**: `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- **Linux**: `/etc/letsencrypt/live/yourdomain.com/privkey.pem`


## 自签名证书（仅本地开发）

> ⚠️ 注意：自签名证书浏览器会显示安全警告，仅适合本地开发使用

### 1. 使用 OpenSSL 生成

```bash
# 生成私钥
openssl genrsa -out privatekey.pem 2048

# 生成证书
openssl req -new -x509 -key privatekey.pem -out fullchain.pem -days 365
```

### 2. 填写信息

Common Name 填写你的域名

## 配置完成

配置完成后，使用启动脚本选择 HTTPS 模式即可：

```bash
python launcher.py --bat --https
```

## 常见问题

### Q: 证书申请需要多久？

A: Let's Encrypt 即时颁发，基本马上就可以用

### Q: 证书有效期多久？

A: 免费证书通常90天，需要定期续期

### Q: 证书文件格式不对？

A: 确保是 PEM 格式（`.pem` 或 `.key`），不是 `.pfx` 或其他格式

### Q: 下载后证书验证失败？

A: 确保私钥和证书链匹配，可以使用以下命令验证：

```bash
# 验证私钥和证书匹配
openssl pkey -in privatekey.pem -pubout | openssl md5
openssl x509 -in fullchain.pem -pubkey | openssl md5

# 两个命令输出的MD5值应该相同
```

注意：该文档由AI生成
