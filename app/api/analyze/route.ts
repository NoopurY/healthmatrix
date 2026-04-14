import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { analyzeCSV } from '@/lib/csvParser';
import { simulateECGFeatures, generateECGWaveform } from '@/lib/ecgProcessor';
import { batchPredict, analyzeECG } from '@/lib/mlClient';
import connectDB from '@/lib/mongodb';
import { Report } from '@/models/Report';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function POST(req: NextRequest) {
  try {
    let savedName: string | undefined;
    let originalName: string | undefined;
    let type: string | undefined;
    let size = 0;
    let csvContent: string | undefined;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      type = String(formData.get('type') || '').toLowerCase();
      originalName = String(formData.get('originalName') || file.name || 'upload');
      size = Number(formData.get('size') || file.size || 0);

      if (!type) {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        type = ext === 'csv' ? 'csv' : 'ecg';
      }

      if (type === 'csv') {
        csvContent = await file.text();
      }
    } else {
      const body = await req.json();
      savedName = body.savedName;
      originalName = body.originalName;
      type = body.type;
      size = Number(body.size || 0);
    }

    if (!type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reportId = uuidv4();

    if (type === 'csv') {
      // ── CSV Analysis ─────────────────────────────────────
      let content = csvContent;

      if (!content) {
        if (!savedName) {
          return NextResponse.json({ error: 'Missing uploaded CSV content' }, { status: 400 });
        }

        const filePath = join(UPLOAD_DIR, savedName);
        try {
          content = await readFile(filePath, 'utf-8');
        } catch {
          return NextResponse.json(
            { error: 'Uploaded file is no longer available. Please upload again.' },
            { status: 410 }
          );
        }
      }

      const analysis = analyzeCSV(content);

      if (analysis.totalCount === 0) {
        return NextResponse.json(
          { error: 'CSV parsing failed', details: analysis.errors },
          { status: 422 }
        );
      }

      // Batch ML prediction
      const mlInputs = analysis.records.slice(0, 100).map((r) => ({
        age: r.age,
        heart_rate: r.heart_rate,
        systolic_bp: r.systolic_bp,
        diastolic_bp: r.diastolic_bp,
        cholesterol: r.cholesterol,
        blood_sugar: r.blood_sugar,
        bmi: r.bmi,
        smoking: r.smoking,
        exercise_hours: r.exercise_hours,
      }));

      const batchResult = await batchPredict(mlInputs);

      // Save to MongoDB
      try {
        await connectDB();
        await Report.create({
          reportId,
          filename: originalName,
          fileType: 'csv',
          totalRecords: analysis.totalCount,
          stats: analysis.stats,
          correlationMatrix: analysis.correlationMatrix,
          riskDistribution: analysis.riskDistribution,
          bayesPrediction: analysis.bayesPrediction,
          mlPrediction: batchResult.predictions[0],
          timeSeries: analysis.timeSeries,
          regressionResults: {
            age_vs_heart_rate: {
              slope: analysis.regressionResults.age_vs_heart_rate.slope,
              intercept: analysis.regressionResults.age_vs_heart_rate.intercept,
              rSquared: analysis.regressionResults.age_vs_heart_rate.rSquared,
              predictions: analysis.regressionResults.age_vs_heart_rate.predictions.slice(0, 50),
            },
            age_vs_systolic_bp: {
              slope: analysis.regressionResults.age_vs_systolic_bp.slope,
              intercept: analysis.regressionResults.age_vs_systolic_bp.intercept,
              rSquared: analysis.regressionResults.age_vs_systolic_bp.rSquared,
            },
          },
        });
      } catch (dbErr) {
        console.warn('MongoDB save failed (not blocking):', dbErr);
      }

      return NextResponse.json({
        success: true,
        reportId,
        type: 'csv',
        totalRecords: analysis.totalCount,
        stats: analysis.stats,
        correlationKeys: analysis.correlationKeys,
        correlationMatrix: analysis.correlationMatrix,
        heartRateNormalCurve: analysis.heartRateNormalCurve,
        bpNormalCurve: analysis.bpNormalCurve,
        poissonDistribution: analysis.poissonDistribution,
        poissonLambda: analysis.poissonLambda,
        regressionResults: {
          age_vs_heart_rate: {
            slope: analysis.regressionResults.age_vs_heart_rate.slope,
            intercept: analysis.regressionResults.age_vs_heart_rate.intercept,
            rSquared: analysis.regressionResults.age_vs_heart_rate.rSquared,
            predictions: analysis.regressionResults.age_vs_heart_rate.predictions.slice(0, 50),
          },
        },
        regressionExtended: analysis.regressionExtended,
        spearmanResults: analysis.spearmanResults,
        bayesPrediction: analysis.bayesPrediction,
        insightMessages: analysis.insightMessages,
        timeSeries: analysis.timeSeries,
        riskDistribution: analysis.riskDistribution,
        mlAggregate: batchResult.aggregate,
        mlSamplePrediction: batchResult.predictions[0],
        errors: analysis.errors,
      });

    } else if (type === 'ecg') {
      // ── ECG Analysis ─────────────────────────────────────
      const metadata = {
        filename: originalName || 'ecg-upload',
        size,
        type,
        uploadedAt: new Date().toISOString(),
      };
      const ecgFeatures = simulateECGFeatures(metadata);
      const ecgWaveform = generateECGWaveform(ecgFeatures, 5);
      const ecgAnalysis = await analyzeECG(ecgFeatures);

      try {
        await connectDB();
        await Report.create({
          reportId,
          filename: originalName,
          fileType: 'ecg',
          ecgFeatures: ecgFeatures as unknown as Record<string, unknown>,
          ecgAnomalies: ecgAnalysis,
        });
      } catch (dbErr) {
        console.warn('MongoDB save failed (not blocking):', dbErr);
      }

      return NextResponse.json({
        success: true,
        reportId,
        type: 'ecg',
        ecgFeatures,
        ecgWaveform: ecgWaveform.slice(0, 1250), // 5s at 250Hz
        ecgAnalysis,
      });
    }

    return NextResponse.json({ error: 'Unknown file type' }, { status: 400 });
  } catch (err) {
    console.error('Analysis error:', err);
    return NextResponse.json({ error: 'Analysis failed', detail: String(err) }, { status: 500 });
  }
}
