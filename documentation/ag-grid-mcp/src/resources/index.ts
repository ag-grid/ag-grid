import { Resource } from '@modelcontextprotocol/sdk/types.js';

export async function getResources(): Promise<Resource[]> {
  return [
    // Core documentation
    {
      uri: 'ag-grid://docs/getting-started',
      name: 'Getting Started Guide',
      description: 'Complete getting started guide for AG-Grid',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/installation',
      name: 'Installation Guide',
      description: 'Installation instructions for AG-Grid',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/key-features',
      name: 'Key Features',
      description: 'Overview of key AG-Grid features',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/configuration',
      name: 'Configuration',
      description: 'How to configure AG-Grid',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grid-options',
      name: 'Grid Options Reference',
      description: 'Complete reference for grid configuration options',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grid-api',
      name: 'Grid API Reference',
      description: 'Complete reference for grid API methods',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grid-events',
      name: 'Grid Events Reference',
      description: 'Complete reference for grid events',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grid-interface',
      name: 'Grid Interface',
      description: 'Grid interface documentation',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grid-lifecycle',
      name: 'Grid Lifecycle',
      description: 'Understanding the grid lifecycle',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grid-size',
      name: 'Grid Size',
      description: 'Setting and managing grid dimensions',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grid-state',
      name: 'Grid State',
      description: 'Managing grid state',
      mimeType: 'text/markdown'
    },
    
    // Column documentation
    {
      uri: 'ag-grid://docs/column-definitions',
      name: 'Column Definitions Reference',
      description: 'Complete reference for column definitions',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-api',
      name: 'Column API',
      description: 'Column API reference',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-events',
      name: 'Column Events',
      description: 'Column events documentation',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-groups',
      name: 'Column Groups',
      description: 'How to group columns',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-headers',
      name: 'Column Headers',
      description: 'Customizing column headers',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-interface',
      name: 'Column Interface',
      description: 'Column interface documentation',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-menu',
      name: 'Column Menu',
      description: 'Column menu configuration',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-moving',
      name: 'Column Moving',
      description: 'Moving columns around',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-object',
      name: 'Column Object',
      description: 'Column object reference',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-object-group',
      name: 'Column Object Group',
      description: 'Column group object reference',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-pinning',
      name: 'Column Pinning',
      description: 'Pinning columns to left or right',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-properties',
      name: 'Column Properties',
      description: 'All column properties reference',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-sizing',
      name: 'Column Sizing',
      description: 'Column width and sizing options',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-spanning',
      name: 'Column Spanning',
      description: 'Spanning columns across multiple cells',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-state',
      name: 'Column State',
      description: 'Managing column state',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/column-updating-definitions',
      name: 'Column Updating Definitions',
      description: 'Updating column definitions dynamically',
      mimeType: 'text/markdown'
    },
    
    // Cell documentation
    {
      uri: 'ag-grid://docs/cell-content',
      name: 'Cell Content',
      description: 'Managing cell content',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-data-types',
      name: 'Cell Data Types',
      description: 'Data types for cells',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-editing',
      name: 'Cell Editing',
      description: 'Cell editing overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-editing-batch',
      name: 'Cell Editing Batch',
      description: 'Batch editing of cells',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-editing-full-row',
      name: 'Cell Editing Full Row',
      description: 'Full row editing',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-editing-start-stop',
      name: 'Cell Editing Start Stop',
      description: 'Starting and stopping cell editing',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-editing-validation',
      name: 'Cell Editing Validation',
      description: 'Validating cell edits',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-editors',
      name: 'Cell Editors',
      description: 'Custom cell editors',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-expressions',
      name: 'Cell Expressions',
      description: 'Using expressions in cells',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-selection',
      name: 'Cell Selection',
      description: 'Cell selection overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-selection-api-reference',
      name: 'Cell Selection API Reference',
      description: 'Cell selection API methods',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-selection-fill-handle',
      name: 'Cell Selection Fill Handle',
      description: 'Fill handle for cell selection',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-selection-handle',
      name: 'Cell Selection Handle',
      description: 'Cell selection handle',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-styles',
      name: 'Cell Styles',
      description: 'Styling cells',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/cell-text-selection',
      name: 'Cell Text Selection',
      description: 'Text selection within cells',
      mimeType: 'text/markdown'
    },
    
    // Row documentation
    {
      uri: 'ag-grid://docs/row-models',
      name: 'Row Models',
      description: 'Different row models available',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-animation',
      name: 'Row Animation',
      description: 'Animating row changes',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-dragging',
      name: 'Row Dragging',
      description: 'Dragging rows around',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-dragging-to-external-dropzone',
      name: 'Row Dragging to External Dropzone',
      description: 'Dragging rows to external dropzones',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-dragging-to-grid',
      name: 'Row Dragging to Grid',
      description: 'Dragging rows between grids',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-events',
      name: 'Row Events',
      description: 'Row events reference',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-height',
      name: 'Row Height',
      description: 'Setting row heights',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-ids',
      name: 'Row IDs',
      description: 'Setting up row IDs',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-interface',
      name: 'Row Interface',
      description: 'Row interface documentation',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-numbers',
      name: 'Row Numbers',
      description: 'Displaying row numbers',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-object',
      name: 'Row Object',
      description: 'Row object reference',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-pagination',
      name: 'Row Pagination',
      description: 'Pagination for rows',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-pinning',
      name: 'Row Pinning',
      description: 'Pinning rows to top or bottom',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-selection',
      name: 'Row Selection',
      description: 'Row selection overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-selection-api-reference',
      name: 'Row Selection API Reference',
      description: 'Row selection API methods',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-selection-multi-row',
      name: 'Row Selection Multi Row',
      description: 'Multi-row selection',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-selection-single-row',
      name: 'Row Selection Single Row',
      description: 'Single row selection',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-sorting',
      name: 'Row Sorting',
      description: 'Sorting rows',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-spanning',
      name: 'Row Spanning',
      description: 'Spanning rows across multiple cells',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/row-styles',
      name: 'Row Styles',
      description: 'Styling rows',
      mimeType: 'text/markdown'
    },
    
    // Data updates
    {
      uri: 'ag-grid://docs/data-update',
      name: 'Data Update',
      description: 'Updating data in the grid',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/data-update-high-frequency',
      name: 'Data Update High Frequency',
      description: 'High frequency data updates',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/data-update-row-data',
      name: 'Data Update Row Data',
      description: 'Updating row data',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/data-update-single-row-cell',
      name: 'Data Update Single Row Cell',
      description: 'Updating single row or cell',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/data-update-transactions',
      name: 'Data Update Transactions',
      description: 'Transaction-based data updates',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/accessing-data',
      name: 'Accessing Data',
      description: 'How to access data in the grid',
      mimeType: 'text/markdown'
    },
    
    // Filtering
    {
      uri: 'ag-grid://docs/filtering',
      name: 'Filtering',
      description: 'Filtering overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filtering-overview',
      name: 'Filtering Overview',
      description: 'Overview of filtering features',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-advanced',
      name: 'Filter Advanced',
      description: 'Advanced filtering options',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-api',
      name: 'Filter API',
      description: 'Filter API reference',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-applying',
      name: 'Filter Applying',
      description: 'Applying filters',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-conditions',
      name: 'Filter Conditions',
      description: 'Filter conditions',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-date',
      name: 'Filter Date',
      description: 'Date filtering',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-external',
      name: 'Filter External',
      description: 'External filtering',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-multi',
      name: 'Filter Multi',
      description: 'Multi-column filtering',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-number',
      name: 'Filter Number',
      description: 'Number filtering',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-quick',
      name: 'Filter Quick',
      description: 'Quick filtering',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-set',
      name: 'Filter Set',
      description: 'Set filtering',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-set-api',
      name: 'Filter Set API',
      description: 'Set filter API',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-set-data-updates',
      name: 'Filter Set Data Updates',
      description: 'Set filter data updates',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-set-excel-mode',
      name: 'Filter Set Excel Mode',
      description: 'Excel-style set filtering',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-set-filter-list',
      name: 'Filter Set Filter List',
      description: 'Set filter list',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-set-mini-filter',
      name: 'Filter Set Mini Filter',
      description: 'Mini filter for set filter',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-set-tree-list',
      name: 'Filter Set Tree List',
      description: 'Tree list for set filter',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/filter-text',
      name: 'Filter Text',
      description: 'Text filtering',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/floating-filters',
      name: 'Floating Filters',
      description: 'Floating filters',
      mimeType: 'text/markdown'
    },
    
    // Components
    {
      uri: 'ag-grid://docs/components',
      name: 'Components',
      description: 'Custom components overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/component-cell-renderer',
      name: 'Component Cell Renderer',
      description: 'Custom cell renderer components',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/component-filter',
      name: 'Component Filter',
      description: 'Custom filter components',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/component-filter-legacy',
      name: 'Component Filter Legacy',
      description: 'Legacy filter components',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/component-floating-filter',
      name: 'Component Floating Filter',
      description: 'Custom floating filter components',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/component-floating-filter-legacy',
      name: 'Component Floating Filter Legacy',
      description: 'Legacy floating filter components',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/component-loading-cell-renderer',
      name: 'Component Loading Cell Renderer',
      description: 'Loading cell renderer components',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/component-menu-item',
      name: 'Component Menu Item',
      description: 'Custom menu item components',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/component-tool-panel',
      name: 'Component Tool Panel',
      description: 'Custom tool panel components',
      mimeType: 'text/markdown'
    },
    
    // Cell editors
    {
      uri: 'ag-grid://docs/provided-cell-editors',
      name: 'Provided Cell Editors',
      description: 'Built-in cell editors',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/provided-cell-editors-checkbox',
      name: 'Provided Cell Editors Checkbox',
      description: 'Checkbox cell editor',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/provided-cell-editors-date',
      name: 'Provided Cell Editors Date',
      description: 'Date cell editor',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/provided-cell-editors-large-text',
      name: 'Provided Cell Editors Large Text',
      description: 'Large text cell editor',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/provided-cell-editors-number',
      name: 'Provided Cell Editors Number',
      description: 'Number cell editor',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/provided-cell-editors-rich-select',
      name: 'Provided Cell Editors Rich Select',
      description: 'Rich select cell editor',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/provided-cell-editors-select',
      name: 'Provided Cell Editors Select',
      description: 'Select cell editor',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/provided-cell-editors-text',
      name: 'Provided Cell Editors Text',
      description: 'Text cell editor',
      mimeType: 'text/markdown'
    },
    
    // Grouping
    {
      uri: 'ag-grid://docs/grouping',
      name: 'Grouping',
      description: 'Row grouping overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grouping-custom-group-columns',
      name: 'Grouping Custom Group Columns',
      description: 'Custom group columns',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grouping-data',
      name: 'Grouping Data',
      description: 'Grouping data',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grouping-display-types',
      name: 'Grouping Display Types',
      description: 'Group display types',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grouping-group-panel',
      name: 'Grouping Group Panel',
      description: 'Group panel for grouping',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grouping-group-rows',
      name: 'Grouping Group Rows',
      description: 'Group rows',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grouping-multiple-group-columns',
      name: 'Grouping Multiple Group Columns',
      description: 'Multiple group columns',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grouping-opening-groups',
      name: 'Grouping Opening Groups',
      description: 'Opening and closing groups',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grouping-row-selection',
      name: 'Grouping Row Selection',
      description: 'Row selection with grouping',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grouping-single-group-column',
      name: 'Grouping Single Group Column',
      description: 'Single group column',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/grouping-sorting',
      name: 'Grouping Sorting',
      description: 'Sorting with grouping',
      mimeType: 'text/markdown'
    },
    
    // Aggregation
    {
      uri: 'ag-grid://docs/aggregation',
      name: 'Aggregation',
      description: 'Data aggregation overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/aggregation-columns',
      name: 'Aggregation Columns',
      description: 'Aggregation columns',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/aggregation-custom-functions',
      name: 'Aggregation Custom Functions',
      description: 'Custom aggregation functions',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/aggregation-filtering',
      name: 'Aggregation Filtering',
      description: 'Filtering with aggregation',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/aggregation-total-rows',
      name: 'Aggregation Total Rows',
      description: 'Total rows in aggregation',
      mimeType: 'text/markdown'
    },
    
    // Pivoting
    {
      uri: 'ag-grid://docs/pivoting',
      name: 'Pivoting',
      description: 'Data pivoting overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/pivoting-column-groups',
      name: 'Pivoting Column Groups',
      description: 'Column groups in pivoting',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/pivoting-result-columns',
      name: 'Pivoting Result Columns',
      description: 'Result columns in pivoting',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/pivoting-totals',
      name: 'Pivoting Totals',
      description: 'Totals in pivoting',
      mimeType: 'text/markdown'
    },
    
    // Server-side operations
    {
      uri: 'ag-grid://docs/server-side-model',
      name: 'Server-Side Model',
      description: 'Server-side row model overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-api-reference',
      name: 'Server-Side Model API Reference',
      description: 'Server-side model API',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-changing-columns',
      name: 'Server-Side Model Changing Columns',
      description: 'Changing columns in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-configuration',
      name: 'Server-Side Model Configuration',
      description: 'Configuring server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-datasource',
      name: 'Server-Side Model Datasource',
      description: 'Server-side model datasource',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-filtering',
      name: 'Server-Side Model Filtering',
      description: 'Filtering in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-grouping',
      name: 'Server-Side Model Grouping',
      description: 'Grouping in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-master-detail',
      name: 'Server-Side Model Master Detail',
      description: 'Master-detail in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-pagination',
      name: 'Server-Side Model Pagination',
      description: 'Pagination in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-pivoting',
      name: 'Server-Side Model Pivoting',
      description: 'Pivoting in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-retry',
      name: 'Server-Side Model Retry',
      description: 'Retry logic in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-row-height',
      name: 'Server-Side Model Row Height',
      description: 'Row height in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-selection',
      name: 'Server-Side Model Selection',
      description: 'Selection in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-sorting',
      name: 'Server-Side Model Sorting',
      description: 'Sorting in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-tree-data',
      name: 'Server-Side Model Tree Data',
      description: 'Tree data in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-updating',
      name: 'Server-Side Model Updating',
      description: 'Updating in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-updating-refresh',
      name: 'Server-Side Model Updating Refresh',
      description: 'Refreshing in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-updating-single-row',
      name: 'Server-Side Model Updating Single Row',
      description: 'Single row updates in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-model-updating-transactions',
      name: 'Server-Side Model Updating Transactions',
      description: 'Transaction updates in server-side model',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-operations-graphql',
      name: 'Server-Side Operations GraphQL',
      description: 'GraphQL server-side operations',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-operations-nodejs',
      name: 'Server-Side Operations NodeJS',
      description: 'NodeJS server-side operations',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-operations-oracle',
      name: 'Server-Side Operations Oracle',
      description: 'Oracle server-side operations',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/server-side-operations-spark',
      name: 'Server-Side Operations Spark',
      description: 'Spark server-side operations',
      mimeType: 'text/markdown'
    },
    
    // Excel export
    {
      uri: 'ag-grid://docs/excel-export',
      name: 'Excel Export',
      description: 'Excel export overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-api',
      name: 'Excel Export API',
      description: 'Excel export API',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-columns',
      name: 'Excel Export Columns',
      description: 'Excel export columns',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-customising-content',
      name: 'Excel Export Customising Content',
      description: 'Customizing Excel export content',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-data-types',
      name: 'Excel Export Data Types',
      description: 'Data types in Excel export',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-extra-content',
      name: 'Excel Export Extra Content',
      description: 'Extra content in Excel export',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-formulas',
      name: 'Excel Export Formulas',
      description: 'Formulas in Excel export',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-freeze',
      name: 'Excel Export Freeze',
      description: 'Freezing panes in Excel export',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-hyperlinks',
      name: 'Excel Export Hyperlinks',
      description: 'Hyperlinks in Excel export',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-images',
      name: 'Excel Export Images',
      description: 'Images in Excel export',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-master-detail',
      name: 'Excel Export Master Detail',
      description: 'Master-detail in Excel export',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-multiple-sheets',
      name: 'Excel Export Multiple Sheets',
      description: 'Multiple sheets in Excel export',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-page-setup',
      name: 'Excel Export Page Setup',
      description: 'Page setup in Excel export',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-rows',
      name: 'Excel Export Rows',
      description: 'Rows in Excel export',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-styles',
      name: 'Excel Export Styles',
      description: 'Styles in Excel export',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-export-tables',
      name: 'Excel Export Tables',
      description: 'Tables in Excel export',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/excel-import',
      name: 'Excel Import',
      description: 'Excel import functionality',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/csv-export',
      name: 'CSV Export',
      description: 'CSV export functionality',
      mimeType: 'text/markdown'
    },
    
    // Charts
    {
      uri: 'ag-grid://docs/integrated-charts',
      name: 'Integrated Charts',
      description: 'Integrated charts overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-api-cross-filter-chart',
      name: 'Integrated Charts API Cross Filter Chart',
      description: 'Cross filter chart API',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-api-downloading-image',
      name: 'Integrated Charts API Downloading Image',
      description: 'Downloading chart images',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-api-pivot-chart',
      name: 'Integrated Charts API Pivot Chart',
      description: 'Pivot chart API',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-api-range-chart',
      name: 'Integrated Charts API Range Chart',
      description: 'Range chart API',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-api-save-restore-charts',
      name: 'Integrated Charts API Save Restore Charts',
      description: 'Save and restore charts',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-application-created',
      name: 'Integrated Charts Application Created',
      description: 'Application created charts',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-chart-tool-panels',
      name: 'Integrated Charts Chart Tool Panels',
      description: 'Chart tool panels',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-chart-types',
      name: 'Integrated Charts Chart Types',
      description: 'Chart types',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-container',
      name: 'Integrated Charts Container',
      description: 'Chart container',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-customisation',
      name: 'Integrated Charts Customisation',
      description: 'Chart customization',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-events',
      name: 'Integrated Charts Events',
      description: 'Chart events',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-installation',
      name: 'Integrated Charts Installation',
      description: 'Chart installation',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-menu',
      name: 'Integrated Charts Menu',
      description: 'Chart menu',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-pivot-chart',
      name: 'Integrated Charts Pivot Chart',
      description: 'Pivot charts',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-range-chart',
      name: 'Integrated Charts Range Chart',
      description: 'Range charts',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-time-series',
      name: 'Integrated Charts Time Series',
      description: 'Time series charts',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/integrated-charts-user-created',
      name: 'Integrated Charts User Created',
      description: 'User created charts',
      mimeType: 'text/markdown'
    },
    
    // Sparklines
    {
      uri: 'ag-grid://docs/sparklines-overview',
      name: 'Sparklines Overview',
      description: 'Sparklines overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-api-sparkline-area',
      name: 'Sparklines API Sparkline Area',
      description: 'Area sparkline API',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-api-sparkline-bar',
      name: 'Sparklines API Sparkline Bar',
      description: 'Bar sparkline API',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-api-sparkline-line',
      name: 'Sparklines API Sparkline Line',
      description: 'Line sparkline API',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-api-sparkline-options',
      name: 'Sparklines API Sparkline Options',
      description: 'Sparkline options API',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-area-customisation',
      name: 'Sparklines Area Customisation',
      description: 'Area sparkline customization',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-axis-types',
      name: 'Sparklines Axis Types',
      description: 'Sparkline axis types',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-bar-customisation',
      name: 'Sparklines Bar Customisation',
      description: 'Bar sparkline customization',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-column-customisation',
      name: 'Sparklines Column Customisation',
      description: 'Column sparkline customization',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-data',
      name: 'Sparklines Data',
      description: 'Sparkline data',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-installation',
      name: 'Sparklines Installation',
      description: 'Sparkline installation',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-line-customisation',
      name: 'Sparklines Line Customisation',
      description: 'Line sparkline customization',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-points-of-interest',
      name: 'Sparklines Points of Interest',
      description: 'Sparkline points of interest',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/sparklines-tooltips',
      name: 'Sparklines Tooltips',
      description: 'Sparkline tooltips',
      mimeType: 'text/markdown'
    },
    
    // Theming
    {
      uri: 'ag-grid://docs/themes',
      name: 'Themes',
      description: 'Theme overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-borders',
      name: 'Theming Borders',
      description: 'Theme borders',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-colors',
      name: 'Theming Colors',
      description: 'Theme colors',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-compactness',
      name: 'Theming Compactness',
      description: 'Theme compactness',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-css',
      name: 'Theming CSS',
      description: 'Theme CSS',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-distribution',
      name: 'Theming Distribution',
      description: 'Theme distribution',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-fonts',
      name: 'Theming Fonts',
      description: 'Theme fonts',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-headers',
      name: 'Theming Headers',
      description: 'Theme headers',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-migration',
      name: 'Theming Migration',
      description: 'Theme migration',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-parameters',
      name: 'Theming Parameters',
      description: 'Theme parameters',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-parts',
      name: 'Theming Parts',
      description: 'Theme parts',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-popups',
      name: 'Theming Popups',
      description: 'Theme popups',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-selections',
      name: 'Theming Selections',
      description: 'Theme selections',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/theming-tool-panels',
      name: 'Theming Tool Panels',
      description: 'Theme tool panels',
      mimeType: 'text/markdown'
    },
    
    // Master-detail
    {
      uri: 'ag-grid://docs/master-detail',
      name: 'Master Detail',
      description: 'Master-detail overview',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/master-detail-custom-detail',
      name: 'Master Detail Custom Detail',
      description: 'Custom detail grids',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/master-detail-grids',
      name: 'Master Detail Grids',
      description: 'Master-detail grids',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/master-detail-height',
      name: 'Master Detail Height',
      description: 'Master-detail height',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/master-detail-master-rows',
      name: 'Master Detail Master Rows',
      description: 'Master rows',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/master-detail-nesting',
      name: 'Master Detail Nesting',
      description: 'Nesting master-detail',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/master-detail-other',
      name: 'Master Detail Other',
      description: 'Other master-detail features',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/master-detail-refresh',
      name: 'Master Detail Refresh',
      description: 'Refreshing master-detail',
      mimeType: 'text/markdown'
    },
    
    // Other features
    {
      uri: 'ag-grid://docs/infinite-scrolling',
      name: 'Infinite Scrolling',
      description: 'Infinite scrolling',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/full-width-rows',
      name: 'Full Width Rows',
      description: 'Full width rows',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/clipboard',
      name: 'Clipboard',
      description: 'Clipboard operations',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/context-menu',
      name: 'Context Menu',
      description: 'Context menu',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/context',
      name: 'Context',
      description: 'Grid context',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/custom-icons',
      name: 'Custom Icons',
      description: 'Custom icons',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/drag-and-drop',
      name: 'Drag and Drop',
      description: 'Drag and drop',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/find',
      name: 'Find',
      description: 'Find functionality',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/keyboard-navigation',
      name: 'Keyboard Navigation',
      description: 'Keyboard navigation',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/localisation',
      name: 'Localisation',
      description: 'Localisation and internationalization',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/overlays',
      name: 'Overlays',
      description: 'Loading and no rows overlays',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/printing',
      name: 'Printing',
      description: 'Printing the grid',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/reference-data',
      name: 'Reference Data',
      description: 'Reference data',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/rtl',
      name: 'RTL',
      description: 'Right-to-left support',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/saving-content',
      name: 'Saving Content',
      description: 'Saving grid content',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/scrolling-performance',
      name: 'Scrolling Performance',
      description: 'Optimizing scrolling performance',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/security',
      name: 'Security',
      description: 'Security considerations',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/side-bar',
      name: 'Side Bar',
      description: 'Side bar',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/status-bar',
      name: 'Status Bar',
      description: 'Status bar',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/supported-browsers',
      name: 'Supported Browsers',
      description: 'Supported browsers',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/testing',
      name: 'Testing',
      description: 'Testing the grid',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/testing-async',
      name: 'Testing Async',
      description: 'Testing async operations',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/accessibility',
      name: 'Accessibility',
      description: 'Accessibility features',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/ag-grid-design-system',
      name: 'AG Grid Design System',
      description: 'AG Grid design system',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/aligned-grids',
      name: 'Aligned Grids',
      description: 'Aligned grids',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/angular-ngzone',
      name: 'Angular NgZone',
      description: 'Angular NgZone considerations',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/change-cell-renderers',
      name: 'Change Cell Renderers',
      description: 'Change cell renderers',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/change-detection',
      name: 'Change Detection',
      description: 'Change detection',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/codemods',
      name: 'Codemods',
      description: 'Codemods for migration',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/community-vs-enterprise',
      name: 'Community vs Enterprise',
      description: 'Community vs Enterprise features',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/compatibility',
      name: 'Compatibility',
      description: 'Compatibility information',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/deep-dive',
      name: 'Deep Dive',
      description: 'Deep dive into AG Grid',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/dom-virtualisation',
      name: 'DOM Virtualisation',
      description: 'DOM virtualization',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/license-install',
      name: 'License Install',
      description: 'Installing enterprise license',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/massive-row-count',
      name: 'Massive Row Count',
      description: 'Handling massive row counts',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/migration',
      name: 'Migration',
      description: 'Migration guide',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/modules',
      name: 'Modules',
      description: 'Modular imports',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/react-hooks',
      name: 'React Hooks',
      description: 'React hooks',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/reference',
      name: 'Reference',
      description: 'API reference',
      mimeType: 'text/markdown'
    },
    {
      uri: 'ag-grid://docs/solidjs',
      name: 'SolidJS',
      description: 'SolidJS integration',
      mimeType: 'text/markdown'
    },
    
    // Examples
    {
      uri: 'ag-grid://examples/basic',
      name: 'Basic Grid Examples',
      description: 'Basic grid setup examples for all frameworks',
      mimeType: 'application/json'
    },
    {
      uri: 'ag-grid://examples/features',
      name: 'Feature Examples',
      description: 'Examples demonstrating various AG-Grid features',
      mimeType: 'application/json'
    },
    
    // Troubleshooting
    {
      uri: 'ag-grid://troubleshooting/common-issues',
      name: 'Common Issues & Solutions',
      description: 'Common problems and their solutions',
      mimeType: 'text/markdown'
    },
    
    // Migration
    {
      uri: 'ag-grid://migration/latest',
      name: 'Migration Guide',
      description: 'Guide for migrating between AG-Grid versions',
      mimeType: 'text/markdown'
    },
    
    // Performance
    {
      uri: 'ag-grid://performance/optimization',
      name: 'Performance Optimization Guide',
      description: 'Best practices for optimizing grid performance',
      mimeType: 'text/markdown'
    }
  ];
}

export async function handleReadResource(uri: string): Promise<{ contents: Array<{ type: string; text: string }> }> {
  try {
    const content = await getResourceContent(uri);
    return {
      contents: [
        {
          type: 'text',
          text: content
        }
      ]
    };
  } catch (error) {
    throw new Error(`Failed to read resource ${uri}: ${error}`);
  }
}

async function getResourceContent(uri: string): Promise<string> {
  const urlParts = uri.replace('ag-grid://', '').split('/');
  const category = urlParts[0];
  const resource = urlParts[1];

  switch (category) {
    case 'docs':
      return await getDocumentationContent(resource);
    case 'examples':
      return await getExampleContent(resource);
    case 'troubleshooting':
      return await getTroubleshootingContent(resource);
    case 'migration':
      return await getMigrationContent(resource);
    case 'performance':
      return await getPerformanceContent(resource);
    default:
      throw new Error(`Unknown resource category: ${category}`);
  }
}

async function getDocumentationContent(resource: string): Promise<string> {
  switch (resource) {
    case 'getting-started':
      return `# AG-Grid Getting Started Guide

## Overview
AG-Grid is a feature-rich data grid built for enterprise applications. It supports multiple frameworks and provides both community and enterprise features.

## Installation

### React
\`\`\`bash
npm install ag-grid-react ag-grid-community
\`\`\`

### Angular
\`\`\`bash
npm install ag-grid-angular ag-grid-community
\`\`\`

### Vue
\`\`\`bash
npm install ag-grid-vue3 ag-grid-community
\`\`\`

### Vanilla JavaScript
\`\`\`bash
npm install ag-grid-community
\`\`\`

## Basic Setup

The basic setup involves:
1. Installing the appropriate packages
2. Importing required CSS files
3. Setting up the grid component
4. Configuring column definitions
5. Providing row data

## Next Steps
- Configure column definitions for your data
- Add features like sorting, filtering, and pagination
- Customize the grid appearance with themes
- Implement data binding for dynamic updates

## Documentation Links
- [Official Documentation](https://www.ag-grid.com/documentation/)
- [API Reference](https://www.ag-grid.com/documentation/api/)
- [Examples](https://www.ag-grid.com/example/)`;

    case 'column-definitions':
      return `# Column Definitions Reference

## Overview
Column definitions configure how data is displayed and interacted with in AG-Grid.

## Basic Properties

### Essential Properties
- \`field\`: The key from your data object
- \`headerName\`: Display name for the column header
- \`width\`: Column width in pixels
- \`type\`: Data type (text, number, date, boolean)

### Common Properties
- \`sortable\`: Enable/disable sorting
- \`filter\`: Enable filtering or specify filter type
- \`editable\`: Allow cell editing
- \`resizable\`: Allow column resizing
- \`hide\`: Hide the column

## Advanced Properties

### Cell Rendering
- \`cellRenderer\`: Custom component for cell display
- \`cellRendererParams\`: Parameters for cell renderer
- \`valueFormatter\`: Format display values
- \`valueGetter\`: Custom value calculation

### Cell Editing
- \`cellEditor\`: Custom editor component
- \`cellEditorParams\`: Parameters for cell editor
- \`valueParser\`: Parse edited values
- \`valueSetter\`: Custom value setting

### Filtering
- \`filter\`: Filter type or boolean
- \`filterParams\`: Filter configuration
- \`floatingFilter\`: Show floating filter

### Styling
- \`cellStyle\`: Static cell styles
- \`cellStyleRules\`: Conditional cell styles
- \`cellClass\`: CSS classes for cells
- \`cellClassRules\`: Conditional CSS classes

## Filter Types
- \`agTextColumnFilter\`: Text filtering
- \`agNumberColumnFilter\`: Number filtering
- \`agDateColumnFilter\`: Date filtering
- \`agSetColumnFilter\`: Set filtering (Enterprise)

## Examples

### Basic Column Definition
\`\`\`javascript
{
  field: 'name',
  headerName: 'Full Name',
  width: 150,
  sortable: true,
  filter: 'agTextColumnFilter'
}
\`\`\`

### Number Column with Formatting
\`\`\`javascript
{
  field: 'price',
  headerName: 'Price',
  type: 'number',
  valueFormatter: params => '$' + params.value.toFixed(2),
  filter: 'agNumberColumnFilter'
}
\`\`\`

### Date Column
\`\`\`javascript
{
  field: 'date',
  headerName: 'Date',
  type: 'date',
  valueFormatter: params => new Date(params.value).toLocaleDateString(),
  filter: 'agDateColumnFilter'
}
\`\`\``;

    case 'grid-options':
      return `# Grid Options Reference

## Overview
Grid options configure the overall behavior and appearance of the AG-Grid.

## Data Options
- \`rowData\`: Array of data objects
- \`columnDefs\`: Column definitions array
- \`defaultColDef\`: Default properties for all columns

## Row Model Options
- \`rowModelType\`: 'clientSide' | 'serverSide' | 'infinite' | 'viewport'
- \`pagination\`: Enable pagination
- \`paginationPageSize\`: Rows per page
- \`paginationPageSizeSelector\`: Page size options

## Selection Options
- \`rowSelection\`: 'single' | 'multiple'
- \`rowMultiSelectWithClick\`: Allow multi-select with click
- \`suppressRowClickSelection\`: Disable row selection on click

## Editing Options
- \`editType\`: 'fullRow' | undefined
- \`suppressClickEdit\`: Disable edit on click
- \`stopEditingWhenCellsLoseFocus\`: Stop editing when focus lost

## Styling Options
- \`animateRows\`: Animate row updates
- \`rowHeight\`: Default row height
- \`headerHeight\`: Header height
- \`getRowStyle\`: Function for row styling
- \`getRowClass\`: Function for row CSS classes

## Performance Options
- \`suppressAnimationFrame\`: Disable animation frame
- \`suppressColumnVirtualisation\`: Disable column virtualization
- \`suppressRowVirtualisation\`: Disable row virtualization

## Event Handlers
- \`onGridReady\`: Grid initialization complete
- \`onCellClicked\`: Cell click events
- \`onSelectionChanged\`: Selection change events
- \`onSortChanged\`: Sort change events
- \`onFilterChanged\`: Filter change events

## Enterprise Options (Requires License)
- \`enableCharts\`: Enable integrated charts
- \`sideBar\`: Configure side panel
- \`statusBar\`: Configure status bar
- \`masterDetail\`: Enable master-detail
- \`treeData\`: Enable tree data display

## Example Configuration
\`\`\`javascript
const gridOptions = {
  columnDefs: columnDefs,
  rowData: rowData,
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true
  },
  pagination: true,
  paginationPageSize: 20,
  rowSelection: 'multiple',
  animateRows: true,
  onGridReady: (params) => {
    console.log('Grid is ready');
  },
  onSelectionChanged: (event) => {
    console.log('Selection changed');
  }
};
\`\`\``;

    default:
      throw new Error(`Unknown documentation resource: ${resource}`);
  }
}

async function getExampleContent(resource: string): Promise<string> {
  switch (resource) {
    case 'basic':
      return JSON.stringify({
        react: {
          title: 'Basic React Grid',
          description: 'Simple grid setup with React',
          code: `import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

function BasicGrid() {
  const [columnDefs] = useState([
    { field: 'make', headerName: 'Make' },
    { field: 'model', headerName: 'Model' },
    { field: 'price', headerName: 'Price' }
  ]);

  const [rowData] = useState([
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 }
  ]);

  return (
    <div className="ag-theme-quartz" style={{ height: 400, width: 600 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
      />
    </div>
  );
}`
        },
        angular: {
          title: 'Basic Angular Grid',
          description: 'Simple grid setup with Angular',
          code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-basic-grid',
  template: \`
    <ag-grid-angular
      class="ag-theme-quartz"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      style="height: 400px; width: 600px;">
    </ag-grid-angular>
  \`
})
export class BasicGridComponent {
  columnDefs = [
    { field: 'make', headerName: 'Make' },
    { field: 'model', headerName: 'Model' },
    { field: 'price', headerName: 'Price' }
  ];

  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 }
  ];
}`
        }
      }, null, 2);

    case 'features':
      return JSON.stringify({
        sorting: {
          title: 'Grid with Sorting',
          description: 'Enable sorting on columns',
          gridOptions: {
            defaultColDef: {
              sortable: true
            }
          }
        },
        filtering: {
          title: 'Grid with Filtering',
          description: 'Enable filtering on columns',
          gridOptions: {
            defaultColDef: {
              filter: true
            }
          }
        },
        pagination: {
          title: 'Grid with Pagination',
          description: 'Enable pagination for large datasets',
          gridOptions: {
            pagination: true,
            paginationPageSize: 10
          }
        }
      }, null, 2);

    default:
      throw new Error(`Unknown example resource: ${resource}`);
  }
}

async function getTroubleshootingContent(resource: string): Promise<string> {
  switch (resource) {
    case 'common-issues':
      return `# Common Issues & Solutions

## Grid Not Displaying

### Problem
Grid shows as empty or very small

### Solutions
1. Ensure CSS files are imported:
   \`\`\`css
   import 'ag-grid-community/styles/ag-grid.css';
   import 'ag-grid-community/styles/ag-theme-quartz.css';
   \`\`\`

2. Set explicit height and width:
   \`\`\`css
   .ag-theme-quartz {
     height: 400px;
     width: 100%;
   }
   \`\`\`

3. Verify theme class is applied to grid container

## Data Not Loading

### Problem
Grid displays but no data appears

### Solutions
1. Check rowData format - should be array of objects
2. Verify field names in columnDefs match data object keys
3. Ensure data is available when grid initializes
4. Check for JavaScript errors in console

## Column Definitions Issues

### Problem
Columns not displaying correctly

### Solutions
1. Verify columnDefs is an array
2. Check field names exist in data
3. Ensure proper column definition structure
4. Use headerName if field names are not user-friendly

## Performance Issues

### Problem
Grid is slow with large datasets

### Solutions
1. Enable pagination: \`pagination: true\`
2. Use server-side row model for very large datasets
3. Implement virtual scrolling
4. Optimize cell renderers
5. Consider column virtualization

## Styling Issues

### Problem
Grid doesn't match application theme

### Solutions
1. Customize CSS variables for theme colors
2. Use appropriate theme (quartz, alpine, balham, material)
3. Override specific CSS classes
4. Use cellStyle and rowStyle options

## React-Specific Issues

### Problem
Grid not updating when data changes

### Solutions
1. Ensure rowData is properly managed in state
2. Use immutable updates for data changes
3. Consider using gridApi.setRowData() for large updates
4. Check for proper key props in React

## Angular-Specific Issues

### Problem
Grid not initializing in Angular

### Solutions
1. Import AgGridModule in your module
2. Ensure component lifecycle is handled properly
3. Use Angular services for data management
4. Check for proper dependency injection

## License Issues

### Problem
Enterprise features not working

### Solutions
1. Verify ag-grid-enterprise is installed
2. Check license key is properly set
3. Ensure license is valid and not expired
4. Contact AG Grid support for license issues`;

    default:
      throw new Error(`Unknown troubleshooting resource: ${resource}`);
  }
}

async function getMigrationContent(resource: string): Promise<string> {
  switch (resource) {
    case 'latest':
      return `# Migration Guide - Latest Version

## Overview
This guide helps you migrate between AG-Grid versions safely.

## Before You Start
1. Read the changelog for your target version
2. Test in a development environment
3. Update one major version at a time
4. Back up your current implementation

## Common Migration Steps

### Update Dependencies
\`\`\`bash
npm update ag-grid-community ag-grid-react
# or for enterprise
npm update ag-grid-enterprise ag-grid-react
\`\`\`

### Breaking Changes
Check the changelog for breaking changes in:
- Grid Options
- Column Definitions
- API methods
- Event signatures
- CSS class names

### Property Renames
Some properties may have been renamed:
- Check deprecation warnings in console
- Update property names according to changelog
- Test functionality after changes

### API Changes
- Method signatures may have changed
- Some methods may have been deprecated
- New methods may be available

### CSS Updates
- Theme CSS file names may have changed
- New CSS variables may be available
- Some CSS classes may be deprecated

## Version-Specific Guides

### v33.x to v34.x
- No major breaking changes
- Some minor API improvements
- Enhanced TypeScript support

### v32.x to v33.x
- Updated column sizing behavior
- Improved filter API
- New theme enhancements

## Testing After Migration
1. Test core functionality
2. Verify all features work as expected
3. Check console for deprecation warnings
4. Test with different data sizes
5. Validate custom components still work

## Getting Help
- Check the official migration guide
- Visit the AG Grid community forum
- Contact support for enterprise customers
- Review GitHub issues for known problems`;

    default:
      throw new Error(`Unknown migration resource: ${resource}`);
  }
}

async function getPerformanceContent(resource: string): Promise<string> {
  switch (resource) {
    case 'optimization':
      return `# Performance Optimization Guide

## Overview
AG-Grid is designed for high performance, but there are many ways to optimize it further for your specific use case.

## Data Management

### Use Immutable Updates
- Update data immutably to trigger efficient re-renders
- Use gridApi.setRowData() for complete data replacement
- Use gridApi.applyTransaction() for incremental updates

### Optimize Data Structure
- Keep data objects flat when possible
- Avoid deeply nested objects
- Use consistent data types
- Pre-process data if needed

## Pagination and Virtualization

### Enable Pagination
\`\`\`javascript
gridOptions = {
  pagination: true,
  paginationPageSize: 100
};
\`\`\`

### Row Virtualization
- Enabled by default for large datasets
- Disable only if needed: \`suppressRowVirtualisation: true\`
- Adjust buffer sizes if needed

### Column Virtualization
- Enable for grids with many columns: \`suppressColumnVirtualisation: false\`
- Helps with horizontal scrolling performance

## Cell Rendering Optimization

### Avoid Complex Cell Renderers
- Keep cell renderers simple and fast
- Use built-in renderers when possible
- Cache expensive calculations

### Value Formatters vs Cell Renderers
- Use valueFormatter for simple formatting
- Use cellRenderer only for complex UI

## Server-Side Operations

### Use Server-Side Row Model
For datasets > 10,000 rows:
\`\`\`javascript
gridOptions = {
  rowModelType: 'serverSide',
  serverSideStoreType: 'partial',
  cacheBlockSize: 100
};
\`\`\`

### Implement Lazy Loading
- Load data on demand
- Implement proper caching strategy
- Use appropriate cache block sizes

## Memory Management

### Clean Up Resources
- Remove event listeners on component unmount
- Clear large datasets when not needed
- Dispose of grid API references

### Monitor Memory Usage
- Use browser dev tools to monitor memory
- Look for memory leaks in single-page applications
- Test with large datasets

## CSS and Styling

### Minimize CSS Overhead
- Use CSS classes instead of inline styles
- Avoid complex CSS selectors
- Cache style calculations

### Theme Selection
- Choose appropriate theme for your needs
- Consider custom themes for better performance
- Minimize CSS overrides

## Framework-Specific Optimizations

### React
- Use React.memo for cell renderers
- Optimize re-render cycles
- Use useCallback for event handlers

### Angular
- Use OnPush change detection strategy
- Optimize component lifecycle
- Use trackBy functions for lists

### Vue
- Use computed properties for derived data
- Optimize reactive data structures
- Use v-memo for expensive renders

## Measuring Performance

### Key Metrics
- Initial render time
- Scroll performance
- Filter response time
- Sort response time
- Data update performance

### Profiling Tools
- Browser dev tools
- AG Grid performance monitoring
- Custom timing measurements
- Memory usage tracking

## Common Performance Pitfalls

### Avoid These
- Frequent complete data refreshes
- Complex cell renderers with heavy calculations
- Synchronous data processing
- Memory leaks from event listeners
- Excessive DOM manipulation

### Best Practices
- Use appropriate row model for data size
- Implement proper data caching
- Optimize network requests
- Use lazy loading strategies
- Monitor and profile regularly`;

    default:
      throw new Error(`Unknown performance resource: ${resource}`);
  }
}