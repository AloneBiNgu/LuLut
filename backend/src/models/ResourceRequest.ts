import mongoose, { Document, Schema } from 'mongoose';
import { ResourceCategory } from './Resource';

export enum UrgencyLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RequestStatus {
  OPEN = 'OPEN',
  MATCHED = 'MATCHED',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED'
}

export interface IResourceRequest extends Document {
  contactName: string;
  contactPhone: string;
  resource?: mongoose.Types.ObjectId;
  category: ResourceCategory;
  description: string;
  quantity: number;
  urgency: UrgencyLevel;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceRequestSchema: Schema = new Schema({
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  resource: { type: Schema.Types.ObjectId, ref: 'Resource' },
  category: { type: String, enum: Object.values(ResourceCategory), required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  urgency: { type: String, enum: Object.values(UrgencyLevel), default: UrgencyLevel.NORMAL },
  status: { type: String, enum: Object.values(RequestStatus), default: RequestStatus.OPEN },
}, { 
  timestamps: true 
});

ResourceRequestSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export default mongoose.model<IResourceRequest>('ResourceRequest', ResourceRequestSchema);
