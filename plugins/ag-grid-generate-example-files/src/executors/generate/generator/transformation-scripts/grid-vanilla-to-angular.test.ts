import { parser } from './grid-vanilla-src-parser';
import { vanillaToAngular } from './grid-vanilla-to-angular';
import { standardiseWhitespace } from './test-utils';

const html = '<div id="myGrid" style="height: 100%"></div>';

function createSource({ rowData, onLoad }: { rowData?: string; onLoad?: string }) {
    return `
import type { GridApi, GridOptions } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [{ field: 'athlete' }],
    ${rowData !== undefined ? `rowData: ${rowData},` : ''}
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
    ${
        onLoad
            ? `fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => {
            ${onLoad}
        });`
            : ''
    }
});
`;
}

function toAngular(source: string) {
    const { typedBindings } = parser('row-numbers/_examples/example', source, html, {}, {});
    return standardiseWhitespace(vanillaToAngular(typedBindings, {}, [], [])());
}

describe('vanillaToAngular', () => {
    describe('rowData loaded from a fetch callback', () => {
        it.each([
            ["gridApi!.setGridOption('rowData', data);", 'this.rowData.set(data);'],
            [
                "gridApi!.setGridOption('rowData', data.map((d) => ({ ...d, id: d.athlete })));",
                'this.rowData.set(data.map((d) => ({ ...d, id: d.athlete })));',
            ],
            ["gridApi.setGridOption('rowData', data.slice(0, 50));", 'this.rowData.set(data.slice(0, 50));'],
        ])('sets the rowData signal for %s', (onLoad, expected) => {
            const output = toAngular(createSource({ onLoad }));

            expect(output).toContain(expected);
            expect(output).not.toContain("setGridOption('rowData'");
        });

        it('sets every rowData assignment in the callback on the signal', () => {
            const output = toAngular(
                createSource({
                    onLoad: "gridApi!.setGridOption('rowData', data); gridApi!.setGridOption('rowData', data.slice(0, 5));",
                })
            );

            expect(output).toContain('this.rowData.set(data); this.rowData.set(data.slice(0, 5));');
        });

        it('binds the rowData signal and imports signal', () => {
            const output = toAngular(createSource({ onLoad: "gridApi!.setGridOption('rowData', data);" }));

            expect(output).toContain("import { Component, signal } from '@angular/core';");
            expect(output).toContain('[rowData]="rowData()"');
            expect(output).not.toContain('[rowData]="rowData"');
            expect(output).toContain('rowData = signal<IOlympicData[] | undefined>(undefined);');
        });

        it.each([
            ['null', 'rowData = signal<IOlympicData[] | null>(null);'],
            ['[]', 'rowData = signal<IOlympicData[]>([]);'],
        ])('carries a declared rowData of %s into the signal', (rowData, expectedMember) => {
            const output = toAngular(createSource({ rowData, onLoad: "gridApi!.setGridOption('rowData', data);" }));

            expect(output).toContain(expectedMember);
            expect(output.match(/\[rowData\]=/g)).toHaveLength(1);
            expect(output).toContain('[rowData]="rowData()"');
            expect(output.match(/rowData( = |!:|: )/g)).toHaveLength(1);
        });
    });

    describe('rowData not loaded from a fetch callback', () => {
        it('keeps a plain rowData member when rowData is not fetched', () => {
            const output = toAngular(createSource({ rowData: '[{ athlete: "A" }]' }));

            expect(output).toContain("import { Component } from '@angular/core';");
            expect(output).toContain('[rowData]="rowData"');
            expect(output).not.toContain('signal');
        });

        it('keeps the grid api call when the fetch callback applies a transaction', () => {
            const output = toAngular(createSource({ onLoad: 'gridApi!.applyTransaction({ add: data });' }));

            expect(output).toContain('params.api!.applyTransaction({ add: data })');
            expect(output).toContain('[rowData]="rowData"');
            expect(output).toContain('rowData!: IOlympicData[];');
            expect(output).not.toContain('signal');
        });
    });
});
