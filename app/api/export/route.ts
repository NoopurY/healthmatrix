import { NextRequest, NextResponse } from 'next/server';

/**
 * Export endpoint — returns JSON data for client-side PDF generation.
 * The client uses jsPDF + html2canvas to render the dashboard to PDF.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, data } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'Missing reportId' }, { status: 400 });
    }

    // Return report metadata for client-side rendering
    return NextResponse.json({
      success: true,
      reportId,
      exportedAt: new Date().toISOString(),
      data,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Export failed', detail: String(err) }, { status: 500 });
  }
}
