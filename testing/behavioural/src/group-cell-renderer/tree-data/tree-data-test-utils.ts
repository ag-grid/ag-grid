import type { GridOptions } from 'ag-grid-community';

import { autoColDefSetter, cellRendererParamsSetter, rowSelectionSetter, sportColDefSetter } from '../util';
import type { TestPermutation } from '../util';

export const treeDataSnapshotter = (container: HTMLDivElement) => {
    const snap: string[] = [];
    container.querySelectorAll('.ag-cell-group').forEach((el) => {
        // strip comp generated comp ids as they're too volatile
        snap.push(el.innerHTML.replaceAll(/id="ag-[0-9]+-[a-zA-Z]+"/g, ''));
    });
    return snap;
};

export function getTestConcerns_masterDetail(): TestPermutation[] {
    return [
        { property: 'masterDetail', values: [true, false] },
        {
            property: 'autoGroupColumnDef.cellRendererParams.suppressCount',
            values: [true, false],
            setter: cellRendererParamsSetter,
        } as any,
    ];
}

export function getGridOptions_masterDetail(gridOptions: GridOptions): GridOptions {
    return {
        ...gridOptions,
        masterDetail: true,
    };
}

export function getTestConcerns_correctRenderer(): TestPermutation[] {
    return [
        {
            property: 'autoGroupColumnDef.cellRendererParams.innerRenderer' as any,
            values: [
                undefined,
                (p: { valueFormatted: any; value: any }) =>
                    `autoColDef.cellRendererParams.innerRenderer(${p.valueFormatted ?? p.value})`,
            ],
            setter: cellRendererParamsSetter('innerRenderer'),
        },
        {
            property: 'colDef[1].cellRenderer',
            values: [
                undefined,
                (p: { valueFormatted: any; value: any }) => `columnDef[1].cellRenderer(${p.valueFormatted ?? p.value})`,
            ],
            setter: sportColDefSetter('cellRenderer'),
        },
    ];
}

export function getGridOptions_correctRenderer(gridOptions: GridOptions): GridOptions {
    return {
        ...gridOptions,
    };
}

export function getTestConcerns_correctValue(): TestPermutation[] {
    return [
        {
            property: 'colDef[1].valueFormatter',
            values: [undefined, (p: { value: any }) => `columnDef[1].valueFormatter(${p.value})`],
            setter: sportColDefSetter('valueFormatter'),
        },
        {
            property: 'autoGroupColumnDef.valueGetter',
            values: [undefined, (p: { data?: any }) => `autoColDef.valueGetter(${p.data?.athlete ?? 'MISSING'})`],
            setter: autoColDefSetter('valueGetter'),
            condition: (go: any) => go.showOpenedGroup === false, // not supported together
        },
        {
            property: 'autoGroupColumnDef.valueFormatter',
            values: [undefined, (p: { value: any }) => `autoColDef.valueFormatter(${p.value})`],
            setter: autoColDefSetter('valueFormatter'),
        },
        {
            property: 'autoGroupColumnDef.cellRendererParams.totalValueGetter' as any,
            values: [
                undefined,
                (p: { valueFormatted: any; value: any }) =>
                    `autoColDef.cellRendererParams.totalValueGetter(${p.valueFormatted ?? p.value})`,
            ],
            setter: cellRendererParamsSetter('totalValueGetter'),
        },
    ];
}

export function getGridOptions_correctValue_defaultRenderer(gridOptions: GridOptions): GridOptions {
    return {
        ...gridOptions,
    };
}

export function getGridOptions_correctValue_innerRenderer(gridOptions: GridOptions): GridOptions {
    return {
        ...gridOptions,
        autoGroupColumnDef: {
            ...gridOptions.autoGroupColumnDef,
            cellRendererParams: {
                innerRenderer: (p: { valueFormatted: any; value: any }) =>
                    `autoColDef.cellRendererParams.innerRenderer(${p.valueFormatted ?? p.value})`,
            },
        },
    };
}

export function getTestConcerns_checkboxes(): TestPermutation[] {
    return [
        {
            property: 'rowSelection.checkboxes',
            values: [true, false],
            condition: (go: any) =>
                typeof go.rowSelection === 'object' && go.rowSelection.checkboxLocation === 'autoGroupColumn',
            setter: rowSelectionSetter('checkboxes'),
        },
        {
            property: 'rowSelection.checkboxLocation',
            values: ['selectionColumn', 'autoGroupColumn'],
            setter: rowSelectionSetter('checkboxLocation'),
        },
    ];
}

export function getGridOptions_checkboxes(gridOptions: GridOptions): GridOptions {
    return { ...gridOptions };
}
