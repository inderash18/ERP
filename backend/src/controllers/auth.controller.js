import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Role from '../models/Role.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev', {
    expiresIn: '30d',
  });
};

export const registerDemo = async (req, res) => {
  try {
    // For demo purposes, we automatically create an organization and an admin user
    const { firstName, lastName, email, password, companyName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: { message: 'User already exists' } });
    }

    const org = await Organization.create({ name: companyName || 'Demo Corp' });
    const adminRole = await Role.create({
      organizationId: org._id,
      name: 'ADMIN',
      permissions: ['*'], // Simplification for demo
      isSystem: true
    });

    const user = await User.create({
      organizationId: org._id,
      firstName,
      lastName,
      email,
      password,
      role: adminRole._id
    });

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
        email: user.email,
        organizationId: user.organizationId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
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
        email: user.email,
        organizationId: user.organizationId,
        token // Return token for clients not using cookies
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
