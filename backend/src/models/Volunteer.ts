import mongoose, { Document, Schema } from 'mongoose';

export enum AssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface IVolunteer extends Document {
  fullName: string;
  phoneNumber: string;
  skills: string[];
  availability: any; // Flexible JSON
  maxRadius: number;
  verified: boolean;
  hoursLogged: number;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  skills: [{ type: String }],
  availability: { type: Schema.Types.Mixed },
  maxRadius: { type: Number, required: true },
  verified: { type: Boolean, default: false },
  hoursLogged: { type: Number, default: 0 },
}, { 
  timestamps: true 
});

VolunteerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export default mongoose.model<IVolunteer>('Volunteer', VolunteerSchema);
