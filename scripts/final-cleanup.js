const baseUrl = 'http://localhost:3000';
const tenantId = 'default';

async function finalCleanup() {
  try {
    // Get remaining forms
    const formsResponse = await fetch(
      `${baseUrl}/api/forms?tenantId=${tenantId}`
    );
    const forms = await formsResponse.json();

    console.log(`Found ${forms.length} forms total`);

    // Group by name
    const groups = {};
    forms.forEach((form) => {
      if (!groups[form.name]) groups[form.name] = [];
      groups[form.name].push(form);
    });

    // Delete duplicates (keep first of each name)
    for (const [name, formList] of Object.entries(groups)) {
      if (formList.length > 1) {
        console.log(`Found ${formList.length} "${name}" forms, keeping first`);
        for (let i = 1; i < formList.length; i++) {
          console.log(`Deleting: ${formList[i].id}`);
          await fetch(
            `${baseUrl}/api/forms/${formList[i].id}?tenantId=${tenantId}`,
            {
              method: 'DELETE',
            }
          );
        }
      }
    }

    console.log('Final cleanup done!');

    // Show final result
    const finalFormsResponse = await fetch(
      `${baseUrl}/api/forms?tenantId=${tenantId}`
    );
    const finalForms = await finalFormsResponse.json();

    console.log('\nFinal forms:');
    finalForms.forEach((f) => console.log(`- ${f.name}: ${f.id}`));
  } catch (error) {
    console.error('Error:', error);
  }
}

finalCleanup();
