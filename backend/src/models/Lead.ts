import mongoose, { Document, Schema, Model } from 'mongoose';
import { LeadStatus, LeadSource } from '../types';

export interface ILeadDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ILeadModel extends Model<ILeadDocument> {}

const leadSchema = new Schema<ILeadDocument, ILeadModel>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Lost'] as LeadStatus[],
      default: 'New',
    },
    source: {
      type: String,
      enum: ['Website', 'Instagram', 'Referral'] as LeadSource[],
      required: [true, 'Source is required'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Compound indexes for efficient filtering queries ──────────────────────────
leadSchema.index({ status: 1, source: 1 });
leadSchema.index({ name: 'text', email: 'text' }); // Text search index
leadSchema.index({ createdAt: -1 }); // Sorting by latest

export const Lead = mongoose.model<ILeadDocument, ILeadModel>('Lead', leadSchema);
