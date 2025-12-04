import { verifyToken } from '../services/jwt.service.js';

export default function adminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace(/^(Bearer|Token)\s+/i, '').trim();

  if (!token) {
    return res.status(401).json({ error: 'admin_token_required' });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded?.sub || !String(decoded.sub).startsWith('admin-')) {
      return res.status(401).json({ error: 'admin_token_invalid' });
    }

    req.admin = {
      id: decoded.id,
      email: decoded.name,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'admin_token_invalid' });
  }
}


