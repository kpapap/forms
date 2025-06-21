import { db } from '@/drizzle/db';
import { forms, formSubmissions } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    console.log('API: Fetching form with ID:', id, 'for tenant:', tenantId);

    const form = await db.select().from(forms).where(eq(forms.id, id)).limit(1);

    if (form.length === 0) {
      console.log('API: Form not found');
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Verify the form belongs to the requested tenant
    if (form[0].tenantId !== tenantId) {
      console.log('API: Form does not belong to tenant');
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    console.log('API: Form found successfully');
    return NextResponse.json(form[0]);
  } catch (error) {
    console.error('API: Error fetching form:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE form and associated submissions
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API: Deleting form with ID:', id);

    // First, delete all submissions for this form
    console.log('API: Deleting form submissions...');
    const deletedSubmissions = await db
      .delete(formSubmissions)
      .where(eq(formSubmissions.formId, id))
      .returning();

    console.log(`API: Deleted ${deletedSubmissions.length} submissions`);

    // Then, delete the form itself
    console.log('API: Deleting form...');
    const deletedForm = await db
      .delete(forms)
      .where(eq(forms.id, id))
      .returning();

    if (deletedForm.length === 0) {
      console.log('API: Form not found');
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    console.log('API: Form deleted successfully');
    return NextResponse.json({
      message: 'Form and all associated submissions deleted successfully',
      deletedForm: deletedForm[0],
      deletedSubmissionsCount: deletedSubmissions.length,
    });
  } catch (error) {
    console.error('API: Error deleting form:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
