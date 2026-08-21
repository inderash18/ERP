import User from '../models/User.js';
import Role from '../models/Role.js';
import { AuditService } from '../services/audit.service.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ organizationId: req.organizationId })
      .populate('role')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = users.map(u => ({
      ...u,
      id: u._id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      role: u.role?.name || 'User',
      status: u.status === 'ACTIVE' ? 'Active' : 'Inactive'
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, firstName, lastName, email, employeeId, department, role, password, phone } = req.body;

    let fName = firstName;
    let lName = lastName;
    if (!fName && name) {
      const parts = name.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ') || 'User';
    }

    let roleDoc = null;
    if (role) {
      roleDoc = await Role.findOne({
        organizationId: req.organizationId,
        name: { $regex: new RegExp(`^${role}$`, 'i') }
      });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : `${(employeeId || 'user').toLowerCase().trim()}@shivfurniture.in`;

    const user = await User.create({
      organizationId: req.organizationId,
      firstName: fName || 'Employee',
      lastName: lName || 'User',
      email: cleanEmail,
      employeeId: employeeId ? employeeId.toUpperCase().trim() : undefined,
      department: department || 'General',
      phone: phone || '',
      password: password || 'password123',
      role: roleDoc?._id || undefined,
      status: 'ACTIVE'
    });

    await AuditService.log({
      organizationId: req.organizationId,
      action: 'LOGIN',
      module: 'Settings',
      referenceType: 'User',
      referenceId: user._id.toString(),
      user: req.user,
      description: `Added employee ${user.firstName} ${user.lastName} (${user.employeeId || user.email})`
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { status, department, role, phone } = req.body;
    const updates = {};
    if (status) updates.status = status.toUpperCase();
    if (department) updates.department = department;
    if (phone) updates.phone = phone;

    if (role) {
      const roleDoc = await Role.findOne({
        organizationId: req.organizationId,
        name: { $regex: new RegExp(`^${role}$`, 'i') }
      });
      if (roleDoc) updates.role = roleDoc._id;
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      updates,
      { new: true }
    ).populate('role');

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};
