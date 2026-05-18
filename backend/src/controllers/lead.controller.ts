import { Request, Response } from 'express';
import { leadService } from '../services/lead.service';
import { asyncHandler } from '../middleware/error.middleware';
import { sendSuccess } from '../utils/response';
import { LeadQueryParams } from '../types';

/**
 * Lead Controller: Handles HTTP layer for all lead operations.
 */

export const getLeads = asyncHandler(async (req: Request, res: Response) => {
  const params: LeadQueryParams = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    status: req.query.status as LeadQueryParams['status'],
    source: req.query.source as LeadQueryParams['source'],
    search: req.query.search as string,
    sort: (req.query.sort as LeadQueryParams['sort']) || 'latest',
  };

  const result = await leadService.getLeads(params);
  sendSuccess(res, result, 'Leads fetched');
});

export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.getLeadById(req.params.id);
  sendSuccess(res, lead, 'Lead fetched');
});

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.createLead({
    ...req.body,
    createdBy: req.user!.userId,
  });
  sendSuccess(res, lead, 'Lead created successfully', 201);
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.updateLead(
    req.params.id,
    req.body,
    req.user!.userId,
    req.user!.role
  );
  sendSuccess(res, lead, 'Lead updated successfully');
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  await leadService.deleteLead(
    req.params.id,
    req.user!.userId,
    req.user!.role
  );
  sendSuccess(res, null, 'Lead deleted successfully');
});

export const exportLeadsCsv = asyncHandler(async (req: Request, res: Response) => {
  const params = {
    status: req.query.status as LeadQueryParams['status'],
    source: req.query.source as LeadQueryParams['source'],
    search: req.query.search as string,
    sort: (req.query.sort as LeadQueryParams['sort']) || 'latest',
  };

  const csv = await leadService.exportLeadsCsv(params);

  // Set proper headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="leads-export.csv"');
  res.status(200).send(csv);
});
