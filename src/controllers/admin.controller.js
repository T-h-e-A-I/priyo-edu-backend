import { findAdminByEmail } from '../services/admin.service.js';
import { createAccessToken } from '../services/jwt.service.js';
import bcrypt from 'bcryptjs';

export async function adminLoginController(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'email_and_password_required' });
    }

    const admin = await findAdminByEmail(email);

    if (!admin) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    const ok = await bcrypt.compare(password, admin.password_hash);

    if (!ok) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    const token = createAccessToken({
      uuid: `admin-${admin.id}`,
      id: admin.id,
      name: admin.email,
    });

    return res.json({
      admin: {
        id: admin.id,
        email: admin.email,
      },
      token,
    });
  } catch (error) {
    console.error('Admin login failed', error);
    return res.status(500).json({ error: 'admin_login_failed' });
  }
}


