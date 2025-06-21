import { db } from '@/drizzle/db';
import {
  workflowInstances,
  workflows,
  workflowFormTasks,
} from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// POST start new workflow instance
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params;
    const body = await request.json();
    console.log('API: Starting workflow instance for workflow:', workflowId);

    const { userId, tenantId, initialVariables } = body;

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: 'userId and tenantId are required' },
        { status: 400 }
      );
    }

    // Verify workflow exists and is active
    const workflow = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.status, 'active')))
      .limit(1);

    if (!workflow[0]) {
      return NextResponse.json(
        { error: 'Workflow not found or not active' },
        { status: 404 }
      );
    }

    // Get the first task in the workflow (lowest sequence number)
    const firstTask = await db
      .select()
      .from(workflowFormTasks)
      .where(eq(workflowFormTasks.workflowId, workflowId))
      .orderBy(workflowFormTasks.sequence)
      .limit(1);

    // Generate instance ID
    const instanceId = randomUUID();

    // Create workflow instance
    const newInstance = await db
      .insert(workflowInstances)
      .values({
        id: instanceId,
        workflowId,
        tenantId,
        userId,
        status: 'running',
        currentTaskId: firstTask[0]?.taskId || null,
        variables: initialVariables || {},
      })
      .returning();

    console.log('API: Workflow instance created:', instanceId);

    return NextResponse.json({
      ...newInstance[0],
      nextTask: firstTask[0] || null,
    });
  } catch (error) {
    console.error('API: Error starting workflow instance:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
