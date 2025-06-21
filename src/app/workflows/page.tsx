'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

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
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [completedInstances, setCompletedInstances] = useState<
    WorkflowInstance[]
  >([]);
  const [activeTab, setActiveTab] = useState<
    'workflows' | 'instances' | 'completed'
  >('workflows');

  const handleTabChange = (tab: 'workflows' | 'instances' | 'completed') => {
    setActiveTab(tab);
    // Refresh data when tab changes
    if (tab === 'workflows') {
      fetchWorkflows();
    } else if (tab === 'instances') {
      fetchInstances();
    } else if (tab === 'completed') {
      fetchCompletedInstances();
    }
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenantId = '1'; // In a real app, this would come from auth context

  useEffect(() => {
    fetchWorkflows();
    fetchInstances();
    fetchCompletedInstances();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch(`/api/workflows?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      } else {
        setError('Failed to fetch workflows');
      }
    } catch (err) {
      setError('Error fetching workflows');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstances = async () => {
    try {
      const response = await fetch(
        `/api/workflows/instances?tenantId=${tenantId}`
      );
      if (response.ok) {
        const data = await response.json();
        // Only include running instances
        const activeInstances = data.filter(
          (instance: WorkflowInstance) => instance.instance.status === 'running'
        );
        setInstances(activeInstances);
      }
    } catch (err) {
      console.error('Error fetching workflow instances:', err);
    }
  };

  const fetchCompletedInstances = async () => {
    try {
      const response = await fetch(
        `/api/workflows/instances?tenantId=${tenantId}&status=completed`
      );
      if (response.ok) {
        const data = await response.json();
        // Filter for completed instances
        const completed = data.filter(
          (instance: WorkflowInstance) =>
            instance.instance.status === 'completed'
        );
        setCompletedInstances(completed);
      }
    } catch (err) {
      console.error('Error fetching completed workflow instances:', err);
    }
  };

  const startWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/start`, {
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
        fetchInstances(); // Refresh instances
        alert('Workflow started successfully!');
      } else {
        alert('Failed to start workflow');
      }
    } catch (err) {
      alert('Error starting workflow');
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
          <div className="animate-pulse">Loading workflows...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Workflow Management
          </h1>
          <div className="flex gap-4">
            <Link
              href="/forms"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Forms
            </Link>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Create Workflow
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => handleTabChange('workflows')}
            className={`px-6 py-3 font-medium border-b-2 ${
              activeTab === 'workflows'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Workflows ({workflows.length})
          </button>
          <button
            onClick={() => handleTabChange('instances')}
            className={`px-6 py-3 font-medium border-b-2 ${
              activeTab === 'instances'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Instances ({instances.length})
          </button>
          <button
            onClick={() => handleTabChange('completed')}
            className={`px-6 py-3 font-medium border-b-2 ${
              activeTab === 'completed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed Instances ({completedInstances.length})
          </button>
        </div>

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className="space-y-4">
            {workflows.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No workflows found
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first workflow to get started.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create Workflow
                </button>
              </div>
            ) : (
              workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {workflow.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                        <p className="text-gray-600 mb-3">
                          {workflow.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-500">
                        Created: {formatDate(workflow.createdAt)} • Updated:{' '}
                        {formatDate(workflow.updatedAt)}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {workflow.status === 'active' && (
                        <button
                          onClick={() => startWorkflow(workflow.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Start Instance
                        </button>
                      )}
                      <Link
                        href={`/workflows/${workflow.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Instances Tab */}
        {activeTab === 'instances' && (
          <div className="space-y-4">
            {instances.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No active instances
                </h3>
                <p className="text-gray-500">
                  Start a workflow to see instances here.
                </p>
              </div>
            ) : (
              instances.map((item) => (
                <div
                  key={item.instance.id}
                  className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {item.workflow.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.instance.status === 'running'
                              ? 'bg-blue-100 text-blue-800'
                              : item.instance.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : item.instance.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.instance.status}
                        </span>
                      </div>
                      {item.workflow.description && (
                        <p className="text-gray-600 mb-2">
                          {item.workflow.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>
                          Started: {formatDate(item.instance.startedAt)}
                        </div>
                        {item.instance.currentTaskId && (
                          <div>Current Task: {item.instance.currentTaskId}</div>
                        )}
                        {item.instance.completedAt && (
                          <div>
                            Completed: {formatDate(item.instance.completedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {item.instance.status === 'running' &&
                        item.instance.currentTaskId && (
                          <Link
                            href={`/workflows/instances/${item.instance.id}/tasks/${item.instance.currentTaskId}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Continue Task
                          </Link>
                        )}
                      <Link
                        href={`/workflows/instances/${item.instance.id}`}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Completed Instances Tab */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            {completedInstances.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No completed instances
                </h3>
                <p className="text-gray-500">
                  Completed workflow instances will appear here.
                </p>
              </div>
            ) : (
              completedInstances.map((item) => (
                <div
                  key={item.instance.id}
                  className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {item.workflow.name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {item.instance.status}
                        </span>
                      </div>
                      {item.workflow.description && (
                        <p className="text-gray-600 mb-2">
                          {item.workflow.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>
                          Started: {formatDate(item.instance.startedAt)}
                        </div>
                        {item.instance.completedAt && (
                          <div>
                            Completed: {formatDate(item.instance.completedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/workflows/instances/${item.instance.id}`}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
