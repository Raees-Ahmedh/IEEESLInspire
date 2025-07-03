import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

// Log warning if using fallback secret
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set in environment variables. Using fallback secret for development.');
}

export const signToken = (payload: JwtPayload): string => {
  try {
    // Use a hardcoded valid expiration time to avoid type issues
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  } catch (error) {
    console.error('JWT signing error:', error);
    throw new Error('Failed to sign JWT token');
  }
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error: any) {
    console.error('JWT verification error:', error);
    
    // Handle different types of JWT errors
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet');
    } else {
      throw new Error('Invalid JWT token');
    }
  }
};

export { JWT_SECRET };