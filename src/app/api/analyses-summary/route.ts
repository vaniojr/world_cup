import { NextResponse } from "next/server";
import { getAllAnalysesSummary, initAnalysesTable } from "@/lib/db";

export async function GET() {
  try {
    await initAnalysesTable();
    const summaries = await getAllAnalysesSummary();
    return NextResponse.json({ summaries });
  } catch (error) {
    console.error("analyses-summary error:", error);
    return NextResponse.json({ summaries: [] });
  }
}
