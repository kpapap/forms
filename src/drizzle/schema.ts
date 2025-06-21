import {
  pgTable,
  serial,
  text,
  jsonb,
  timestamp,
  uuid,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

export const forms = pgTable('forms', {
  id: uuid('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  content: jsonb('content'),
  // Workflow integration fields
  workflowEnabled: boolean('workflow_enabled').default(false),
  workflowConfig: jsonb('workflow_config'), // Store workflow-specific settings
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const formSubmissions = pgTable('form_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id')
    .notNull()
    .references(() => forms.id),
  tenantId: text('tenant_id').notNull(),
  data: jsonb('data').notNull(),
  // Workflow integration fields
  workflowInstanceId: uuid('workflow_instance_id').references(
    () => workflowInstances.id
  ),
  taskId: text('task_id'), // BPMN task identifier this submission belongs to
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Workflow-related tables
export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  bpmnXml: text('bpmn_xml'), // BPMN process definition
  status: text('status').default('draft').notNull(), // draft, active, inactive
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workflowFormTasks = pgTable('workflow_form_tasks', {
  id: uuid('id').primaryKey(),
  workflowId: uuid('workflow_id')
    .notNull()
    .references(() => workflows.id),
  formId: uuid('form_id')
    .notNull()
    .references(() => forms.id),
  taskId: text('task_id').notNull(), // BPMN task identifier
  taskName: text('task_name'),
  sequence: integer('sequence').default(0), // Order in workflow
  isRequired: boolean('is_required').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workflowInstances = pgTable('workflow_instances', {
  id: uuid('id').primaryKey(),
  workflowId: uuid('workflow_id')
    .notNull()
    .references(() => workflows.id),
  tenantId: text('tenant_id').notNull(),
  userId: text('user_id').notNull(),
  status: text('status').default('running').notNull(), // running, completed, failed, paused
  currentTaskId: text('current_task_id'),
  variables: jsonb('variables'), // Store workflow variables
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// TypeScript types for workflow integration
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;

export type WorkflowFormTask = typeof workflowFormTasks.$inferSelect;
export type NewWorkflowFormTask = typeof workflowFormTasks.$inferInsert;

export type WorkflowInstance = typeof workflowInstances.$inferSelect;
export type NewWorkflowInstance = typeof workflowInstances.$inferInsert;

export type FormWithWorkflow = typeof forms.$inferSelect;
export type FormSubmissionWithWorkflow = typeof formSubmissions.$inferSelect;
