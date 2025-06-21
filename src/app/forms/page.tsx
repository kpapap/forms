import { db } from '@/drizzle/db';
import { forms } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import FormCard from '@/app/components/FormCard';

async function getForms(tenantId: string) {
  const allForms = await db
    .select()
    .from(forms)
    .where(eq(forms.tenantId, tenantId));
  return allForms;
}

export default async function FormsPage() {
  // Hardcoding tenantId for now
  const allForms = await getForms('1');

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forms</h1>
        <div className="flex gap-4">
          <Link
            href="/workflows"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Workflows
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Form
          </Link>
        </div>
      </div>

      {allForms.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            No forms found. Create your first form!
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Form
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allForms.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      )}
    </div>
  );
}
