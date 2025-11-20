import mongoose, { Document, Schema } from 'mongoose';

export enum ResourceCategory {
  FOOD_WATER = 'FOOD_WATER',
  MEDICAL_SUPPLIES = 'MEDICAL_SUPPLIES',
  CLOTHING_BEDDING = 'CLOTHING_BEDDING',
  SHELTER_SPACE = 'SHELTER_SPACE',
  TRANSPORTATION = 'TRANSPORTATION',
  COMMUNICATION = 'COMMUNICATION',
  TOOLS_EQUIPMENT = 'TOOLS_EQUIPMENT',
  HYGIENE = 'HYGIENE',
  PET_SUPPLIES = 'PET_SUPPLIES',
  BABY_CHILD_NEEDS = 'BABY_CHILD_NEEDS'
}

export enum ResourceStatus {
  AVAILABLE = 'AVAILABLE',
  PARTIALLY_CLAIMED = 'PARTIALLY_CLAIMED',
  FULLY_CLAIMED = 'FULLY_CLAIMED',
  EXPIRED = 'EXPIRED',
  REMOVED = 'REMOVED'
}

export interface IResource extends Document {
  title: string;
  description: string;
  category: ResourceCategory;
  quantity: number;
  quantityUnit: string;
  location: mongoose.Types.ObjectId;
  contactName: string;
  contactPhone: string;
  contactInfo: string; // Keeping this for general info
  photoUrls: string[];
  availableFrom: Date;
  availableUntil?: Date;
  status: ResourceStatus;
  verifiedOrg: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: Object.values(ResourceCategory), required: true },
  quantity: { type: Number, required: true },
  quantityUnit: { type: String, required: true },
  location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contactInfo: { type: String, required: true },
  photoUrls: [{ type: String }],
  availableFrom: { type: Date, default: Date.now },
  availableUntil: { type: Date },
  status: { type: String, enum: Object.values(ResourceStatus), default: ResourceStatus.AVAILABLE },
  verifiedOrg: { type: Boolean, default: false },
}, { 
  timestamps: true 
});

ResourceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export default mongoose.model<IResource>('Resource', ResourceSchema);
