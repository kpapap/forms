/**
 * Cleanup script to remove duplicate workflows and forms
 * and ensure consistent data
 */

const baseUrl = 'http://localhost:3000';
const tenantId = 'default';

async function cleanupData() {
  try {
    console.log('🧹 Starting data cleanup...\n');

    // Get current workflows
    const workflowsResponse = await fetch(
      `${baseUrl}/api/workflows?tenantId=${tenantId}`
    );
    const workflows = await workflowsResponse.json();

    console.log(`Found ${workflows.length} workflows`);

    // Keep only the latest (active) Employee Onboarding workflow
    const onboardingWorkflows = workflows.filter(
      (w) => w.name === 'Employee Onboarding Process'
    );
    const latestWorkflow =
      onboardingWorkflows.find((w) => w.status === 'active') ||
      onboardingWorkflows[0];

    if (latestWorkflow) {
      console.log(`Keeping workflow: ${latestWorkflow.id}`);

      // Delete other duplicate workflows
      for (const workflow of onboardingWorkflows) {
        if (workflow.id !== latestWorkflow.id) {
          console.log(`Deleting duplicate workflow: ${workflow.id}`);
          await fetch(
            `${baseUrl}/api/workflows/${workflow.id}?tenantId=${tenantId}`,
            {
              method: 'DELETE',
            }
          );
        }
      }
    }

    // Get current forms
    const formsResponse = await fetch(
      `${baseUrl}/api/forms?tenantId=${tenantId}`
    );
    const forms = await formsResponse.json();

    console.log(`\nFound ${forms.length} forms`);

    // Group forms by name and keep only the latest of each
    const formGroups = forms.reduce((groups, form) => {
      if (!groups[form.name]) {
        groups[form.name] = [];
      }
      groups[form.name].push(form);
      return groups;
    }, {});

    const formsToKeep = [];
    const formsToDelete = [];

    for (const [formName, formList] of Object.entries(formGroups)) {
      // Sort by creation date and keep the most recent
      formList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      formsToKeep.push(formList[0]);

      // Mark others for deletion
      for (let i = 1; i < formList.length; i++) {
        formsToDelete.push(formList[i]);
      }
    }

    console.log(
      `Keeping ${formsToKeep.length} forms, deleting ${formsToDelete.length} duplicates`
    );

    // Delete duplicate forms
    for (const form of formsToDelete) {
      console.log(`Deleting duplicate form: ${form.name} (${form.id})`);
      await fetch(`${baseUrl}/api/forms/${form.id}?tenantId=${tenantId}`, {
        method: 'DELETE',
      });
    }

    console.log('\n✅ Cleanup completed!');
    console.log('\nRemaining data:');

    // Show final state
    const finalWorkflowsResponse = await fetch(
      `${baseUrl}/api/workflows?tenantId=${tenantId}`
    );
    const finalWorkflows = await finalWorkflowsResponse.json();

    const finalFormsResponse = await fetch(
      `${baseUrl}/api/forms?tenantId=${tenantId}`
    );
    const finalForms = await finalFormsResponse.json();

    console.log('\nWorkflows:');
    finalWorkflows.forEach((w) =>
      console.log(`- ${w.name} (${w.status}): ${w.id}`)
    );

    console.log('\nForms:');
    finalForms.forEach((f) => console.log(`- ${f.name}: ${f.id}`));

    // Check if we need to recreate the workflow with correct form IDs
    const activeWorkflow = finalWorkflows.find(
      (w) => w.name === 'Employee Onboarding Process'
    );
    if (activeWorkflow && finalForms.length >= 3) {
      const tasksResponse = await fetch(
        `${baseUrl}/api/workflows/${activeWorkflow.id}/tasks?tenantId=${tenantId}`
      );
      const tasks = await tasksResponse.json();

      console.log('\nWorkflow tasks:');
      tasks.forEach((t) => {
        const form = finalForms.find((f) => f.id === t.formId);
        console.log(
          `- ${t.taskName || t.taskId}: ${
            form ? '✅ ' + form.name : '❌ Form not found'
          }`
        );
      });
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

cleanupData();
