import { db } from '@/drizzle/db';
import { formSubmissions, forms } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

async function getFormWithSubmissions(formId: string) {
  // Get the form details
  const form = await db
    .select()
    .from(forms)
    .where(eq(forms.id, formId))
    .limit(1);

  // Get the submissions
  const submissions = await db
    .select()
    .from(formSubmissions)
    .where(eq(formSubmissions.formId, formId));

  return {
    form: form[0],
    submissions,
  };
}

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { form, submissions } = await getFormWithSubmissions(id);

  if (!form) {
    return <div>Form not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Submissions for: {form.name}</h1>
          <p className="text-gray-600">
            Total submissions: {submissions.length}
          </p>
        </div>
        <Link
          href={`/forms/${form.id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Form
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            No submissions yet for this form.
          </p>
          <Link
            href={`/forms/${form.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Form
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Submission #</th>
                <th className="py-2 px-4 border-b">Submitted Data</th>
                <th className="py-2 px-4 border-b">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => (
                <tr key={submission.id}>
                  <td className="py-2 px-4 border-b text-center">
                    {index + 1}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <pre className="text-sm bg-gray-50 p-2 rounded">
                      {JSON.stringify(submission.data, null, 2)}
                    </pre>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {submission.createdAt
                      .toISOString()
                      .replace('T', ' ')
                      .substring(0, 19)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
