import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Role from '../models/Role.js';
import jwt from 'jsonwebtoken';
import { AuditService } from '../services/audit.service.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev', {
    expiresIn: '30d',
  });
};

const setAuthCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

/**
 * Register User / Demo
 */
export const register = async (req, res) => {
  try {
    const { name, firstName, lastName, email, employeeId, department, password, companyName } = req.body;

    if ((!email && !employeeId) || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email or Employee ID and password are required' }
      });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : `${employeeId.toLowerCase().trim()}@shivfurniture.in`;

    // Find default organization or create one
    let org = await Organization.findOne();
    if (!org) {
      org = await Organization.create({
        name: companyName || 'Shiv Furniture Works',
        domain: 'shivfurniture.in'
      });
    }

    const existingUser = await User.findOne({
      organizationId: org._id,
      $or: [
        { email: cleanEmail },
        ...(employeeId ? [{ employeeId: employeeId.toUpperCase().trim() }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'An account with this Email or Employee ID already exists' }
      });
    }

    // Determine name parts
    let fName = firstName;
    let lName = lastName;
    if (!fName && name) {
      const parts = name.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ') || 'User';
    }
    fName = fName || 'Employee';
    lName = lName || 'User';

    // Find default role
    let defaultRole = await Role.findOne({ organizationId: org._id, name: 'ADMIN' });
    if (!defaultRole) {
      defaultRole = await Role.findOne({ organizationId: org._id });
    }
    if (!defaultRole) {
      defaultRole = await Role.create({
        organizationId: org._id,
        name: 'ADMIN',
        permissions: ['*'],
        isSystem: true
      });
    }

    const user = await User.create({
      organizationId: org._id,
      firstName: fName,
      lastName: lName,
      email: cleanEmail,
      employeeId: employeeId ? employeeId.toUpperCase().trim() : undefined,
      department: department || 'General',
      password,
      role: defaultRole._id,
      status: 'ACTIVE'
    });

    const populatedUser = await User.findById(user._id).populate('role');
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    await AuditService.log({
      organizationId: org._id,
      action: 'LOGIN',
      module: 'Auth',
      referenceType: 'User',
      referenceId: user._id.toString(),
      user: populatedUser,
      description: `New user account created: ${fName} ${lName} (${user.email})`
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        employeeId: user.employeeId,
        department: user.department,
        role: populatedUser?.role?.name || 'USER',
        permissions: populatedUser?.role?.permissions || [],
        organizationId: user.organizationId,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const registerDemo = register;

/**
 * Login with either Employee ID OR Email + Password
 */
export const login = async (req, res) => {
  try {
    const { loginId, email, employeeId, password } = req.body;
    const identifier = (loginId || email || employeeId || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Employee ID / Email and password are required' }
      });
    }

    const isEmailFormat = identifier.includes('@');
    const query = isEmailFormat
      ? { email: identifier.toLowerCase() }
      : {
          $or: [
            { employeeId: identifier.toUpperCase() },
            { email: identifier.toLowerCase() }
          ]
        };

    const user = await User.findOne(query).select('+password').populate('role');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid Login ID / Email or password' }
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: { code: 'ACCOUNT_INACTIVE', message: 'Account is inactive. Please contact your administrator.' }
      });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    await AuditService.log({
      organizationId: user.organizationId,
      action: 'LOGIN',
      module: 'Auth',
      referenceType: 'User',
      referenceId: user._id.toString(),
      user,
      description: `User authenticated: ${user.firstName} ${user.lastName} (${user.employeeId || user.email})`
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        employeeId: user.employeeId,
        department: user.department,
        role: user.role?.name || 'USER',
        permissions: user.role?.permissions || [],
        organizationId: user.organizationId,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const logout = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ success: true, data: { message: 'Logged out successfully' } });
};

export const getMe = async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    data: {
      _id: user._id,
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      employeeId: user.employeeId,
      department: user.department,
      role: user.role?.name || 'USER',
      permissions: user.role?.permissions || [],
      organizationId: user.organizationId
    }
  });
};
