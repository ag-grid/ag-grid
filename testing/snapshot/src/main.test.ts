import * as prettier from 'prettier';
import * as formatHtml from 'prettier-plugin-organize-attributes';
import { describe, expect, it } from 'vitest';

import { AllCommunityModule, GridOptions, createGrid } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('Grid HTML Snapshot', () => {
    it('should match the grid HTML structure', async () => {
        // Create a mock HTML container for the grid
        const gridHtml = document.createElement('div');
        gridHtml.id = 'root';

        // Define grid options
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'make' },
                { field: 'model' },
                { headerName: 'Tests', children: [{ field: 'price' }, { field: 'model' }] },
            ],
            rowData: [
                { make: 'Toyota', model: 'Celica', price: 35000 },
                { make: 'Porsche', model: 'Boxster', price: 72000 },
            ],
        };

        // Create the grid
        createGrid(gridHtml, gridOptions, { modules: [AllEnterpriseModule] });

        // Assert that the grid's HTML matches the snapshot
        const result = await prettier.format(gridHtml.innerHTML.toString(), {
            parser: 'html',
            singleAttributePerLine: true,
            plugins: [formatHtml],
        });
        await expect(result).toMatchFileSnapshot('./__snapshots__/grid_enterprise_dom1.html');
    });
});
