import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const hasPermission = (userPermissions = [], requiredPermission) => {
  if (!Array.isArray(userPermissions)) return false;
  if (userPermissions.includes('*') || userPermissions.includes('all')) return true;
  if (userPermissions.includes(requiredPermission)) return true;

  // Check domain wildcard (e.g. "sales.*" matches "sales.view")
  const parts = requiredPermission.split('.');
  if (parts.length > 1) {
    const domain = parts[0];
    if (userPermissions.includes(`${domain}.*`) || userPermissions.includes(`${domain}.all`)) {
      return true;
    }
  }

  return false;
};

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authorized to access this route' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');

    const user = await User.findById(decoded.id).populate('role');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User no longer exists' }
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: { code: 'INACTIVE_USER', message: 'User account is inactive' }
      });
    }

    req.user = user;
    req.organizationId = user.organizationId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token is invalid or expired' }
    });
  }
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'No role assigned to user' }
      });
    }

    const permissions = req.user.role.permissions || [];
    if (!hasPermission(permissions, permission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Missing required permission: ${permission}`
        }
      });
    }

    next();
  };
};
