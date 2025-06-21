import { db } from '../src/drizzle/db';
import { forms, workflows, workflowFormTasks } from '../src/drizzle/schema';

async function checkDatabaseState() {
  try {
    console.log('=== FORMS ===');
    const allForms = await db.select().from(forms);
    console.log(`Total forms: ${allForms.length}`);
    allForms.forEach((form) => {
      console.log(`  Form ID: ${form.id}, Name: ${form.name}`);
    });

    console.log('\n=== WORKFLOWS ===');
    const allWorkflows = await db.select().from(workflows);
    console.log(`Total workflows: ${allWorkflows.length}`);
    allWorkflows.forEach((workflow) => {
      console.log(`  Workflow ID: ${workflow.id}, Name: ${workflow.name}`);
    });

    console.log('\n=== WORKFLOW TASKS ===');
    const allTasks = await db.select().from(workflowFormTasks);
    console.log(`Total tasks: ${allTasks.length}`);
    allTasks.forEach((task) => {
      console.log(
        `  Task ID: ${task.id}, Workflow: ${task.workflowId}, Form: ${task.formId}, Name: ${task.taskName}`
      );
    });

    // Check for orphaned tasks
    console.log('\n=== CHECKING FOR ORPHANED TASKS ===');
    const formIds = new Set(allForms.map((f) => f.id));
    const orphanedTasks = allTasks.filter((task) => !formIds.has(task.formId));

    if (orphanedTasks.length > 0) {
      console.log(`Found ${orphanedTasks.length} orphaned tasks:`);
      orphanedTasks.forEach((task) => {
        console.log(
          `  Task "${task.taskName}" (ID: ${task.id}) references non-existent form ID: ${task.formId}`
        );
      });
    } else {
      console.log('No orphaned tasks found.');
    }
  } catch (error) {
    console.error('Error checking database state:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabaseState();
