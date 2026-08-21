import { DashboardService } from '../services/dashboard.service.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    const data = await DashboardService.getMetrics(req.organizationId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
