const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 生成随机密钥
function generateSecretKey() {
  return crypto.randomBytes(32).toString('hex');
}

// 动态加载环境变量
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = envContent.split('\n');
    
    envVars.forEach(line => {
      const [key, value] = line.split('=').map(item => item.trim());
      if (key && !key.startsWith('#')) {
        process.env[key] = value;
      }
    });
  }
  
  // 检查并自动生成 JWT_SECRET
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key-here') {
    const newSecret = generateSecretKey();
    process.env.JWT_SECRET = newSecret;
    
    // 更新或创建 .env 文件
    if (fs.existsSync(envPath)) {
      // 替换现有的 JWT_SECRET
      if (envContent.includes('JWT_SECRET=')) {
        envContent = envContent.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${newSecret}`);
      } else {
        // 添加 JWT_SECRET
        envContent += `\nJWT_SECRET=${newSecret}\n`;
      }
    } else {
      // 创建新的 .env 文件
      envContent = `# 服务器配置\nPORT=3000\nNODE_ENV=development\n\n# JWT密钥\nJWT_SECRET=${newSecret}\n\n# 邮件配置\nEMAIL_HOST=smtp.qq.com\nEMAIL_PORT=587\nEMAIL_USER=your-email@example.com\nEMAIL_PASS=your-email-password\n\n# 前端URL\nCLIENT_URL=http://localhost:5173\n`;
    }
    
    // 写入 .env 文件
    fs.writeFileSync(envPath, envContent);
    console.log('已自动生成 JWT_SECRET 并更新到 .env 文件');
  }
}

// 初始加载
loadEnv();

// 监控 .env 文件变化
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  fs.watchFile(envPath, () => {
    console.log('检测到 .env 文件变化，重新加载环境变量...');
    loadEnv();
  });
}

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('./database');
const { sendVerificationCode, sendPasswordResetEmail } = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的认证令牌' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/send_verification_code', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: '请提供邮箱地址' });
  }

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  db.get(
    'SELECT * FROM verification_codes WHERE email = ? AND created_at > ? ORDER BY created_at DESC LIMIT 1',
    [email, fiveMinutesAgo],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: '数据库错误' });
      }

      if (row) {
        return res.status(429).json({ error: '请稍等5分钟后再试' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      db.run(
        'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)',
        [email, code, expiresAt],
        async (err) => {
          if (err) {
            return res.status(500).json({ error: '保存验证码失败' });
          }

          try {
            await sendVerificationCode(email, code);
            res.json({ success: true, message: '验证码已发送' });
          } catch (mailErr) {
            console.error('发送邮件失败:', mailErr);
            res.status(500).json({ error: '发送邮件失败' });
          }
        }
      );
    }
  );
});

app.post('/api/verify_code', (req, res) => {
  const { email, verification_code } = req.body;

  if (!email || !verification_code) {
    return res.status(400).json({ error: '请提供邮箱和验证码' });
  }

  const now = new Date().toISOString();
  db.get(
    'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > ? AND is_used = 0 ORDER BY created_at DESC LIMIT 1',
    [email, verification_code, now],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: '数据库错误' });
      }

      if (!row) {
        return res.status(400).json({ error: '验证码无效或已过期' });
      }

      db.run('UPDATE verification_codes SET is_used = 1 WHERE id = ?', [row.id]);
      res.json({ success: true, message: '验证码验证成功' });
    }
  );
});

app.post('/api/sign_up', async (req, res) => {
  const { username, email, password, confirm_password, verification_code } = req.body;

  if (!username || !email || !password || !confirm_password || !verification_code) {
    return res.status(400).json({ error: '请填写所有必填项' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: '两次输入的密码不一致' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度至少为6位' });
  }

  const now = new Date().toISOString();
  db.get(
    'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > ? AND is_used = 0 ORDER BY created_at DESC LIMIT 1',
    [email, verification_code, now],
    (codeErr, codeRow) => {
      if (codeErr) {
        return res.status(500).json({ error: '数据库错误' });
      }

      if (!codeRow) {
        return res.status(400).json({ error: '验证码无效或已过期' });
      }

      db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) {
          return res.status(500).json({ error: '数据库错误' });
        }

        if (row) {
          return res.status(400).json({ error: '该邮箱已被注册' });
        }

        try {
          const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

          db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function (err) {
              if (err) {
                return res.status(500).json({ error: '注册失败' });
              }

              db.run('UPDATE verification_codes SET is_used = 1 WHERE id = ?', [codeRow.id]);

              const token = jwt.sign({ userId: this.lastID, email, username }, JWT_SECRET, { expiresIn: '7d' });
              res.json({ success: true, token, user: { id: this.lastID, username, email } });
            }
          );
        } catch (hashErr) {
          res.status(500).json({ error: '密码加密失败' });
        }
      });
    }
  );
});

app.post('/api/sign_in', (req, res) => {
  const { email, password, verification_code, login_type } = req.body;

  if (!email || !login_type) {
    return res.status(400).json({ error: '请提供邮箱和登录类型' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }

    if (!user) {
      return res.status(400).json({ error: '用户不存在' });
    }

    if (login_type === 'password') {
      if (!password) {
        return res.status(400).json({ error: '请提供密码' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ error: '密码错误' });
      }
    } else if (login_type === 'code') {
      if (!verification_code) {
        return res.status(400).json({ error: '请提供验证码' });
      }

      const now = new Date().toISOString();
      const codeRow = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > ? AND is_used = 0 ORDER BY created_at DESC LIMIT 1',
          [email, verification_code, now],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!codeRow) {
        return res.status(400).json({ error: '验证码无效或已过期' });
      }

      db.run('UPDATE verification_codes SET is_used = 1 WHERE id = ?', [codeRow.id]);
    } else {
      return res.status(400).json({ error: '无效的登录类型' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

app.post('/api/forgot_password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: '请提供邮箱地址' });
  }

  db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }

    if (!user) {
      return res.json({ success: true, message: '如果邮箱存在，重置链接已发送' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    db.run(
      'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
      [email, token, expiresAt],
      async (err) => {
        if (err) {
          return res.status(500).json({ error: '生成重置链接失败' });
        }

        // 动态获取 CLIENT_URL 参数，如果未配置则使用 http://localhost/
        const clientUrl = (process.env.CLIENT_URL || 'http://localhost/').replace(/\/$/, '');
        const resetUrl = `${clientUrl}/reset_password?token=${token}`;

        try {
          await sendPasswordResetEmail(email, resetUrl);
          res.json({ success: true, message: '如果邮箱存在，重置链接已发送' });
        } catch (mailErr) {
          console.error('发送邮件失败:', mailErr);
          res.status(500).json({ error: '发送邮件失败' });
        }
      }
    );
  });
});

app.post('/api/reset_password', async (req, res) => {
  const { token, password, confirm_password } = req.body;

  if (!token || !password || !confirm_password) {
    return res.status(400).json({ error: '请填写所有必填项' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: '两次输入的密码不一致' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度至少为6位' });
  }

  const now = new Date().toISOString();
  db.get(
    'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > ? AND is_used = 0',
    [token, now],
    async (err, resetToken) => {
      if (err) {
        return res.status(500).json({ error: '数据库错误' });
      }

      if (!resetToken) {
        return res.status(400).json({ error: '重置链接无效或已过期' });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        db.run(
          'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
          [hashedPassword, resetToken.email],
          (err) => {
            if (err) {
              return res.status(500).json({ error: '重置密码失败' });
            }

            db.run('UPDATE password_reset_tokens SET is_used = 1 WHERE id = ?', [resetToken.id]);
            res.json({ success: true, message: '密码重置成功' });
          }
        );
      } catch (hashErr) {
        res.status(500).json({ error: '密码加密失败' });
      }
    }
  );
});

app.post('/api/logout', (req, res) => {
  res.json({ success: true, message: '已退出登录' });
});

app.get('/api/user', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ user });
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});