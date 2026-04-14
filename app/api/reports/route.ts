import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Report } from '@/models/Report';

export async function GET() {
  try {
    await connectDB();
    const reports = await Report.find({})
      .sort({ uploadedAt: -1 })
      .limit(20)
      .select('reportId filename fileType uploadedAt totalRecords riskDistribution mlPrediction ecgAnomalies')
      .lean();

    return NextResponse.json({ success: true, reports });
  } catch (err) {
    console.error('Reports fetch error:', err);
    // Return empty list if DB unavailable
    return NextResponse.json({ success: true, reports: [], warning: 'DB unavailable' });
  }
}
