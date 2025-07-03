import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AddGridFeatureSchema } from '../utils/validation.js';
import { CodeGenerationService } from '../utils/codeGeneration.js';

export const addGridFeatureTool: Tool = {
  name: 'add-grid-feature',
  description: 'Add specific AG-Grid features like sorting, filtering, pagination, etc.',
  inputSchema: {
    type: 'object',
    properties: {
      feature: {
        type: 'string',
        enum: [
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
        ],
        description: 'The feature to add to the grid'
      },
      framework: {
        type: 'string',
        enum: ['react', 'angular', 'vue', 'vanilla'],
        description: 'The framework to generate code for'
      },
      version: {
        type: 'string',
        description: 'AG-Grid version (optional)',
        pattern: '^\\d+\\.\\d+\\.\\d+(-\\w+)?$'
      }
    },
    required: ['feature', 'framework']
  }
};

export async function handleAddGridFeature(args: any): Promise<string> {
  const validatedArgs = AddGridFeatureSchema.parse(args);
  
  try {
    const code = CodeGenerationService.generateFeatureImplementation(
      validatedArgs.feature, 
      validatedArgs.framework
    );
    
    const featureInfo = getFeatureInfo(validatedArgs.feature);
    const dependencies = getFeatureDependencies(validatedArgs.feature);
    const documentation = getFeatureDocumentation(validatedArgs.feature);
    
    return `## Adding ${featureInfo.name} to AG-Grid

### Description
${featureInfo.description}

${featureInfo.enterpriseOnly ? '⚠️ **Enterprise Feature**: This feature requires AG Grid Enterprise license.' : ''}

### Dependencies
${dependencies.length > 0 ? dependencies.map(dep => `- ${dep}`).join('\n') : 'No additional dependencies required.'}

### Implementation
\`\`\`${validatedArgs.framework === 'vanilla' ? 'javascript' : 'typescript'}
${code}
\`\`\`

### Additional Configuration
${getAdditionalConfiguration(validatedArgs.feature, validatedArgs.framework)}

### Common Use Cases
${getUseCases(validatedArgs.feature)}

### Related Features
${getRelatedFeatures(validatedArgs.feature)}

### Documentation Links
${documentation.map(doc => `- [${doc.title}](${doc.url})`).join('\n')}

### Troubleshooting
${getTroubleshootingTips(validatedArgs.feature)}`;
  } catch (error) {
    throw new Error(`Failed to add grid feature: ${error}`);
  }
}

function getFeatureInfo(feature: string): { name: string; description: string; enterpriseOnly: boolean } {
  const features = {
    'row-selection': {
      name: 'Row Selection',
      description: 'Allow users to select single or multiple rows by clicking on them.',
      enterpriseOnly: false
    },
    'sorting': {
      name: 'Column Sorting',
      description: 'Enable users to sort data by clicking on column headers.',
      enterpriseOnly: false
    },
    'filtering': {
      name: 'Column Filtering',
      description: 'Add filter controls to columns for data filtering.',
      enterpriseOnly: false
    },
    'pagination': {
      name: 'Pagination',
      description: 'Split large datasets into pages for better performance and navigation.',
      enterpriseOnly: false
    },
    'editing': {
      name: 'Cell Editing',
      description: 'Allow users to edit cell values directly in the grid.',
      enterpriseOnly: false
    },
    'master-detail': {
      name: 'Master Detail',
      description: 'Show detailed information for each row in an expandable detail panel.',
      enterpriseOnly: true
    },
    'tree-data': {
      name: 'Tree Data',
      description: 'Display hierarchical data with expandable/collapsible nodes.',
      enterpriseOnly: false
    },
    'pivoting': {
      name: 'Pivoting',
      description: 'Transform and aggregate data into pivot tables.',
      enterpriseOnly: true
    },
    'grouping': {
      name: 'Row Grouping',
      description: 'Group rows by column values with aggregation support.',
      enterpriseOnly: false
    },
    'charts': {
      name: 'Integrated Charts',
      description: 'Create charts directly from grid data.',
      enterpriseOnly: true
    },
    'excel-export': {
      name: 'Excel Export',
      description: 'Export grid data to Excel format.',
      enterpriseOnly: true
    },
    'csv-export': {
      name: 'CSV Export',
      description: 'Export grid data to CSV format.',
      enterpriseOnly: false
    },
    'clipboard': {
      name: 'Clipboard Operations',
      description: 'Copy and paste data to/from the clipboard.',
      enterpriseOnly: false
    },
    'infinite-scroll': {
      name: 'Infinite Scrolling',
      description: 'Load data progressively as the user scrolls.',
      enterpriseOnly: false
    },
    'server-side-operations': {
      name: 'Server-Side Operations',
      description: 'Perform sorting, filtering, and grouping on the server.',
      enterpriseOnly: true
    },
    'context-menu': {
      name: 'Context Menu',
      description: 'Right-click context menu with custom actions.',
      enterpriseOnly: false
    },
    'tool-panel': {
      name: 'Tool Panel',
      description: 'Side panel with columns and filters management.',
      enterpriseOnly: true
    },
    'status-bar': {
      name: 'Status Bar',
      description: 'Bottom panel showing aggregated information.',
      enterpriseOnly: true
    },
    'side-bar': {
      name: 'Side Bar',
      description: 'Configurable side panel with various tools.',
      enterpriseOnly: true
    },
    'range-selection': {
      name: 'Range Selection',
      description: 'Select ranges of cells like in Excel.',
      enterpriseOnly: true
    },
    'full-width-rows': {
      name: 'Full Width Rows',
      description: 'Rows that span the entire width of the grid.',
      enterpriseOnly: false
    },
    'cell-expressions': {
      name: 'Cell Expressions',
      description: 'Excel-like formulas and expressions in cells.',
      enterpriseOnly: true
    },
    'cell-styling': {
      name: 'Cell Styling',
      description: 'Custom styling for cells based on conditions.',
      enterpriseOnly: false
    },
    'column-spanning': {
      name: 'Column Spanning',
      description: 'Cells that span across multiple columns.',
      enterpriseOnly: false
    },
    'row-spanning': {
      name: 'Row Spanning',
      description: 'Cells that span across multiple rows.',
      enterpriseOnly: true
    }
  };

  return features[feature as keyof typeof features] || {
    name: 'Unknown Feature',
    description: 'Feature description not available.',
    enterpriseOnly: false
  };
}

function getFeatureDependencies(feature: string): string[] {
  const dependencies = {
    'master-detail': ['ag-grid-enterprise'],
    'pivoting': ['ag-grid-enterprise'],
    'charts': ['ag-grid-enterprise'],
    'excel-export': ['ag-grid-enterprise'],
    'server-side-operations': ['ag-grid-enterprise'],
    'tool-panel': ['ag-grid-enterprise'],
    'status-bar': ['ag-grid-enterprise'],
    'side-bar': ['ag-grid-enterprise'],
    'range-selection': ['ag-grid-enterprise'],
    'cell-expressions': ['ag-grid-enterprise'],
    'row-spanning': ['ag-grid-enterprise']
  };

  return dependencies[feature as keyof typeof dependencies] || [];
}

function getFeatureDocumentation(feature: string): { title: string; url: string }[] {
  const baseUrl = 'https://www.ag-grid.com/documentation';
  
  const docs = {
    'row-selection': [
      { title: 'Row Selection', url: `${baseUrl}/row-selection/` }
    ],
    'sorting': [
      { title: 'Column Sorting', url: `${baseUrl}/row-sorting/` }
    ],
    'filtering': [
      { title: 'Column Filtering', url: `${baseUrl}/filtering/` },
      { title: 'Filter Types', url: `${baseUrl}/filter-provided/` }
    ],
    'pagination': [
      { title: 'Pagination', url: `${baseUrl}/row-pagination/` }
    ],
    'editing': [
      { title: 'Cell Editing', url: `${baseUrl}/cell-editing/` },
      { title: 'Cell Editors', url: `${baseUrl}/cell-editors/` }
    ],
    'master-detail': [
      { title: 'Master Detail', url: `${baseUrl}/master-detail/` }
    ],
    'tree-data': [
      { title: 'Tree Data', url: `${baseUrl}/tree-data/` }
    ],
    'pivoting': [
      { title: 'Pivoting', url: `${baseUrl}/pivoting/` }
    ],
    'grouping': [
      { title: 'Row Grouping', url: `${baseUrl}/grouping/` }
    ],
    'charts': [
      { title: 'Integrated Charts', url: `${baseUrl}/integrated-charts/` }
    ]
  };

  return docs[feature as keyof typeof docs] || [
    { title: 'AG-Grid Documentation', url: baseUrl }
  ];
}

function getAdditionalConfiguration(feature: string, framework: string): string {
  const configs = {
    'row-selection': 'You can also configure selection with checkboxes by adding `checkboxSelection: true` to column definitions.',
    'sorting': 'Use `multiSortKey: "ctrl"` to enable multi-column sorting with Ctrl+click.',
    'filtering': 'Add `floatingFilter: true` to show floating filters below column headers.',
    'pagination': 'Customize page size options with `paginationPageSizeSelector: [10, 25, 50, 100]`.',
    'editing': 'Use different cell editors like `cellEditor: "agSelectCellEditor"` for dropdown editing.',
    'master-detail': 'Configure the detail grid options and data retrieval function in `detailCellRendererParams`.',
    'tree-data': 'Ensure your data has a proper hierarchy structure with parent-child relationships.',
    'pivoting': 'Define which columns to pivot, group, and aggregate in your column definitions.',
    'grouping': 'Add aggregation functions like `aggFunc: "sum"` to value columns.',
    'charts': 'Enable charts with `enableCharts: true` and configure chart themes.'
  };

  return configs[feature as keyof typeof configs] || 'Refer to the documentation for additional configuration options.';
}

function getUseCases(feature: string): string {
  const useCases = {
    'row-selection': '- Bulk operations on selected rows\n- Data analysis and reporting\n- Delete or modify multiple records',
    'sorting': '- Data exploration and analysis\n- Finding top/bottom values\n- Organizing data by importance',
    'filtering': '- Data search and discovery\n- Hiding irrelevant information\n- Creating focused views',
    'pagination': '- Handling large datasets\n- Improving page load performance\n- Better mobile experience',
    'editing': '- Data entry and maintenance\n- Quick corrections and updates\n- Inline form editing',
    'master-detail': '- Hierarchical data display\n- Detailed information views\n- Related data exploration',
    'tree-data': '- Organizational charts\n- File system browsers\n- Category hierarchies',
    'pivoting': '- Business intelligence dashboards\n- Data summarization\n- Cross-tabulation analysis',
    'grouping': '- Data categorization\n- Summary reports\n- Hierarchical analysis',
    'charts': '- Data visualization\n- Trend analysis\n- Interactive reporting'
  };

  return useCases[feature as keyof typeof useCases] || 'Common use cases will depend on your specific application needs.';
}

function getRelatedFeatures(feature: string): string {
  const related = {
    'row-selection': 'Range Selection, Context Menu, Clipboard',
    'sorting': 'Filtering, Grouping, Status Bar',
    'filtering': 'Sorting, Tool Panel, Quick Filter',
    'pagination': 'Infinite Scrolling, Server-Side Operations',
    'editing': 'Cell Validation, Undo/Redo, Clipboard',
    'master-detail': 'Tree Data, Row Grouping, Full Width Rows',
    'tree-data': 'Row Grouping, Master Detail, Lazy Loading',
    'pivoting': 'Row Grouping, Aggregation, Charts',
    'grouping': 'Pivoting, Aggregation, Tree Data',
    'charts': 'Range Selection, Pivoting, Excel Export'
  };

  return related[feature as keyof typeof related] || 'Check the documentation for related features.';
}

function getTroubleshootingTips(feature: string): string {
  const tips = {
    'row-selection': '- Ensure `rowSelection` is set to "single" or "multiple"\n- Check if `suppressRowClickSelection` is interfering\n- Verify row data has unique IDs',
    'sorting': '- Make sure `sortable: true` is set on columns\n- Check if custom comparators are working correctly\n- Verify data types are consistent',
    'filtering': '- Ensure `filter: true` is set on columns\n- Check filter types match data types\n- Verify custom filter implementations',
    'pagination': '- Check if `pagination: true` is set\n- Verify page size is appropriate for data volume\n- Ensure pagination controls are visible',
    'editing': '- Verify `editable: true` is set on columns\n- Check cell editor types match data types\n- Ensure value parsers handle input correctly',
    'master-detail': '- Verify Enterprise license is active\n- Check detail data structure and retrieval\n- Ensure proper template configuration',
    'pivoting': '- Verify Enterprise license is active\n- Check pivot/rowGroup/values configuration\n- Ensure data supports pivoting structure',
    'charts': '- Verify Enterprise license is active\n- Check if `enableCharts: true` is set\n- Ensure chart data is properly selected'
  };

  return tips[feature as keyof typeof tips] || 'Refer to the documentation and community forums for troubleshooting help.';
}