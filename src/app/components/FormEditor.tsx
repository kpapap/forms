'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const FormEditor = () => {
  const [jsonInput, setJsonInput] = useState('');

  const handleJsonImport = async () => {
    console.log('JSON Input:', jsonInput);

    if (!jsonInput.trim()) {
      alert('Please paste some JSON data first');
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonInput);
      console.log('Parsed JSON:', parsedJson);

      // Validate that the JSON has the expected structure
      if (!parsedJson.name) {
        alert('JSON must include a "name" field');
        return;
      }

      if (!Array.isArray(parsedJson.content)) {
        alert('JSON must include a "content" array');
        return;
      }

      if (parsedJson.content.length === 0) {
        alert('Content array cannot be empty');
        return;
      }

      // Validate each field in the content array
      const invalidFields = parsedJson.content.filter(
        (field: any, index: number) => {
          const isValid = field.id && field.type && field.label;
          if (!isValid) {
            console.log(`Invalid field at index ${index}:`, field);
          }
          return !isValid;
        }
      );

      if (invalidFields.length > 0) {
        alert(
          `Invalid content structure. ${invalidFields.length} field(s) missing required properties (id, type, label)`
        );
        return;
      }

      // If we get here, everything is valid - save the form directly
      console.log('Saving form with data:', {
        tenantId: '1',
        userId: '1',
        name: parsedJson.name,
        content: parsedJson.content,
      });

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: '1', // Hardcoded for now
          userId: '1', // Hardcoded for now
          name: parsedJson.name,
          content: parsedJson.content,
        }),
      });

      if (response.ok) {
        const responseText = await response.text();
        if (responseText && responseText.trim() !== '') {
          const savedForm = JSON.parse(responseText);
          if (savedForm && savedForm.id) {
            alert(
              `Form imported and saved successfully! Form ID: ${savedForm.id}`
            );
            setJsonInput(''); // Clear the input after successful import
          }
        }
      } else {
        alert(`Failed to save form: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('JSON Parse Error:', error);
      alert(
        `Invalid JSON format: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Import Form from JSON</h1>
        <div className="flex gap-4">
          <Link
            href="/workflows"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Workflows
          </Link>
          <Link
            href="/forms"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Forms
          </Link>
        </div>
      </div>

      {/* JSON Import Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          Paste JSON Form Structure
        </h2>
        <div className="mb-4">
          <label
            htmlFor="jsonInput"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            JSON structure (will be saved immediately upon import):
          </label>
          <textarea
            id="jsonInput"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={JSON.stringify(
              {
                name: 'Sample Contact Form',
                content: [
                  { id: 'name', type: 'text', label: 'Full Name' },
                  { id: 'email', type: 'email', label: 'Email Address' },
                  { id: 'message', type: 'text', label: 'Message' },
                ],
              },
              null,
              2
            )}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
            rows={8}
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Required: <code className="bg-gray-100 px-1 rounded">name</code> and{' '}
            <code className="bg-gray-100 px-1 rounded">content</code> fields
          </div>
          <button
            onClick={handleJsonImport}
            disabled={!jsonInput.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Import & Save Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormEditor;
