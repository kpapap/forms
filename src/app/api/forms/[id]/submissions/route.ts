import { db } from '@/drizzle/db';
import { formSubmissions } from '@/drizzle/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const { tenantId, data } = body;
  const { id: formId } = await params;

  if (!tenantId || !data) {
    return NextResponse.json(
      { error: 'tenantId and data are required' },
      { status: 400 }
    );
  }

  const newSubmission = await db
    .insert(formSubmissions)
    .values({
      formId,
      tenantId,
      data,
    })
    .returning();

  return NextResponse.json(newSubmission[0]);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: formId } = await params;

  const submissions = await db
    .select()
    .from(formSubmissions)
    .where(eq(formSubmissions.formId, formId));

  return NextResponse.json(submissions);
}
