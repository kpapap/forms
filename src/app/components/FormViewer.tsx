'use client';

import React, { useState } from 'react';
import FormField from './FormField';

export interface FormFieldData {
  id: string;
  label: string;
  type: string;
}

export interface Form {
  id: string;
  name: string;
  content: FormFieldData[];
}

interface FormViewerProps {
  form: Form;
  onSubmit?: (formData: Record<string, any>) => Promise<void>;
  submitButtonText?: string;
  disabled?: boolean;
  tenantId?: string;
  showTitle?: boolean;
}

const FormViewer = ({
  form,
  onSubmit,
  submitButtonText = 'Submit',
  disabled = false,
  tenantId = '1',
  showTitle = true,
}: FormViewerProps) => {
  const [formData, setFormData] = useState({});

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form data being submitted:', formData);

    if (onSubmit) {
      // Use custom submit handler (for workflow tasks)
      try {
        await onSubmit(formData);
        setFormData({}); // Clear form after successful submission
      } catch (error) {
        console.error('Custom submission error:', error);
        // Error handling is done by the custom handler
      }
      return;
    }

    // Default submission handler (for regular forms)
    try {
      const response = await fetch(`/api/forms/${form.id}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId,
          data: formData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Submission saved:', result);
        alert('Form submitted successfully!');
        setFormData({}); // Clear form after successful submission
      } else {
        const errorData = await response.json();
        console.error('Submission error:', errorData);
        alert(`Failed to submit form: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Failed to submit form. Please check your connection.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {showTitle && <h1 className="text-2xl font-bold mb-4">{form.name}</h1>}
      {form.content.map((field) => (
        <div key={field.id} className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <input
            type={field.type}
            onChange={(e) => handleChange(field.id, e.target.value)}
            disabled={disabled}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={disabled}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {submitButtonText}
      </button>
    </form>
  );
};

export default FormViewer;
