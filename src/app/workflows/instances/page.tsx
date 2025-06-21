'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface WorkflowInstance {
  instance: {
    id: string;
    status: string;
    currentTaskId: string | null;
    startedAt: string;
    completedAt: string | null;
  };
  workflow: {
    id: string;
    name: string;
    description: string | null;
  };
  currentTask?: {
    taskName: string | null;
    sequence: number | null;
  };
}

export default function WorkflowInstancesPage() {
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('workflowId');

  const tenantId = '1'; // In a real app, this would come from auth context

  useEffect(() => {
    fetchInstances();
  }, [workflowId]);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      let url = `/api/workflows/instances?tenantId=${tenantId}`;
      if (workflowId) {
        url += `&workflowId=${workflowId}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setInstances(data);
      } else {
        setError('Failed to fetch instances');
      }
    } catch (err) {
      console.error('Error fetching workflow instances:', err);
      setError('Error fetching instances');
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">Loading instances...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
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

  const pageTitle =
    workflowId && instances.length > 0
      ? `${instances[0].workflow.name} - Instances`
      : 'Workflow Instances';

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
            {workflowId && (
              <Link
                href={`/workflows/${workflowId}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                → View Workflow Details
              </Link>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <p className="text-gray-600">
            {instances.length} instance{instances.length !== 1 ? 's' : ''} found
            {workflowId ? ' for this workflow' : ''}
          </p>
        </div>

        {/* Instances List */}
        <div className="bg-white rounded-lg shadow">
          {instances.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg mb-4">No workflow instances found.</p>
              {workflowId && (
                <Link
                  href={`/workflows/${workflowId}`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
                >
                  Start First Instance
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workflow
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Started
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {instances.map((item) => (
                    <tr key={item.instance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.workflow.name}
                          </div>
                          {item.workflow.description && (
                            <div className="text-sm text-gray-500">
                              {item.workflow.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            item.instance.status
                          )}`}
                        >
                          {item.instance.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.currentTask?.taskName || 'No current task'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.instance.startedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.instance.completedAt
                          ? formatDate(item.instance.completedAt)
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {item.instance.status === 'in_progress' &&
                        item.instance.currentTaskId ? (
                          <Link
                            href={`/workflows/instances/${item.instance.id}/tasks/${item.instance.currentTaskId}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Continue
                          </Link>
                        ) : item.instance.status === 'completed' ? (
                          <span className="text-gray-400">Completed</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
