import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
  MISSING_PERSON_FOUND = 'MISSING_PERSON_FOUND',
  RESOURCE_AVAILABLE = 'RESOURCE_AVAILABLE',
  VOLUNTEER_MATCH = 'VOLUNTEER_MATCH',
  SAFETY_ALERT = 'SAFETY_ALERT',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE'
}

export interface INotification extends Document {
  recipientPhone: string; // Changed from user ObjectId to phone number
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipientPhone: { type: String, required: true },
  type: { type: String, enum: Object.values(NotificationType), required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed },
  read: { type: Boolean, default: false },
}, { 
  timestamps: true 
});

NotificationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
