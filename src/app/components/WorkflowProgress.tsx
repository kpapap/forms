'use client';

interface WorkflowStep {
  id: string;
  name: string;
  sequence: number;
  completed: boolean;
  current: boolean;
}

interface WorkflowProgressProps {
  steps: WorkflowStep[];
  className?: string;
}

export default function WorkflowProgress({
  steps,
  className = '',
}: WorkflowProgressProps) {
  const sortedSteps = [...steps].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Workflow Progress
      </h3>

      <div className="space-y-4">
        {sortedSteps.map((step, index) => {
          const isLast = index === sortedSteps.length - 1;

          return (
            <div key={step.id} className="relative">
              <div className="flex items-center">
                {/* Step Icon */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : step.current
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {step.completed ? (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">
                      {step.sequence + 1}
                    </span>
                  )}
                </div>

                {/* Step Label */}
                <div className="ml-4 flex-1">
                  <div
                    className={`text-sm font-medium ${
                      step.completed
                        ? 'text-green-900'
                        : step.current
                        ? 'text-blue-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </div>
                  {step.current && (
                    <div className="text-xs text-blue-600 mt-1">
                      Current Step
                    </div>
                  )}
                  {step.completed && (
                    <div className="text-xs text-green-600 mt-1">Completed</div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="ml-4">
                  {step.completed && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Done
                    </span>
                  )}
                  {step.current && !step.completed && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Active
                    </span>
                  )}
                  {!step.current && !step.completed && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`absolute left-4 top-8 w-0.5 h-6 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>
            {sortedSteps.filter((s) => s.completed).length} of{' '}
            {sortedSteps.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                (sortedSteps.filter((s) => s.completed).length /
                  sortedSteps.length) *
                100
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
