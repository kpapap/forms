const baseUrl = 'http://localhost:3000';
const tenantId = 'default';

async function checkAndFixWorkflows() {
  try {
    console.log('🔍 Checking workflow integrity...\n');

    // Get current workflows
    const workflowsResponse = await fetch(
      `${baseUrl}/api/workflows?tenantId=${tenantId}`
    );
    const workflows = await workflowsResponse.json();

    console.log('Current workflows:');
    workflows.forEach((w) => console.log(`- ${w.name} (${w.status}): ${w.id}`));

    // Get current forms
    const formsResponse = await fetch(
      `${baseUrl}/api/forms?tenantId=${tenantId}`
    );
    const forms = await formsResponse.json();
    const validFormIds = forms.map((f) => f.id);

    console.log('\nValid form IDs:');
    validFormIds.forEach((id) => console.log(`- ${id}`));

    // Check each workflow's tasks
    const workflowsToDelete = [];

    for (const workflow of workflows) {
      console.log(`\nChecking workflow ${workflow.id}:`);
      const tasksResponse = await fetch(
        `${baseUrl}/api/workflows/${workflow.id}/tasks?tenantId=${tenantId}`
      );
      const tasks = await tasksResponse.json();

      let hasInvalidForms = false;
      tasks.forEach((task) => {
        const isValid = validFormIds.includes(task.formId);
        console.log(
          `- Task ${task.taskId}: Form ${task.formId} ${isValid ? '✅' : '❌'}`
        );
        if (!isValid) hasInvalidForms = true;
      });

      if (hasInvalidForms) {
        console.log(
          `🗑️  Workflow ${workflow.id} has invalid form references - marking for deletion`
        );
        workflowsToDelete.push(workflow);
      } else {
        console.log(`✅ Workflow ${workflow.id} is valid`);
      }
    }

    // Delete workflows with invalid form references
    if (workflowsToDelete.length > 0) {
      console.log(
        `\nDeleting ${workflowsToDelete.length} workflows with invalid form references:`
      );

      for (const workflow of workflowsToDelete) {
        console.log(`Deleting workflow: ${workflow.id}`);
        const deleteResponse = await fetch(
          `${baseUrl}/api/workflows/${workflow.id}?tenantId=${tenantId}`,
          {
            method: 'DELETE',
          }
        );

        if (deleteResponse.ok) {
          console.log(`✅ Deleted workflow ${workflow.id}`);
        } else {
          console.log(`❌ Failed to delete workflow ${workflow.id}`);
        }
      }
    }

    // Show final state
    console.log('\n📊 Final workflow state:');
    const finalWorkflowsResponse = await fetch(
      `${baseUrl}/api/workflows?tenantId=${tenantId}`
    );
    const finalWorkflows = await finalWorkflowsResponse.json();

    if (finalWorkflows.length === 0) {
      console.log(
        'No workflows remaining. You may need to run setup-sample-data.js again.'
      );
    } else {
      finalWorkflows.forEach((w) => {
        console.log(`✅ ${w.name} (${w.status}): ${w.id}`);
        console.log(`   URL: http://localhost:3000/workflows/${w.id}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAndFixWorkflows();
