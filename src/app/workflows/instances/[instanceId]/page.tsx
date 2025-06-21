'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface WorkflowInstance {
  id: string;
  workflowId: string;
  tenantId: string;
  userId: string;
  status: string;
  currentTaskId: string | null;
  variables: Record<string, any> | null;
  startedAt: string;
  completedAt: string | null;
}

interface Task {
  id: string;
  workflowId: string;
  formId: string;
  taskId: string;
  taskName: string;
  sequence: number;
  isRequired: boolean;
}

export default function WorkflowInstanceDetail({
  params: paramsPromise,
}: {
  params: Promise<{ instanceId: string }>;
}) {
  const params = use(paramsPromise);
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const tenantId = '1'; // In a real app, this would come from auth context

  useEffect(() => {
    fetchWorkflowInstance();
  }, [params.instanceId]);

  const fetchWorkflowInstance = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/workflows/instances/${params.instanceId}?tenantId=${tenantId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch workflow instance');
      }

      const data = await response.json();
      setInstance(data);

      // Fetch the tasks associated with this workflow
      if (data.workflowId) {
        const tasksResponse = await fetch(
          `/api/workflows/${data.workflowId}/tasks?tenantId=${tenantId}`
        );

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching workflow instance:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">Loading workflow instance...</div>
        </div>
      </div>
    );
  }

  if (error || !instance) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Workflow instance not found'}
          </div>
          <div className="mt-4">
            <Link
              href="/workflows/instances"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Workflow Instances
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/workflows/instances"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Workflow Instances
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-900">
                  Workflow Instance: {instance.id.substring(0, 8)}...
                </h1>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  instance.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : instance.status === 'running'
                    ? 'bg-blue-100 text-blue-800'
                    : instance.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {instance.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Instance details */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Instance Details
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Instance ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{instance.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {instance.status}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Started At
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(instance.startedAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Completed At
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {instance.completedAt
                    ? new Date(instance.completedAt).toLocaleString()
                    : 'Not completed yet'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Current Task ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {instance.currentTaskId || 'No active task'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Tasks */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h2>

            {tasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Task Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Sequence
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {task.taskName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {task.sequence}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              instance.currentTaskId === task.taskId
                                ? 'bg-blue-100 text-blue-800'
                                : instance.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {instance.currentTaskId === task.taskId
                              ? 'Current'
                              : instance.status === 'completed'
                              ? 'Completed'
                              : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {instance.currentTaskId === task.taskId && (
                            <Link
                              href={`/workflows/instances/${instance.id}/tasks/${task.taskId}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Complete Task →
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-4 text-sm text-gray-600">
                No tasks found for this workflow.
              </div>
            )}
          </div>

          {/* Variables */}
          {instance.variables && Object.keys(instance.variables).length > 0 && (
            <div className="p-6 border-t">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Process Variables
              </h2>
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(instance.variables, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
