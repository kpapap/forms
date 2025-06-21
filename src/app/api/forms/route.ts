import { db } from '@/drizzle/db';
import { forms } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');

  if (!tenantId) {
    return NextResponse.json(
      { error: 'tenantId is required' },
      { status: 400 }
    );
  }

  const allForms = await db
    .select()
    .from(forms)
    .where(eq(forms.tenantId, tenantId));

  return NextResponse.json(allForms);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('API: Received form data:', body);

    const { tenantId, userId, name, content } = body;

    if (!tenantId || !userId || !name) {
      console.log('API: Missing required fields');
      return NextResponse.json(
        { error: 'tenantId, userId, and name are required' },
        { status: 400 }
      );
    }

    // Generate UUID manually
    const formId = randomUUID();
    console.log('API: Generated form ID:', formId);

    // Prepare the values to insert
    const valuesToInsert = {
      id: formId,
      tenantId,
      userId,
      name,
      content,
    };
    console.log('API: Values to insert:', valuesToInsert);

    console.log('API: Inserting form into database...');

    try {
      const newForm = await db.insert(forms).values(valuesToInsert).returning();

      console.log('API: Database insertion successful');
      console.log('API: Database returned array length:', newForm.length);
      console.log('API: Database returned:', newForm);

      if (newForm.length > 0) {
        console.log('API: First form object:', newForm[0]);
        console.log('API: Form ID from database:', newForm[0].id);
      }

      if (!newForm[0] || !newForm[0].id) {
        console.error('API: No ID in returned form!');
        return NextResponse.json(
          { error: 'Failed to create form with ID' },
          { status: 500 }
        );
      }

      console.log('API: Returning successful response');
      return NextResponse.json(newForm[0]);
    } catch (dbError) {
      console.error('API: Database insertion error:', dbError);
      return NextResponse.json(
        {
          error: 'Database insertion failed',
          details:
            dbError instanceof Error
              ? dbError.message
              : 'Unknown database error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API: Error creating form:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
