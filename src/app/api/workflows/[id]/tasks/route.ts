import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { workflowFormTasks, workflows } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Get tasks for a workflow
export async function GET(
  request: NextRequest,
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

    // Verify workflow exists and belongs to tenant
    const workflow = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.tenantId, tenantId)))
      .limit(1);

    if (!workflow.length) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    const tasks = await db
      .select()
      .from(workflowFormTasks)
      .where(eq(workflowFormTasks.workflowId, id))
      .orderBy(workflowFormTasks.sequence);

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching workflow tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow tasks' },
      { status: 500 }
    );
  }
}

// Add a task to a workflow
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      formId,
      taskId,
      taskName,
      sequence = 0,
      isRequired = true,
      tenantId,
    } = body;

    if (!formId || !taskId || !tenantId) {
      return NextResponse.json(
        { error: 'formId, taskId, and tenantId are required' },
        { status: 400 }
      );
    }

    // Verify workflow exists and belongs to tenant
    const workflow = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.tenantId, tenantId)))
      .limit(1);

    if (!workflow.length) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Generate UUID for the new task
    const taskUuid = crypto.randomUUID();

    const newTask = await db
      .insert(workflowFormTasks)
      .values({
        id: taskUuid,
        workflowId: id,
        formId,
        taskId,
        taskName,
        sequence,
        isRequired,
      })
      .returning();

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('Error creating workflow task:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow task' },
      { status: 500 }
    );
  }
}
