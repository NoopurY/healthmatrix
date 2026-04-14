import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
  reportId: string;
  filename: string;
  fileType: 'csv' | 'ecg';
  uploadedAt: Date;
  totalRecords?: number;
  stats?: Record<string, unknown>;
  correlationMatrix?: number[][];
  riskDistribution?: { level: string; count: number; percentage: number }[];
  bayesPrediction?: Record<string, number>;
  mlPrediction?: {
    risk_level: string;
    risk_score: number;
    probability: Record<string, number>;
    feature_importance: Record<string, number>;
    model_used: string;
  };
  ecgFeatures?: Record<string, unknown>;
  ecgAnomalies?: {
    anomaly_detected: boolean;
    anomaly_type: string[];
    confidence: number;
    recommendations: string[];
  };
  timeSeries?: { index: number; heart_rate: number; systolic_bp: number; cholesterol: number }[];
  regressionResults?: Record<string, unknown>;
}

const ReportSchema: Schema<IReport> = new Schema(
  {
    reportId: { type: String, required: true, unique: true },
    filename: { type: String, required: true },
    fileType: { type: String, enum: ['csv', 'ecg'], required: true },
    uploadedAt: { type: Date, default: Date.now },
    totalRecords: Number,
    stats: Schema.Types.Mixed,
    correlationMatrix: [[Number]],
    riskDistribution: [
      { level: String, count: Number, percentage: Number },
    ],
    bayesPrediction: Schema.Types.Mixed,
    mlPrediction: Schema.Types.Mixed,
    ecgFeatures: Schema.Types.Mixed,
    ecgAnomalies: Schema.Types.Mixed,
    timeSeries: Schema.Types.Mixed,
    regressionResults: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const Report: Model<IReport> =
  mongoose.models['Report'] || mongoose.model<IReport>('Report', ReportSchema);
