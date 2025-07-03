export type Framework = 'react' | 'angular' | 'vue' | 'vanilla';

export interface GridConfig {
  framework: Framework;
  version?: string;
  features?: string[];
  theme?: string;
  enterpriseFeatures?: boolean;
}

export interface ColumnDefinition {
  field: string;
  headerName?: string;
  type?: 'text' | 'number' | 'date' | 'boolean';
  width?: number;
  sortable?: boolean;
  filter?: boolean | string;
  editable?: boolean;
  cellRenderer?: string;
  valueFormatter?: string;
  valueParser?: string;
}

export interface GridFeature {
  name: string;
  description: string;
  enterpriseOnly: boolean;
  frameworks: Framework[];
  codeSnippets: Record<Framework, string>;
  dependencies?: string[];
}

export interface DocumentationEntry {
  title: string;
  url: string;
  content: string;
  version: string;
  framework?: Framework;
  category: string;
}

export interface ExampleCode {
  framework: Framework;
  title: string;
  description: string;
  code: string;
  dependencies: string[];
  features: string[];
}

export interface TroubleshootingGuide {
  issue: string;
  symptoms: string[];
  solutions: string[];
  codeExamples?: Record<Framework, string>;
  relatedDocs?: string[];
}

export interface AgGridVersion {
  version: string;
  releaseDate: string;
  major: number;
  minor: number;
  patch: number;
  isLatest: boolean;
  documentationUrl: string;
  changelogUrl: string;
}