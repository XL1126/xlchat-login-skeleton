const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.qq.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationCode(email, code) {
  const mailOptions = {
    from: `XL Chat <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'XL Chat 验证码',
    text: `您的验证码是：${code}\n有效期5分钟，请尽快使用。`,
    html: `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>XL Chat 验证码</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #000;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }
          .header {
            background: linear-gradient(135deg, #6780FE, #4F63E7);
            padding: 14px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 40px;
            color: #f8faff;
          }
          .content p {
            margin: 0 0 20px 0;
            color: #bbb;
          }
          .code-box {
            background-color: rgb(27, 27, 28);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .code {
            font-size: 32px;
            font-weight: 700;
            color: #6780FE;
            letter-spacing: 4px;
          }
          .footer {
            background-color: rgb(27, 27, 28);
            padding: 20px 40px;
            text-align: center;
            color: #888;
            font-size: 14px;
          }
          .footer a {
            color: #6780FE;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>XL Chat</h1>
          </div>
          <div class="content">
            <p>您好，</p>
            <p>您正在尝试登录或注册 XL Chat 账号，我们收到了您的验证码请求。</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p>验证码有效期为 <strong>5分钟</strong>，请尽快使用。</p>
            <p>如果您没有发起此请求，请忽略此邮件。</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} XL Chat. 保留所有权利。</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

async function sendPasswordResetEmail(email, resetUrl) {
  const mailOptions = {
    from: `XL Chat <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'XL Chat 重置密码',
    text: `请点击以下链接重置密码：${resetUrl}\n链接有效期15分钟。`,
    html: `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>XL Chat 重置密码</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #000;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }
          .header {
            background: linear-gradient(135deg, #6780FE, #4F63E7);
            padding: 14px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 40px;
            color: #f8faff;
          }
          .content p {
            margin: 0 0 20px 0;
            color: #bbb;
          }
          .button {
            display: inline-block;
            background-color: #6780FE;
            color: white;
            padding: 14px 32px;
            border-radius: 28px;
            text-decoration: none;
            font-weight: 500;
            margin: 30px 0;
            transition: opacity 0.2s;
          }
          .button:hover {
            opacity: 0.9;
          }
          .link {
            color: #6780FE;
            text-decoration: none;
          }
          .link:hover {
            text-decoration: underline;
          }
          .footer {
            background-color: rgb(27, 27, 28);
            padding: 20px 40px;
            text-align: center;
            color: #888;
            font-size: 14px;
          }
          .footer a {
            color: #6780FE;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>XL Chat</h1>
          </div>
          <div class="content">
            <p>您好，</p>
            <p>我们收到了您重置密码的请求。请点击下面的按钮重置您的密码：</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">重置密码</a>
            </p>
            <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
            <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
            <p>链接有效期为 <strong>15分钟</strong>，请尽快操作。</p>
            <p>如果您没有发起此请求，请忽略此邮件。</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} XL Chat. 保留所有权利。</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendVerificationCode,
  sendPasswordResetEmail,
};
