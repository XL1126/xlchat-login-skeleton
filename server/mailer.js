const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 587,
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
    html: `<p>您的验证码是：<strong>${code}</strong></p><p>有效期5分钟，请尽快使用。</p>`,
  };

  return transporter.sendMail(mailOptions);
}

async function sendPasswordResetEmail(email, resetUrl) {
  const mailOptions = {
    from: `XL Chat <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'XL Chat 重置密码',
    text: `请点击以下链接重置密码：${resetUrl}\n链接有效期15分钟。`,
    html: `<p>请点击以下链接重置密码：</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>链接有效期15分钟。</p>`,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendVerificationCode,
  sendPasswordResetEmail,
};