import { AuditService } from '../services/audit.service.js';

export const getAuditLogs = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const filter = {};
    if (req.query.module) filter.module = req.query.module;
    if (req.query.action) filter.action = req.query.action;

    const logs = await AuditService.queryLogs(req.organizationId, filter, limit);

    const formatted = logs.map(l => ({
      ...l.toObject(),
      id: l._id,
      user: l.userEmail || l.userName || 'System',
      date: l.timestamp ? new Date(l.timestamp).toISOString().split('T')[0] : ''
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
