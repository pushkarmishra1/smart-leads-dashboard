import { FilterQuery } from 'mongoose';
import { Parser } from 'json2csv';
import { Lead, ILeadDocument } from '../models/Lead';
import { AppError } from '../utils/AppError';
import {
  LeadQueryParams,
  PaginatedResponse,
  ILead,
} from '../types';

interface CreateLeadData {
  name: string;
  email: string;
  status?: ILead['status'];
  source: ILead['source'];
  createdBy: string;
}

interface UpdateLeadData {
  name?: string;
  email?: string;
  status?: ILead['status'];
  source?: ILead['source'];
}

/**
 * Lead Service: All lead CRUD operations + filtering + export logic
 */
export class LeadService {
  /**
   * Returns a paginated, filtered list of leads
   */
  async getLeads(params: LeadQueryParams): Promise<PaginatedResponse<ILeadDocument>> {
    const {
      page = 1,
      limit = 10,
      status,
      source,
      search,
      sort = 'latest',
    } = params;

    // ─── Build dynamic filter query ─────────────────────────────────────────
    const filter: FilterQuery<ILeadDocument> = {};

    if (status) filter.status = status;
    if (source) filter.source = source;

    if (search && search.trim()) {
      // Regex search across name and email fields
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    // ─── Sort order ──────────────────────────────────────────────────────────
    const sortOrder = sort === 'latest' ? -1 : 1;

    // ─── Pagination math ─────────────────────────────────────────────────────
    const skip = (page - 1) * limit;

    // Run count and data queries in parallel for performance
    const [total, leads] = await Promise.all([
      Lead.countDocuments(filter),
      Lead.find(filter)
        .populate('createdBy', 'name email role')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: leads as unknown as ILeadDocument[],
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Fetches a single lead by ID
   */
  async getLeadById(id: string): Promise<ILeadDocument> {
    const lead = await Lead.findById(id).populate('createdBy', 'name email role');
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }
    return lead;
  }

  /**
   * Creates a new lead
   */
  async createLead(data: CreateLeadData): Promise<ILeadDocument> {
    const lead = await Lead.create(data);
    return lead.populate('createdBy', 'name email role');
  }

  /**
   * Updates a lead - only the owner or admin can update
   */
  async updateLead(
    id: string,
    data: UpdateLeadData,
    requesterId: string,
    requesterRole: string
  ): Promise<ILeadDocument> {
    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Ownership check: only admin or creator can update
    if (
      requesterRole !== 'admin' &&
      lead.createdBy.toString() !== requesterId
    ) {
      throw new AppError('You do not have permission to update this lead', 403);
    }

    const updated = await Lead.findByIdAndUpdate(id, data, {
      new: true,       // Return updated document
      runValidators: true,
    }).populate('createdBy', 'name email role');

    if (!updated) throw new AppError('Lead not found', 404);
    return updated;
  }

  /**
   * Deletes a lead - only admin or creator can delete
   */
  async deleteLead(
    id: string,
    requesterId: string,
    requesterRole: string
  ): Promise<void> {
    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Ownership check
    if (
      requesterRole !== 'admin' &&
      lead.createdBy.toString() !== requesterId
    ) {
      throw new AppError('You do not have permission to delete this lead', 403);
    }

    await Lead.findByIdAndDelete(id);
  }

  /**
   * Generates a CSV file buffer for all leads matching current filters
   */
  async exportLeadsCsv(params: Omit<LeadQueryParams, 'page' | 'limit'>): Promise<string> {
    const filter: FilterQuery<ILeadDocument> = {};

    if (params.status) filter.status = params.status;
    if (params.source) filter.source = params.source;
    if (params.search?.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const leads = await Lead.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: params.sort === 'oldest' ? 1 : -1 })
      .lean();

    // Flatten for CSV output
    const csvData = leads.map((lead) => {
      const creator = lead.createdBy as unknown as { name: string; email: string };
      return {
        Name: lead.name,
        Email: lead.email,
        Status: lead.status,
        Source: lead.source,
        'Created By': creator?.name || 'Unknown',
        'Created At': new Date(lead.createdAt).toLocaleDateString(),
      };
    });

    const parser = new Parser({
      fields: ['Name', 'Email', 'Status', 'Source', 'Created By', 'Created At'],
    });

    return parser.parse(csvData);
  }
}

export const leadService = new LeadService();
