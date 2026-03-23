import mongoose, { Document, Schema } from 'mongoose';
import { getMaxScores } from '../utils/grading';

export interface IGrade extends Document {
  student: mongoose.Types.ObjectId;
  subject: string;
  term: 'first' | 'second' | 'third';
  session: string;          // e.g. "2025/2026"
  className: string;        // snapshot of class at time of recording
  periodicTest: number;
  exam: number;
  total: number;
  testMax: number;
  examMax: number;
  grade: string;
  remark: string;
  createdAt: Date;
  updatedAt: Date;
}

function letterGrade(total: number): { grade: string; remark: string } {
  if (total >= 75) return { grade: 'A',  remark: 'Excellent' };
  if (total >= 65) return { grade: 'B',  remark: 'Very Good' };
  if (total >= 55) return { grade: 'C',  remark: 'Good' };
  if (total >= 45) return { grade: 'D',  remark: 'Fair' };
  if (total >= 40) return { grade: 'E',  remark: 'Pass' };
  return             { grade: 'F',  remark: 'Fail' };
}

const GradeSchema = new Schema<IGrade>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    term: {
      type: String,
      enum: ['first', 'second', 'third'],
      required: [true, 'Term is required'],
    },
    session: {
      type: String,
      required: [true, 'Session is required'],
      trim: true,
    },
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    periodicTest: {
      type: Number,
      required: [true, 'Periodic test score is required'],
      min: [0, 'Score cannot be negative'],
    },
    exam: {
      type: Number,
      required: [true, 'Exam score is required'],
      min: [0, 'Score cannot be negative'],
    },
    // Computed fields — stored for fast retrieval
    total: { type: Number },
    testMax: { type: Number },
    examMax: { type: Number },
    grade: { type: String },
    remark: { type: String },
  },
  { timestamps: true }
);

// Validate scores and compute totals before saving
GradeSchema.pre('save', function (next) {
  const { testMax, examMax } = getMaxScores(this.className);

  if (this.periodicTest > testMax) {
    return next(
      new Error(
        `Periodic test score (${this.periodicTest}) exceeds maximum (${testMax}) for class ${this.className}`
      )
    );
  }
  if (this.exam > examMax) {
    return next(
      new Error(
        `Exam score (${this.exam}) exceeds maximum (${examMax}) for class ${this.className}`
      )
    );
  }

  this.testMax = testMax;
  this.examMax = examMax;
  this.total = this.periodicTest + this.exam;

  const { grade, remark } = letterGrade(this.total);
  this.grade = grade;
  this.remark = remark;

  next();
});

export const Grade = mongoose.model<IGrade>('Grade', GradeSchema);
