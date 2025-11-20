import mongoose, { Document, Schema } from 'mongoose';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN'
}

export enum PersonStatus {
  MISSING = 'MISSING',
  FOUND = 'FOUND',
  DECEASED = 'DECEASED',
  NEED_HELP = 'NEED_HELP'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  UNVERIFIED = 'UNVERIFIED'
}

export interface IMissingPerson extends Document {
  reporterName: string;
  reporterPhone: string;
  fullName: string;
  age?: number;
  gender?: Gender;
  photoUrls: string[];
  description: string;
  lastKnownLocation: mongoose.Types.ObjectId;
  lastSeenDate: Date;
  contactInfo: string;
  status: PersonStatus;
  foundDate?: Date;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MissingPersonSchema: Schema = new Schema({
  reporterName: { type: String, required: false },
  reporterPhone: { type: String, required: false },
  fullName: { type: String, required: false },
  age: { type: Number },
  gender: { type: String, enum: Object.values(Gender) },
  photoUrls: [{ type: String }],
  description: { type: String, required: false },
  lastKnownLocation: { type: Schema.Types.ObjectId, ref: 'Location', required: false },
  lastSeenDate: { type: Date, required: false },
  contactInfo: { type: String, required: false },
  status: { type: String, enum: Object.values(PersonStatus), default: PersonStatus.MISSING },
  foundDate: { type: Date },
  verificationStatus: { type: String, enum: Object.values(VerificationStatus), default: VerificationStatus.PENDING },
}, { 
  timestamps: true 
});

MissingPersonSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export default mongoose.model<IMissingPerson>('MissingPerson', MissingPersonSchema);
