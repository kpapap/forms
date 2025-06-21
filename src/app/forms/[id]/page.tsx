import FormViewer, {
  type Form,
  type FormFieldData,
} from '@/app/components/FormViewer';
import { db } from '@/drizzle/db';
import { forms } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

async function getForm(id: string) {
  const form = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
  return form[0];
}

export default async function FormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const formFromDb = await getForm(id);

  if (!formFromDb) {
    return <div>Form not found</div>;
  }

  // Ensure content is an array and has the right structure
  const content = Array.isArray(formFromDb.content)
    ? (formFromDb.content as FormFieldData[])
    : [];

  const form: Form = {
    ...formFromDb,
    content,
  };

  return (
    <div className="container mx-auto p-4">
      <Link
        href={`/forms/${form.id}/submissions`}
        className="text-blue-500 hover:underline"
      >
        View Submissions
      </Link>
      <FormViewer form={form} />
    </div>
  );
}
