import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Role from '../models/Role.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, firstName, lastName, email, password, companyName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Email and password are required' } });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: { message: 'Email already registered' } });
    }

    // Determine first/last name
    let fName = firstName;
    let lName = lastName;
    if (!fName && name) {
      const parts = name.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ') || 'User';
    }
    fName = fName || 'New';
    lName = lName || 'User';

    // Find default organization or create one
    let org = await Organization.findOne();
    if (!org) {
      org = await Organization.create({ name: companyName || 'Mini-ERP Industrial Solutions' });
    }

    // Find default role or create one
    let defaultRole = await Role.findOne({ organizationId: org._id, name: 'USER' });
    if (!defaultRole) {
      defaultRole = await Role.create({
        organizationId: org._id,
        name: 'USER',
        permissions: ['READ_PRODUCTS', 'READ_ORDERS', 'CREATE_ORDERS'],
        isSystem: false
      });
    }

    const user = await User.create({
      organizationId: org._id,
      firstName: fName,
      lastName: lName,
      email: cleanEmail,
      password,
      role: defaultRole._id,
      status: 'ACTIVE'
    });

    const populatedUser = await User.findById(user._id).populate('role');
    const token = generateToken(user._id);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: populatedUser?.role?.name || 'USER',
        organizationId: user.organizationId,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const registerDemo = register;

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Email and password are required' } });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password').populate('role');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: { message: 'Invalid email or password' } });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, error: { message: 'Account is inactive' } });
    }

    const token = generateToken(user._id);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: user.role?.name || 'USER',
        organizationId: user.organizationId,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ success: true, data: {} });
};

export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};
