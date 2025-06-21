import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import {
  workflowInstances,
  workflowFormTasks,
  formSubmissions,
} from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Complete a workflow task by submitting a form
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const { id: instanceId, taskId } = params;
    const body = await request.json();
    const { formData, tenantId, userId } = body;

    if (!formData || !tenantId || !userId) {
      return NextResponse.json(
        { error: 'formData, tenantId, and userId are required' },
        { status: 400 }
      );
    }

    // Get workflow instance
    const instance = await db
      .select()
      .from(workflowInstances)
      .where(
        and(
          eq(workflowInstances.id, instanceId),
          eq(workflowInstances.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!instance.length) {
      return NextResponse.json(
        { error: 'Workflow instance not found' },
        { status: 404 }
      );
    }

    const workflowInstance = instance[0];

    // Verify this is the current task
    if (workflowInstance.currentTaskId !== taskId) {
      return NextResponse.json(
        { error: 'This is not the current active task' },
        { status: 400 }
      );
    }

    // Get the workflow task to find the associated form
    const workflowTask = await db
      .select()
      .from(workflowFormTasks)
      .where(
        and(
          eq(workflowFormTasks.workflowId, workflowInstance.workflowId),
          eq(workflowFormTasks.taskId, taskId)
        )
      )
      .limit(1);

    if (!workflowTask.length) {
      return NextResponse.json(
        { error: 'Workflow task not found' },
        { status: 404 }
      );
    }

    const task = workflowTask[0];

    // Create form submission
    const submissionId = crypto.randomUUID();
    const submission = await db
      .insert(formSubmissions)
      .values({
        id: submissionId,
        formId: task.formId,
        tenantId,
        data: formData,
        workflowInstanceId: instanceId,
        taskId,
      })
      .returning();

    // Get next task in sequence
    const nextSequence = (task.sequence || 0) + 1;
    const nextTask = await db
      .select()
      .from(workflowFormTasks)
      .where(
        and(
          eq(workflowFormTasks.workflowId, workflowInstance.workflowId),
          eq(workflowFormTasks.sequence, nextSequence)
        )
      )
      .limit(1);

    // Update workflow instance
    const updatedInstance = await db
      .update(workflowInstances)
      .set({
        currentTaskId: nextTask.length > 0 ? nextTask[0].taskId : null,
        status: nextTask.length > 0 ? 'running' : 'completed',
        completedAt: nextTask.length === 0 ? new Date() : undefined,
      })
      .where(eq(workflowInstances.id, instanceId))
      .returning();

    return NextResponse.json({
      submission: submission[0],
      workflowInstance: updatedInstance[0],
      nextTask: nextTask[0] || null,
      completed: nextTask.length === 0,
    });
  } catch (error) {
    console.error('Error completing workflow task:', error);
    return NextResponse.json(
      { error: 'Failed to complete workflow task' },
      { status: 500 }
    );
  }
}

// Get current task details for a workflow instance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const { id: instanceId, taskId } = params;
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    // Get workflow instance
    const instance = await db
      .select()
      .from(workflowInstances)
      .where(
        and(
          eq(workflowInstances.id, instanceId),
          eq(workflowInstances.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!instance.length) {
      return NextResponse.json(
        { error: 'Workflow instance not found' },
        { status: 404 }
      );
    }

    // Get task details
    const workflowTask = await db
      .select()
      .from(workflowFormTasks)
      .where(
        and(
          eq(workflowFormTasks.workflowId, instance[0].workflowId),
          eq(workflowFormTasks.taskId, taskId)
        )
      )
      .limit(1);

    if (!workflowTask.length) {
      return NextResponse.json(
        { error: 'Workflow task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      instance: instance[0],
      task: workflowTask[0],
    });
  } catch (error) {
    console.error('Error fetching workflow task details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow task details' },
      { status: 500 }
    );
  }
}
