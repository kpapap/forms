/**
 * Quick script to activate a workflow and start an instance for testing
 */

const baseUrl = 'http://localhost:3000';
const tenantId = '1';

async function activateWorkflow(workflowId) {
  const response = await fetch(`${baseUrl}/api/workflows/${workflowId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId,
      status: 'active',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to activate workflow: ${response.statusText}`);
  }

  return response.json();
}

async function startWorkflowInstance(workflowId) {
  const response = await fetch(`${baseUrl}/api/workflows/${workflowId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId,
      userId: 'user-1',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to start workflow: ${response.statusText}`);
  }

  return response.json();
}

async function testWorkflow() {
  try {
    // Get workflows to find the Employee Onboarding workflow
    const workflowsResponse = await fetch(
      `${baseUrl}/api/workflows?tenantId=${tenantId}`
    );
    const workflows = await workflowsResponse.json();

    const onboardingWorkflow = workflows.find(
      (w) => w.name === 'Employee Onboarding Process'
    );

    if (!onboardingWorkflow) {
      console.log(
        'Employee Onboarding workflow not found. Run setup-sample-data.js first.'
      );
      return;
    }

    console.log('Found workflow:', onboardingWorkflow.name);
    console.log('Current status:', onboardingWorkflow.status);

    // Activate workflow if it's not active
    if (onboardingWorkflow.status !== 'active') {
      console.log('Activating workflow...');
      await activateWorkflow(onboardingWorkflow.id);
      console.log('Workflow activated!');
    }

    // Start a workflow instance
    console.log('Starting workflow instance...');
    const instance = await startWorkflowInstance(onboardingWorkflow.id);
    console.log('Workflow instance started!');
    console.log('Instance ID:', instance.id);
    console.log('Current Task:', instance.currentTaskId);

    console.log('\\n🎉 Workflow instance ready for testing!');
    console.log(
      `\\nVisit: http://localhost:3000/workflows/instances/${instance.id}/tasks/${instance.currentTaskId}`
    );
    console.log(
      '\\nThis will take you to the first task: Personal Information form'
    );
  } catch (error) {
    console.error('Error testing workflow:', error);
  }
}

testWorkflow();
