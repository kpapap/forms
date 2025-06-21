'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormCardProps {
  form: {
    id: string;
    name: string;
    createdAt: Date;
  };
}

export default function FormCard({ form }: FormCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${form.name}"?\n\nThis will permanently delete the form and ALL its submissions. This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/forms/${form.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `Form deleted successfully! Removed ${result.deletedSubmissionsCount} submissions.`
        );
        router.refresh(); // Refresh the page to update the forms list
      } else {
        const errorData = await response.json();
        alert(`Failed to delete form: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form. Please check your connection.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{form.name}</h3>
      <p className="text-sm text-gray-500 mb-3">
        Created: {form.createdAt.toISOString().split('T')[0]}
      </p>
      <div className="flex gap-2 flex-wrap">
        <Link
          href={`/forms/${form.id}`}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          View Form
        </Link>
        <Link
          href={`/forms/${form.id}/submissions`}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
        >
          Submissions
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
