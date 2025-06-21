'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import FormViewer from '@/app/components/FormViewer';
import WorkflowProgress from '@/app/components/WorkflowProgress';

interface WorkflowTaskDetails {
  instance: {
    id: string;
    status: string;
    currentTaskId: string | null;
    startedAt: string;
    workflowId: string;
  };
  task: {
    id: string;
    formId: string;
    taskId: string;
    taskName: string | null;
    sequence: number | null;
    isRequired: boolean | null;
  };
}

interface Form {
  id: string;
  name: string;
  content: any;
}

interface WorkflowTask {
  id: string;
  taskId: string;
  taskName: string | null;
  sequence: number | null;
}

export default function WorkflowTaskPage({
  params: paramsPromise,
}: {
  params: Promise<{ instanceId: string; taskId: string }>;
}) {
  const params = use(paramsPromise);
  const [taskDetails, setTaskDetails] = useState<WorkflowTaskDetails | null>(
    null
  );
  const [form, setForm] = useState<Form | null>(null);
  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const tenantId = '1'; // In a real app, this would come from auth context

  useEffect(() => {
    fetchTaskDetails();
  }, [params.instanceId, params.taskId]);

  const fetchTaskDetails = async () => {
    try {
      // Get task details
      const taskResponse = await fetch(
        `/api/workflows/instances/${params.instanceId}/tasks/${params.taskId}?tenantId=${tenantId}`
      );

      if (!taskResponse.ok) {
        throw new Error('Failed to fetch task details');
      }

      const taskData = await taskResponse.json();
      setTaskDetails(taskData);

      // Get form details
      const formResponse = await fetch(
        `/api/forms/${taskData.task.formId}?tenantId=${tenantId}`
      );

      if (!formResponse.ok) {
        throw new Error('Failed to fetch form details');
      }

      const formData = await formResponse.json();
      setForm(formData);

      // Get all workflow tasks for progress display
      const tasksResponse = await fetch(
        `/api/workflows/${taskData.instance.workflowId}/tasks?tenantId=${tenantId}`
      );

      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json();
        setWorkflowTasks(tasks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/workflows/instances/${params.instanceId}/tasks/${params.taskId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData,
            tenantId,
            userId: 'user-1', // In a real app, this would come from auth
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit task');
      }

      const result = await response.json();

      if (result.completed) {
        alert('Workflow completed successfully!');
        router.push('/workflows');
      } else if (result.nextTask) {
        alert(
          `Task completed! Moving to next task: ${
            result.nextTask.taskName || result.nextTask.taskId
          }`
        );
        router.push(
          `/workflows/instances/${params.instanceId}/tasks/${result.nextTask.taskId}`
        );
      } else {
        alert('Task completed successfully!');
        router.push('/workflows');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">Loading task...</div>
        </div>
      </div>
    );
  }

  if (error || !taskDetails || !form) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Task or form not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/workflows')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Workflows
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {taskDetails.task.taskName || taskDetails.task.taskId}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Instance: {taskDetails.instance.id}</span>
            <span>•</span>
            <span>Task: {taskDetails.task.taskId}</span>
            <span>•</span>
            <span>
              Sequence:{' '}
              {taskDetails.task.sequence !== null
                ? taskDetails.task.sequence + 1
                : 'N/A'}
            </span>
            {taskDetails.task.isRequired && (
              <>
                <span>•</span>
                <span className="text-red-600 font-medium">Required</span>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Panel */}
          {workflowTasks.length > 0 && (
            <div className="lg:col-span-1">
              <WorkflowProgress
                steps={workflowTasks.map((task) => ({
                  id: task.id,
                  name: task.taskName || task.taskId,
                  sequence: task.sequence || 0,
                  completed:
                    (task.sequence || 0) < (taskDetails.task.sequence || 0),
                  current: task.taskId === taskDetails.task.taskId,
                }))}
              />
            </div>
          )}

          {/* Form Panel */}
          <div
            className={
              workflowTasks.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'
            }
          >
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {form.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  Complete this form to proceed to the next step in the
                  workflow.
                </p>
              </div>

              <div className="p-6">
                <FormViewer
                  form={form}
                  onSubmit={handleSubmit}
                  submitButtonText={
                    submitting ? 'Submitting...' : 'Complete Task'
                  }
                  disabled={submitting}
                  showTitle={false}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">
            Workflow Information
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <div>Status: {taskDetails.instance.status}</div>
            <div>
              Started:{' '}
              {new Date(taskDetails.instance.startedAt).toLocaleDateString()}
            </div>
            <div>Current Task: {taskDetails.instance.currentTaskId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
