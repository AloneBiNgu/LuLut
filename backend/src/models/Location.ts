import mongoose, { Document, Schema } from 'mongoose';

export enum LocationType {
  SAFE_ZONE = 'SAFE_ZONE',
  EVACUATION_CENTER = 'EVACUATION_CENTER',
  HAZARD = 'HAZARD',
  FLOODED_AREA = 'FLOODED_AREA',
  RESOURCE_POINT = 'RESOURCE_POINT',
  USER_LOCATION = 'USER_LOCATION'
}

export enum LocationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FULL = 'FULL',
  CLOSED = 'CLOSED'
}

export interface ILocation extends Document {
  latitude: number;
  longitude: number;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  street?: string;
  locationType: LocationType;
  description?: string;
  reporterName?: string;
  status: LocationStatus;
  capacity?: number;
  currentCount?: number;
  photoUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema: Schema = new Schema({
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },
  address: { type: String },
  province: { type: String },
  district: { type: String },
  ward: { type: String },
  street: { type: String },
  locationType: { type: String, enum: Object.values(LocationType), required: true, default: LocationType.USER_LOCATION },
  description: { type: String },
  reporterName: { type: String },
  status: { type: String, enum: Object.values(LocationStatus), default: LocationStatus.ACTIVE },
  capacity: { type: Number },
  currentCount: { type: Number },
  photoUrls: [{ type: String }],
}, { 
  timestamps: true 
});

LocationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export default mongoose.model<ILocation>('Location', LocationSchema);
