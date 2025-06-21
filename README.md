# Multi-Tenant Form Editor and Workflow System

A comprehensive form management and workflow system built with Next.js, TypeScript, PostgreSQL, and Drizzle ORM. This system supports JSON-based forms, workflow management, form submissions, and is designed for multi-tenant environments with extensibility for BPMN workflows.

## Features

### 🏗️ Core Functionality

- **Multi-tenant Form Management**: Create, edit, and manage forms with tenant isolation
- **JSON-Based Form Schema**: Import forms using JSON schema definitions
- **Workflow Engine**: Create and manage workflows with sequential form tasks
- **Form Submissions**: Collect and store form submissions with validation
- **Workflow Instances**: Start and track workflow instances through completion

### 🎯 Workflow Management

- **Workflow Designer**: Visual workflow creation with form task sequencing
- **Instance Tracking**: Monitor workflow progress and completion status
- **Task Management**: Sequential form completion with validation
- **Status Management**: Draft → Active → In Progress → Completed workflow states

### 🔧 Technical Features

- **Type-Safe Database**: Full TypeScript integration with Drizzle ORM
- **PostgreSQL Backend**: Robust relational database with JSONB support
- **RESTful API**: Comprehensive API endpoints for all operations
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Server-Side Rendering**: Next.js 15 with App Router

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL with JSONB support
- **Development**: ESLint, TypeScript strict mode

## Database Schema

### Core Tables

- `forms` - Form definitions with JSON schema
- `form_submissions` - Form submission data
- `workflows` - Workflow definitions and metadata
- `workflow_form_tasks` - Form tasks within workflows
- `workflow_instances` - Active/completed workflow instances

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/kpapap/forms.git
cd forms
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your database configuration
```

4. Set up the database:

```bash
# Generate initial migration
npm run db:generate

# Run migrations
npm run db:migrate
```

5. (Optional) Set up sample data:

```bash
node scripts/setup-sample-data.js
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── forms/          # Form management endpoints
│   │   └── workflows/      # Workflow management endpoints
│   ├── components/         # React components
│   │   ├── FormEditor.tsx  # JSON form import/edit
│   │   ├── FormViewer.tsx  # Form rendering and submission
│   │   └── WorkflowProgress.tsx # Workflow status tracking
│   ├── forms/             # Form management pages
│   └── workflows/         # Workflow management pages
├── drizzle/               # Database configuration
│   ├── db.ts             # Database connection
│   ├── schema.ts         # Database schema definitions
│   └── migrations/       # Generated migrations
└── scripts/              # Utility scripts
```

## API Endpoints

### Forms

- `GET /api/forms` - List all forms
- `POST /api/forms` - Create new form
- `GET /api/forms/[id]` - Get form by ID
- `PUT /api/forms/[id]` - Update form
- `DELETE /api/forms/[id]` - Delete form
- `POST /api/forms/[id]/submissions` - Submit form data
- `GET /api/forms/[id]/submissions` - Get form submissions

### Workflows

- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create new workflow
- `GET /api/workflows/[id]` - Get workflow by ID
- `PUT /api/workflows/[id]` - Update workflow
- `DELETE /api/workflows/[id]` - Delete workflow
- `POST /api/workflows/[id]/start` - Start new workflow instance
- `GET /api/workflows/[id]/tasks` - Get workflow tasks
- `GET /api/workflows/instances` - List workflow instances
- `GET /api/workflows/instances/[id]/tasks/[taskId]` - Get task details

## Usage Examples

### Creating a Form

Forms are created by importing JSON schema:

```json
{
  "name": "Contact Form",
  "content": [
    {
      "id": "name",
      "type": "text",
      "label": "Full Name"
    },
    {
      "id": "email",
      "type": "email",
      "label": "Email Address"
    }
  ]
}
```

### Creating a Workflow

1. Navigate to `/workflows`
2. Click "Create New Workflow"
3. Add form tasks in sequence
4. Set task requirements and order
5. Activate workflow to enable instances

### Running a Workflow

1. Go to workflow detail page
2. Click "Start New Instance"
3. Complete forms in sequence
4. Track progress on instance page

## 🔗 Connecting Forms to Workflow Steps

Forms are connected to workflow steps through the **workflow form tasks** system. Here's how it works:

### Database Structure

The connection is established through the `workflow_form_tasks` table:

```sql
workflow_form_tasks
├── id (UUID)           # Unique task identifier
├── workflowId (UUID)   # References workflows.id
├── formId (UUID)       # References forms.id
├── taskId (text)       # BPMN task identifier (e.g., "personal-info-task")
├── taskName (text)     # Human-readable name (e.g., "Collect Personal Information")
├── sequence (integer)  # Order in workflow (0, 1, 2...)
├── isRequired (boolean)# Whether this step is mandatory
└── createdAt (timestamp)
```

### Step-by-Step Process

#### 1. Create Forms First

Before creating workflows, you need forms to connect:

```bash
# Navigate to Forms page
http://localhost:3000/forms

# Import a JSON form schema
{
  "name": "Personal Information",
  "content": [
    {"id": "firstName", "type": "text", "label": "First Name"},
    {"id": "lastName", "type": "text", "label": "Last Name"},
    {"id": "email", "type": "email", "label": "Email"}
  ]
}
```

#### 2. Create a Workflow

```bash
# Navigate to Workflows page
http://localhost:3000/workflows

# Click "Create New Workflow"
# Give it a name and description
```

#### 3. Connect Forms to Workflow Steps

Currently, forms are connected to workflows **programmatically** through the API or database scripts. Here are the methods:

##### Method A: Using Sample Data Script

```javascript
// Run the setup script that creates connections
node scripts/setup-sample-data.js
```

##### Method B: Direct API Calls

```javascript
// Create workflow form task
POST /api/workflows/[workflowId]/tasks
{
  "formId": "form-uuid-here",
  "taskId": "step-1",
  "taskName": "Personal Information Collection",
  "sequence": 0,
  "isRequired": true
}
```

##### Method C: Direct Database Insert

```sql
INSERT INTO workflow_form_tasks (
  id, workflow_id, form_id, task_id, task_name, sequence, is_required
) VALUES (
  gen_random_uuid(),
  'workflow-uuid',
  'form-uuid',
  'personal-info-task',
  'Collect Personal Information',
  0,
  true
);
```

### Workflow Execution Flow

Once forms are connected to workflow steps:

1. **Start Instance**: Click "Start New Instance" on workflow page
2. **Sequential Execution**: Tasks execute in `sequence` order (0, 1, 2...)
3. **Form Rendering**: Each step loads and renders the connected form
4. **Submission**: User fills out form and submits
5. **Progression**: System moves to next sequence number
6. **Completion**: When all tasks are done, workflow instance is marked complete

### Example: Employee Onboarding Workflow

```javascript
// Workflow: Employee Onboarding Process
// Step 0: Personal Information Form (sequence: 0)
// Step 1: HR Review Form (sequence: 1)
// Step 2: IT Setup Form (sequence: 2)

const workflowTasks = [
  {
    formId: 'personal-info-form-id',
    taskId: 'personal-info-task',
    taskName: 'Collect Personal Information',
    sequence: 0,
  },
  {
    formId: 'hr-review-form-id',
    taskId: 'hr-review-task',
    taskName: 'HR Review and Approval',
    sequence: 1,
  },
  {
    formId: 'it-setup-form-id',
    taskId: 'it-setup-task',
    taskName: 'IT Setup Request',
    sequence: 2,
  },
];
```

### Current Limitations & Future Enhancements

**Current State:**

- Forms must be connected programmatically (via scripts or API)
- No visual workflow designer in UI yet
- Manual sequence number assignment

**Planned Enhancements:**

- Visual workflow designer with drag-and-drop form assignment
- BPMN integration for complex workflow patterns
- Conditional branching based on form responses
- Parallel task execution
- Form template library with pre-built connections

### Troubleshooting

**Common Issues:**

1. **404 errors**: Ensure `tenantId` matches between forms and workflows
2. **Missing tasks**: Check `workflow_form_tasks` table for proper connections
3. **Wrong sequence**: Verify sequence numbers are correct (0, 1, 2...)
4. **Form not loading**: Confirm `formId` references exist in `forms` table

**Debugging Commands:**

```bash
# Check workflow tasks
curl "http://localhost:3000/api/workflows/[workflowId]/tasks?tenantId=1"

# Verify form exists
curl "http://localhost:3000/api/forms/[formId]?tenantId=1"

# Check database state
npx tsx scripts/check-database-state.ts
```
