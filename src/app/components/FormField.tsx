import React from 'react';

export interface FormFieldProps {
  id: string;
  type: string;
  label: string;
}

const FormField: React.FC<FormFieldProps> = ({ type, label }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  );
};

export default FormField;
