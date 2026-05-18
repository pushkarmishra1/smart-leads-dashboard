import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCsv,
} from '../controllers/lead.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  createLeadValidator,
  updateLeadValidator,
  getLeadsValidator,
} from '../validators/lead.validator';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// All lead routes require authentication
router.use(authenticate);

router.get('/', getLeadsValidator, validate, getLeads);
router.get('/export/csv', exportLeadsCsv); // CSV export (before :id route to avoid conflict)
router.get('/:id', getLeadById);
router.post('/', createLeadValidator, validate, createLead);
router.put('/:id', updateLeadValidator, validate, updateLead);
router.delete('/:id', deleteLead);

export default router;
