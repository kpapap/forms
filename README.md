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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub.
