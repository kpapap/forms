import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { workflowInstances, workflows } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Get a specific workflow instance by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // This is the instanceId
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    // First fetch the instance
    const instance = await db
      .select()
      .from(workflowInstances)
      .where(
        and(
          eq(workflowInstances.id, id),
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

    // Then get the workflow details
    const workflow = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, instance[0].workflowId))
      .limit(1);

    // Combine the data
    const enrichedInstance = {
      ...instance[0],
      workflow: workflow.length ? workflow[0] : null,
    };

    return NextResponse.json(enrichedInstance);
  } catch (error) {
    console.error('Error fetching workflow instance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow instance' },
      { status: 500 }
    );
  }
}
