import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import {
  workflowInstances,
  workflows,
  workflowFormTasks,
} from '@/drizzle/schema';
import { eq, and, SQL } from 'drizzle-orm';

// Get all workflow instances for a tenant
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId');
    const workflowId = url.searchParams.get('workflowId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    let whereConditions: SQL<unknown> = eq(
      workflowInstances.tenantId,
      tenantId
    );

    if (workflowId) {
      whereConditions = and(
        eq(workflowInstances.tenantId, tenantId),
        eq(workflowInstances.workflowId, workflowId)
      )!;
    }

    const instances = await db
      .select({
        instance: workflowInstances,
        workflow: {
          id: workflows.id,
          name: workflows.name,
          description: workflows.description,
        },
      })
      .from(workflowInstances)
      .leftJoin(workflows, eq(workflowInstances.workflowId, workflows.id))
      .where(whereConditions);

    return NextResponse.json(instances);
  } catch (error) {
    console.error('Error fetching workflow instances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow instances' },
      { status: 500 }
    );
  }
}
