import { Resource } from '@modelcontextprotocol/sdk/types.js';

const DOCS_RESOURCES_URL = 'https://localhost:4610/mcp/resources.json';
// TODO: Get framework dynamically from context or configuration
const FRAMEWORK = 'react';

const getMarkdownUrl = ({ framework, pageName }: { framework: string; pageName: string }) => {
    return `https://localhost:4610/${framework}-data-grid/${pageName}.md`;
};

async function fetchJson(url: string): Promise<any> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch docs pages:', error);
        throw error;
    }
}

export async function getResources(): Promise<Resource[]> {
    const docsResources = await fetchJson(DOCS_RESOURCES_URL);

    return [
        ...docsResources,

        // Examples
        {
            uri: 'ag-grid://examples/basic',
            name: 'Basic Grid Examples',
            description: 'Basic grid setup examples for all frameworks',
            mimeType: 'application/json',
        },
        {
            uri: 'ag-grid://examples/features',
            name: 'Feature Examples',
            description: 'Examples demonstrating various AG-Grid features',
            mimeType: 'application/json',
        },

        // Troubleshooting
        {
            uri: 'ag-grid://troubleshooting/common-issues',
            name: 'Common Issues & Solutions',
            description: 'Common problems and their solutions',
            mimeType: 'text/markdown',
        },

        // Migration
        {
            uri: 'ag-grid://migration/latest',
            name: 'Migration Guide',
            description: 'Guide for migrating between AG-Grid versions',
            mimeType: 'text/markdown',
        },

        // Performance
        {
            uri: 'ag-grid://performance/optimization',
            name: 'Performance Optimization Guide',
            description: 'Best practices for optimizing grid performance',
            mimeType: 'text/markdown',
        },
    ];
}

export async function handleReadResource(uri: string): Promise<{ contents: Array<{ type: string; text: string }> }> {
    try {
        const content = await getResourceContent(uri);
        return {
            contents: [
                {
                    type: 'text',
                    text: content,
                },
            ],
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

async function getDocumentationContent(pageName: string): Promise<string> {
    try {
        const url = getMarkdownUrl({
            framework: FRAMEWORK,
            pageName,
        });
        const response = await fetch(url);
        const doc = await response.text();

        return doc;
    } catch (error) {
        throw new Error(`Unknown documentation pageName: ${pageName}`);
    }
}

async function getExampleContent(resource: string): Promise<string> {
    switch (resource) {
        case 'basic':
            return JSON.stringify(
                {
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
}`,
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
}`,
                    },
                },
                null,
                2
            );

        case 'features':
            return JSON.stringify(
                {
                    sorting: {
                        title: 'Grid with Sorting',
                        description: 'Enable sorting on columns',
                        gridOptions: {
                            defaultColDef: {
                                sortable: true,
                            },
                        },
                    },
                    filtering: {
                        title: 'Grid with Filtering',
                        description: 'Enable filtering on columns',
                        gridOptions: {
                            defaultColDef: {
                                filter: true,
                            },
                        },
                    },
                    pagination: {
                        title: 'Grid with Pagination',
                        description: 'Enable pagination for large datasets',
                        gridOptions: {
                            pagination: true,
                            paginationPageSize: 10,
                        },
                    },
                },
                null,
                2
            );

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
