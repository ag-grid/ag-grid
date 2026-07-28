import { describe, expect, it } from 'vitest';

import { buildMatrixTable } from './renderMatrixTable';
import { buildModuleMappingsTable } from './renderModuleMappings';

describe('buildMatrixTable', () => {
    it('renders headers, tick/cross cells and an Enterprise marker on the first column', () => {
        const data = [
            { name: 'Sorting', available: true },
            { name: 'Pivoting', available: false, enterprise: true },
        ];
        const output = buildMatrixTable(data, {
            columns: { name: 'Feature', available: 'Available' },
            cellRenderer: { available: 'tickCross' },
        });

        expect(output).toContain('| Feature | Available |');
        expect(output).toContain('| --- | --- |');
        expect(output).toContain('| Sorting | ✓ |');
        expect(output).toContain('| Pivoting (Enterprise) | ✗ |');
    });

    it('treats a missing featuresTickCross value as present', () => {
        const output = buildMatrixTable([{ name: 'X' }], {
            columns: { name: 'Feature', feat: 'Feature On' },
            cellRenderer: { feat: 'featuresTickCross' },
        });
        expect(output).toContain('| X | ✓ |');
    });

    it('passes through markdown cell values that have no renderer', () => {
        const output = buildMatrixTable([{ name: '[Row Sorting](./row-sorting)' }], {
            columns: { name: 'Feature' },
        });
        expect(output).toContain('[Row Sorting](./row-sorting)');
    });

    it('returns empty string when there are no columns', () => {
        expect(buildMatrixTable([{ name: 'X' }], { columns: {} })).toBe('');
    });
});

describe('buildModuleMappingsTable', () => {
    const groups = [
        {
            name: 'Grouping',
            children: [{ name: 'Row Grouping', moduleName: 'RowGroupingModule', path: 'grouping', isEnterprise: true }],
        },
        { name: 'Community Feature', moduleName: 'CommunityModule', path: 'community' },
        { name: 'Hidden', moduleName: 'HiddenModule', hideFromSelection: true },
    ];

    it('flattens the tree into feature/module/enterprise rows with doc links', () => {
        const output = buildModuleMappingsTable(groups, 'react');

        expect(output).toContain('| Feature | Module | Enterprise |');
        expect(output).toContain('`RowGroupingModule`');
        expect(output).toContain('[Row Grouping](');
        expect(output).toContain('/grouping/');
        // Enterprise flag on the leaf surfaces in the Enterprise column.
        expect(output).toMatch(/RowGroupingModule`[^\n]*Enterprise/);
        expect(output).toContain('`CommunityModule`');
    });

    it('skips modules flagged hideFromSelection', () => {
        const output = buildModuleMappingsTable(groups, 'react');
        expect(output).not.toContain('HiddenModule');
    });

    it('makes links absolute when a siteRoot is given', () => {
        const output = buildModuleMappingsTable(groups, 'react', 'https://www.ag-grid.com/');
        expect(output).toContain('(https://www.ag-grid.com/');
    });
});
