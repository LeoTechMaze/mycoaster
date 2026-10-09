import jwt from 'jsonwebtoken';

export function generateToken(payload: { id?: string; email?: string; [key: string]: unknown } = {}) {
  const { id, email, ...rest } = payload;
  return jwt.sign(
    { sub: id || 'test-user-id', email: email || 'test@example.com', ...rest },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}
