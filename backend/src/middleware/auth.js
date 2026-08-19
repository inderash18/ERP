import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized to access this route' } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
    
    const user = await User.findById(decoded.id).populate('role');
    
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User no longer exists' } });
    }

    req.user = user;
    req.organizationId = user.organizationId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token is invalid or expired' } });
  }
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'No role assigned' } });
    }
    
    if (!req.user.role.permissions.includes(permission)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: `Missing required permission: ${permission}` } });
    }
    
    next();
  };
};
