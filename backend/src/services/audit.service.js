import AuditLog from '../models/AuditLog.js';

export const AuditService = {
  async log(params) {
    try {
      const {
        organizationId,
        action,
        module,
        referenceType = 'N/A',
        referenceId = 'N/A',
        user,
        description,
        diff = null
      } = params;

      const logEntry = await AuditLog.create({
        organizationId,
        action,
        module,
        referenceType,
        referenceId,
        userId: user?._id || user?.id,
        userEmail: user?.email || 'System',
        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email : 'System',
        description,
        diff,
        timestamp: new Date()
      });

      return logEntry;
    } catch (err) {
      console.error('AuditLog error:', err.message);
      return null;
    }
  },

  async queryLogs(organizationId, filter = {}, limit = 50) {
    const query = { organizationId, ...filter };
    return AuditLog.find(query).sort({ timestamp: -1 }).limit(limit);
  }
};
