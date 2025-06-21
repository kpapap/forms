/**
 * Sample data setup script for testing workflow functionality
 * Run this with: node scripts/setup-sample-data.js
 */

const baseUrl = 'http://localhost:3000';
const tenantId = '1'; // Using consistent tenant ID with the forms page

async function createSampleForm(name, fields) {
  const formData = {
    tenantId,
    userId: 'user-1',
    name,
    content: fields,
  };

  const response = await fetch(`${baseUrl}/api/forms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create form: ${response.statusText}`);
  }

  return response.json();
}

async function createSampleWorkflow(name, description, formTasks) {
  const workflowData = {
    tenantId,
    name,
    description,
    status: 'active',
    formTasks,
  };

  const response = await fetch(`${baseUrl}/api/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflowData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create workflow: ${response.statusText}`);
  }

  return response.json();
}

async function setupSampleData() {
  try {
    console.log('Creating sample forms...');

    // Create Employee Onboarding Form
    const personalInfoForm = await createSampleForm('Personal Information', [
      { id: 'firstName', label: 'First Name', type: 'text' },
      { id: 'lastName', label: 'Last Name', type: 'text' },
      { id: 'email', label: 'Email Address', type: 'email' },
      { id: 'phone', label: 'Phone Number', type: 'tel' },
    ]);

    // Create HR Review Form
    const hrReviewForm = await createSampleForm('HR Review', [
      { id: 'position', label: 'Position', type: 'text' },
      { id: 'department', label: 'Department', type: 'text' },
      { id: 'startDate', label: 'Start Date', type: 'date' },
      { id: 'hrNotes', label: 'HR Notes', type: 'text' },
    ]);

    // Create IT Setup Form
    const itSetupForm = await createSampleForm('IT Setup Request', [
      { id: 'computerType', label: 'Computer Type', type: 'text' },
      { id: 'software', label: 'Required Software', type: 'text' },
      { id: 'accessLevel', label: 'System Access Level', type: 'text' },
      { id: 'itNotes', label: 'Additional IT Notes', type: 'text' },
    ]);

    console.log('Forms created successfully!');
    console.log('- Personal Info Form:', personalInfoForm.id);
    console.log('- HR Review Form:', hrReviewForm.id);
    console.log('- IT Setup Form:', itSetupForm.id);

    // Create Employee Onboarding Workflow
    console.log('\\nCreating Employee Onboarding workflow...');

    const onboardingWorkflow = await createSampleWorkflow(
      'Employee Onboarding Process',
      'Complete workflow for onboarding new employees',
      [
        {
          formId: personalInfoForm.id,
          taskId: 'personal-info-task',
          taskName: 'Collect Personal Information',
          sequence: 0,
          isRequired: true,
        },
        {
          formId: hrReviewForm.id,
          taskId: 'hr-review-task',
          taskName: 'HR Review and Approval',
          sequence: 1,
          isRequired: true,
        },
        {
          formId: itSetupForm.id,
          taskId: 'it-setup-task',
          taskName: 'IT Setup Request',
          sequence: 2,
          isRequired: true,
        },
      ]
    );

    console.log('Workflow created successfully!');
    console.log('- Workflow ID:', onboardingWorkflow.id);
    console.log('- Workflow Name:', onboardingWorkflow.name);

    console.log('\\n🎉 Sample data setup completed!');
    console.log('\\nYou can now:');
    console.log('1. Visit http://localhost:3000/workflows to see the workflow');
    console.log('2. Start the Employee Onboarding workflow');
    console.log('3. Test the complete workflow process');
  } catch (error) {
    console.error('Error setting up sample data:', error);
    process.exit(1);
  }
}

// Run the setup
setupSampleData();
