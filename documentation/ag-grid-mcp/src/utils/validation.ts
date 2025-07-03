import { z } from 'zod';
import { Framework } from '../types/index.js';

export const FrameworkSchema = z.enum(['react', 'angular', 'vue', 'vanilla']);

export const GridConfigSchema = z.object({
  framework: FrameworkSchema,
  version: z.string().optional(),
  features: z.array(z.string()).optional(),
  theme: z.string().optional(),
  enterpriseFeatures: z.boolean().optional()
});

export const ColumnDefinitionSchema = z.object({
  field: z.string(),
  headerName: z.string().optional(),
  type: z.enum(['text', 'number', 'date', 'boolean']).optional(),
  width: z.number().optional(),
  sortable: z.boolean().optional(),
  filter: z.union([z.boolean(), z.string()]).optional(),
  editable: z.boolean().optional(),
  cellRenderer: z.string().optional(),
  valueFormatter: z.string().optional(),
  valueParser: z.string().optional()
});

export const CreateColumnDefinitionsSchema = z.object({
  columns: z.array(ColumnDefinitionSchema),
  framework: FrameworkSchema
});

export const AddGridFeatureSchema = z.object({
  feature: z.string(),
  framework: FrameworkSchema,
  version: z.string().optional()
});

export const SetupDataBindingSchema = z.object({
  framework: FrameworkSchema,
  dataSource: z.enum(['static', 'api', 'websocket', 'server-side']),
  apiEndpoint: z.string().optional(),
  version: z.string().optional()
});

export const TroubleshootIssueSchema = z.object({
  issue: z.string(),
  framework: FrameworkSchema.optional(),
  version: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  errorMessages: z.array(z.string()).optional()
});

export const DocumentationRequestSchema = z.object({
  topic: z.string(),
  framework: FrameworkSchema.optional(),
  version: z.string().optional(),
  section: z.string().optional()
});

export const ExampleRequestSchema = z.object({
  framework: FrameworkSchema,
  feature: z.string(),
  complexity: z.enum(['basic', 'intermediate', 'advanced']).optional(),
  version: z.string().optional()
});

export const MigrationGuideSchema = z.object({
  fromVersion: z.string(),
  toVersion: z.string(),
  framework: FrameworkSchema.optional(),
  breakingChanges: z.boolean().optional()
});

export const QuickStartSchema = z.object({
  framework: FrameworkSchema,
  projectType: z.enum(['new', 'existing']).optional(),
  packageManager: z.enum(['npm', 'yarn', 'pnpm']).optional(),
  typescript: z.boolean().optional(),
  version: z.string().optional()
});

export const PerformanceOptimizationSchema = z.object({
  framework: FrameworkSchema,
  dataSize: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
  features: z.array(z.string()).optional(),
  currentIssues: z.array(z.string()).optional(),
  version: z.string().optional()
});

export function validateFramework(framework: unknown): Framework {
  const result = FrameworkSchema.safeParse(framework);
  if (!result.success) {
    throw new Error(`Invalid framework: ${framework}. Must be one of: react, angular, vue, vanilla`);
  }
  return result.data;
}

export function validateVersion(version: unknown): string | undefined {
  if (version === undefined || version === null) {
    return undefined;
  }
  
  if (typeof version !== 'string') {
    throw new Error('Version must be a string');
  }
  
  const versionRegex = /^\d+\.\d+\.\d+(-\w+)?$/;
  if (!versionRegex.test(version)) {
    throw new Error('Version must be in semantic version format (e.g., 34.0.0)');
  }
  
  return version;
}

export function validateFeatureName(feature: unknown): string {
  if (typeof feature !== 'string') {
    throw new Error('Feature name must be a string');
  }
  
  const validFeatures = [
    'row-selection',
    'sorting',
    'filtering',
    'pagination',
    'editing',
    'master-detail',
    'tree-data',
    'pivoting',
    'grouping',
    'charts',
    'excel-export',
    'csv-export',
    'clipboard',
    'infinite-scroll',
    'server-side-operations',
    'context-menu',
    'tool-panel',
    'status-bar',
    'side-bar',
    'range-selection',
    'full-width-rows',
    'cell-expressions',
    'cell-styling',
    'column-spanning',
    'row-spanning'
  ];
  
  if (!validFeatures.includes(feature)) {
    throw new Error(`Unknown feature: ${feature}. Must be one of: ${validFeatures.join(', ')}`);
  }
  
  return feature;
}