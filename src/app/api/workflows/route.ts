import { db } from '@/drizzle/db';
import { workflows } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// GET all workflows for a tenant
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || '1'; // Default to tenant '1'

    console.log('API: Fetching workflows for tenant:', tenantId);

    const allWorkflows = await db
      .select()
      .from(workflows)
      .where(eq(workflows.tenantId, tenantId));

    console.log(`API: Found ${allWorkflows.length} workflows`);
    return NextResponse.json(allWorkflows);
  } catch (error) {
    console.error('API: Error fetching workflows:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST create new workflow
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('API: Received workflow data:', body);

    const { tenantId, name, description, bpmnXml, formTasks } = body;

    if (!tenantId || !name) {
      console.log('API: Missing required fields');
      return NextResponse.json(
        { error: 'tenantId and name are required' },
        { status: 400 }
      );
    }

    // Generate UUID for workflow
    const workflowId = randomUUID();
    console.log('API: Generated workflow ID:', workflowId);

    // Create workflow
    console.log('API: Creating workflow...');
    const newWorkflow = await db
      .insert(workflows)
      .values({
        id: workflowId,
        tenantId,
        name,
        description,
        bpmnXml,
        status: 'draft',
      })
      .returning();

    console.log('API: Workflow created successfully');

    // If formTasks are provided, create the form-task mappings
    if (formTasks && Array.isArray(formTasks)) {
      console.log(`API: Creating ${formTasks.length} form-task mappings`);

      const { workflowFormTasks } = await import('@/drizzle/schema');

      for (const task of formTasks) {
        await db.insert(workflowFormTasks).values({
          id: randomUUID(),
          workflowId: workflowId,
          formId: task.formId,
          taskId: task.taskId,
          taskName: task.taskName,
          sequence: task.sequence || 0,
          isRequired: task.isRequired !== false,
        });
      }
      console.log('API: Form-task mappings created');
    }

    return NextResponse.json(newWorkflow[0]);
  } catch (error) {
    console.error('API: Error creating workflow:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
