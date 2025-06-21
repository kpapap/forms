'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  bpmnXml: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  formTasks: WorkflowFormTask[];
}

interface WorkflowFormTask {
  id: string;
  workflowId: string;
  formId: string;
  taskId: string;
  taskName: string | null;
  sequence: number | null;
  isRequired: boolean | null;
  createdAt: string;
}

interface Form {
  id: string;
  name: string;
  content: any;
}

export default function WorkflowDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [forms, setForms] = useState<Record<string, Form>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const tenantId = '1'; // In a real app, this would come from auth context

  useEffect(() => {
    fetchWorkflowDetails();
  }, [params.id]);

  const fetchWorkflowDetails = async () => {
    try {
      // Get workflow details
      const workflowResponse = await fetch(
        `/api/workflows/${params.id}?tenantId=${tenantId}`
      );

      if (!workflowResponse.ok) {
        throw new Error('Failed to fetch workflow details');
      }

      const workflowData = await workflowResponse.json();
      setWorkflow(workflowData);

      // Get form details for each task
      const formPromises = workflowData.formTasks.map(
        async (task: WorkflowFormTask) => {
          const formResponse = await fetch(
            `/api/forms/${task.formId}?tenantId=${tenantId}`
          );
          if (formResponse.ok) {
            const formData = await formResponse.json();
            return { [task.formId]: formData };
          }
          return {};
        }
      );

      const formResults = await Promise.all(formPromises);
      const formsMap = formResults.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      );
      setForms(formsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${params.id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId,
          userId: 'user-1', // In a real app, this would come from auth
        }),
      });

      if (response.ok) {
        const instance = await response.json();
        alert('Workflow started successfully!');
        router.push(
          `/workflows/instances/${instance.id}/tasks/${instance.currentTaskId}`
        );
      } else {
        alert('Failed to start workflow');
      }
    } catch (err) {
      alert('Error starting workflow');
    }
  };

  const activateWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...workflow,
          status: 'active',
        }),
      });

      if (response.ok) {
        const updatedWorkflow = await response.json();
        setWorkflow((prev) =>
          prev
            ? {
                ...prev,
                status: 'active',
                updatedAt: updatedWorkflow.updatedAt,
              }
            : null
        );
        alert('Workflow activated successfully!');
      } else {
        alert('Failed to activate workflow');
      }
    } catch (err) {
      alert('Error activating workflow');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">Loading workflow details...</div>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Workflow not found'}
          </div>
          <div className="mt-4">
            <Link
              href="/workflows"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Workflows
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sortedTasks = [...workflow.formTasks].sort(
    (a, b) => (a.sequence || 0) - (b.sequence || 0)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/workflows"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Workflows
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {workflow.name}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    workflow.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : workflow.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {workflow.status}
                </span>
              </div>
              {workflow.description && (
                <p className="text-lg text-gray-600 mb-4">
                  {workflow.description}
                </p>
              )}
              <div className="text-sm text-gray-500">
                Created: {formatDate(workflow.createdAt)} • Updated:{' '}
                {formatDate(workflow.updatedAt)}
              </div>
            </div>

            <div className="flex gap-3 ml-6">
              {workflow.status === 'draft' && (
                <button
                  onClick={activateWorkflow}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  Activate Workflow
                </button>
              )}
              {workflow.status === 'active' && (
                <button
                  onClick={startWorkflow}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Start New Instance
                </button>
              )}
              <Link
                href={`/workflows/instances?workflowId=${workflow.id}`}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Instances
              </Link>
            </div>
          </div>
        </div>

        {/* Workflow Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Workflow Tasks
            </h2>
            <p className="text-gray-600 mt-1">
              {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''} in
              this workflow
            </p>
          </div>

          <div className="p-6">
            {sortedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tasks configured for this workflow.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedTasks.map((task, index) => {
                  const form = forms[task.formId];
                  const isLast = index === sortedTasks.length - 1;

                  return (
                    <div key={task.id} className="relative">
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        {/* Step Number */}
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium mr-4">
                          {(task.sequence || 0) + 1}
                        </div>

                        {/* Task Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {task.taskName || task.taskId}
                            </h3>
                            {task.isRequired && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            Form: {form ? form.name : 'Loading...'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Task ID: {task.taskId}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {form && (
                            <Link
                              href={`/forms/${task.formId}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View Form
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Connector */}
                      {!isLast && (
                        <div className="flex justify-center py-2">
                          <div className="w-px h-6 bg-gray-300"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Workflow Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Workflow Information
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">ID:</span> {workflow.id}
              </div>
              <div>
                <span className="font-medium">Status:</span> {workflow.status}
              </div>
              <div>
                <span className="font-medium">Tenant:</span> {workflow.tenantId}
              </div>
              <div>
                <span className="font-medium">Tasks:</span>{' '}
                {workflow.formTasks.length}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/workflows/instances?workflowId=${workflow.id}`}
                className="block w-full text-center bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View All Instances
              </Link>
              <Link
                href="/workflows"
                className="block w-full text-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Back to Workflows
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
