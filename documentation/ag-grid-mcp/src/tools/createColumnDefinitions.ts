import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CreateColumnDefinitionsSchema } from '../utils/validation.js';
import { CodeGenerationService } from '../utils/codeGeneration.js';
import { ColumnDefinition } from '../types/index.js';

export const createColumnDefinitionsTool: Tool = {
  name: 'create-column-definitions',
  description: 'Create column definitions for AG-Grid with proper types and formatting',
  inputSchema: {
    type: 'object',
    properties: {
      columns: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              description: 'The field name from your data object'
            },
            headerName: {
              type: 'string',
              description: 'Display name for the column header'
            },
            type: {
              type: 'string',
              enum: ['text', 'number', 'date', 'boolean'],
              description: 'Data type for the column'
            },
            width: {
              type: 'number',
              description: 'Column width in pixels'
            },
            sortable: {
              type: 'boolean',
              description: 'Whether the column is sortable'
            },
            filter: {
              oneOf: [
                { type: 'boolean' },
                { type: 'string' }
              ],
              description: 'Whether to show filter or specific filter type'
            },
            editable: {
              type: 'boolean',
              description: 'Whether the column is editable'
            },
            cellRenderer: {
              type: 'string',
              description: 'Custom cell renderer name'
            },
            valueFormatter: {
              type: 'string',
              description: 'Value formatter function'
            },
            valueParser: {
              type: 'string',
              description: 'Value parser function'
            }
          },
          required: ['field']
        },
        description: 'Array of column definitions'
      },
      framework: {
        type: 'string',
        enum: ['react', 'angular', 'vue', 'vanilla'],
        description: 'The framework to generate code for'
      }
    },
    required: ['columns', 'framework']
  }
};

export async function handleCreateColumnDefinitions(args: any): Promise<string> {
  const validatedArgs = CreateColumnDefinitionsSchema.parse(args);
  
  try {
    const code = CodeGenerationService.generateColumnDefinitions(validatedArgs.columns, validatedArgs.framework);
    
    const features = analyzeColumnFeatures(validatedArgs.columns);
    const recommendations = generateRecommendations(validatedArgs.columns, validatedArgs.framework);
    
    return `## Column Definitions for ${validatedArgs.framework.charAt(0).toUpperCase() + validatedArgs.framework.slice(1)}

### Generated Code
\`\`\`${validatedArgs.framework === 'vanilla' ? 'javascript' : 'typescript'}
${code}
\`\`\`

### Features Used
${features.map(feature => `- ${feature}`).join('\n')}

### Recommendations
${recommendations}

### Common Column Properties
- \`field\` - The key from your data object
- \`headerName\` - Display name (defaults to field name)
- \`width\` - Column width in pixels
- \`sortable\` - Enable sorting (default: false)
- \`filter\` - Enable filtering (default: false)
- \`editable\` - Allow editing (default: false)
- \`cellRenderer\` - Custom cell display component
- \`valueFormatter\` - Format display values
- \`valueParser\` - Parse edited values

### Filter Types
- \`true\` - Default filter based on data type
- \`'agTextColumnFilter'\` - Text filter
- \`'agNumberColumnFilter'\` - Number filter
- \`'agDateColumnFilter'\` - Date filter
- \`'agSetColumnFilter'\` - Set filter (Enterprise only)

### Documentation
- [Column Definitions](https://www.ag-grid.com/documentation/column-definitions/)
- [Column Properties](https://www.ag-grid.com/documentation/column-properties/)
- [Cell Rendering](https://www.ag-grid.com/documentation/cell-rendering/)`;
  } catch (error) {
    throw new Error(`Failed to create column definitions: ${error}`);
  }
}

function analyzeColumnFeatures(columns: ColumnDefinition[]): string[] {
  const features = new Set<string>();
  
  columns.forEach(col => {
    if (col.sortable) features.add('Sorting');
    if (col.filter) features.add('Filtering');
    if (col.editable) features.add('Editing');
    if (col.cellRenderer) features.add('Custom Cell Rendering');
    if (col.valueFormatter) features.add('Value Formatting');
    if (col.valueParser) features.add('Value Parsing');
    if (col.type === 'date') features.add('Date Handling');
    if (col.type === 'number') features.add('Number Formatting');
  });
  
  return Array.from(features);
}

function generateRecommendations(columns: ColumnDefinition[], framework: string): string {
  const recommendations = [];
  
  // Check for common patterns
  const hasNumberColumns = columns.some(col => col.type === 'number');
  const hasDateColumns = columns.some(col => col.type === 'date');
  const hasEditableColumns = columns.some(col => col.editable);
  const hasCustomRenderers = columns.some(col => col.cellRenderer);
  
  if (hasNumberColumns) {
    recommendations.push('Consider adding number formatters for better display of numeric values');
  }
  
  if (hasDateColumns) {
    recommendations.push('Date columns may benefit from custom date formatters and date filters');
  }
  
  if (hasEditableColumns) {
    recommendations.push('Editable columns should have value parsers to handle user input properly');
  }
  
  if (hasCustomRenderers) {
    recommendations.push('Custom cell renderers should be implemented according to your framework patterns');
  }
  
  // Framework-specific recommendations
  if (framework === 'react') {
    recommendations.push('Use React hooks for managing column state and event handlers');
  } else if (framework === 'angular') {
    recommendations.push('Consider using Angular services for data management and validation');
  } else if (framework === 'vue') {
    recommendations.push('Use Vue refs for reactive column definitions');
  }
  
  // Default column def suggestion
  recommendations.push('Consider setting up defaultColDef for common column properties');
  
  if (recommendations.length === 0) {
    recommendations.push('Your column definitions look good! Consider adding sorting and filtering for better user experience.');
  }
  
  return recommendations.map(rec => `- ${rec}`).join('\n');
}