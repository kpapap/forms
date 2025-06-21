import { db } from '@/drizzle/db';
import {
  workflows,
  workflowFormTasks,
  workflowInstances,
} from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// GET specific workflow with its form tasks
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API: Fetching workflow:', id);

    // Get workflow details
    const workflow = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, id))
      .limit(1);

    if (!workflow[0]) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Get associated form tasks
    const formTasks = await db
      .select()
      .from(workflowFormTasks)
      .where(eq(workflowFormTasks.workflowId, id));

    console.log(`API: Found workflow with ${formTasks.length} form tasks`);

    return NextResponse.json({
      ...workflow[0],
      formTasks,
    });
  } catch (error) {
    console.error('API: Error fetching workflow:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT update workflow
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('API: Updating workflow:', id, body);

    const { name, description, bpmnXml, status } = body;

    const updatedWorkflow = await db
      .update(workflows)
      .set({
        name,
        description,
        bpmnXml,
        status,
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, id))
      .returning();

    if (!updatedWorkflow[0]) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    console.log('API: Workflow updated successfully');
    return NextResponse.json(updatedWorkflow[0]);
  } catch (error) {
    console.error('API: Error updating workflow:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE workflow and all related data
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API: Deleting workflow:', id);

    // First delete all workflow instances
    const deletedInstances = await db
      .delete(workflowInstances)
      .where(eq(workflowInstances.workflowId, id))
      .returning();

    console.log(`API: Deleted ${deletedInstances.length} workflow instances`);

    // Delete workflow form tasks
    const deletedTasks = await db
      .delete(workflowFormTasks)
      .where(eq(workflowFormTasks.workflowId, id))
      .returning();

    console.log(`API: Deleted ${deletedTasks.length} form tasks`);

    // Finally delete the workflow
    const deletedWorkflow = await db
      .delete(workflows)
      .where(eq(workflows.id, id))
      .returning();

    if (!deletedWorkflow[0]) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    console.log('API: Workflow deleted successfully');
    return NextResponse.json({
      message: 'Workflow and all associated data deleted successfully',
      deletedWorkflow: deletedWorkflow[0],
      deletedInstancesCount: deletedInstances.length,
      deletedTasksCount: deletedTasks.length,
    });
  } catch (error) {
    console.error('API: Error deleting workflow:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
