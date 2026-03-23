import mongoose, { Document, Schema } from 'mongoose';

export type StudentClass =
  | 'jss1' | 'jss2' | 'jss3'
  | 'ss1'  | 'ss2'  | 'ss3'
  | string; // allow other class levels (primary, nursery, etc.)

export interface IStudent extends Document {
  name: string;
  admissionNumber: string;
  className: StudentClass;
  gender: 'male' | 'female';
  dateOfBirth?: Date;
  parentPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      trim: true,
    },
    className: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: Date,
    },
    parentPhone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
