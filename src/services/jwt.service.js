import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // Strongly recommend configuring this in production.
  console.warn(
    'JWT_SECRET is not set. Configure a strong secret in your .env for secure token signing.',
  );
}

export function buildJwtPayload(user) {
  if (!user) return {};
  return {
    sub: user.uuid,
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    image: user.image,
  };
}

export function createAccessToken(user) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(buildJwtPayload(user), JWT_SECRET, {
    expiresIn: '15m',
  });
}

export function createRefreshToken(user) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(buildJwtPayload(user), JWT_SECRET, {
    expiresIn: '30d',
  });
}

export function verifyToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, JWT_SECRET);
}


