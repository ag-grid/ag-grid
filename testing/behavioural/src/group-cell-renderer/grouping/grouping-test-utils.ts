import type { GridApi, GridOptions } from 'ag-grid-community';

import { autoColDefSetter, cellRendererParamsSetter, rowSelectionSetter, sportColDefSetter } from '../util';
import type { TestPermutation } from '../util';

export function getExpandedConcern(gridOptions: GridOptions): TestPermutation {
    const rowModelType = gridOptions.rowModelType;
    if (rowModelType === 'clientSide' || !rowModelType) {
        return {
            condition: (go) => go.groupHideOpenParents === true,
            property: 'groupDefaultExpanded',
            values: [-1, 0, 1],
        };
    }
    if (rowModelType === 'serverSide') {
        return {
            condition: (go) => go.groupHideOpenParents === true,
            property: 'isServerSideGroupOpenByDefault',
            values: [() => true, () => false],
        };
    }
    throw new Error(`unsupported rowModelType: ${rowModelType}`);
}

export const groupCellSnapshotter = (container: HTMLDivElement) => {
    const snap: string[] = [];
    // auto group cell or full width row group cell
    container.querySelectorAll('.ag-cell-group,.ag-full-width-row>.ag-row-group').forEach((el) => {
        // strip comp generated comp ids as they're too volatile
        snap.push(el.innerHTML.replaceAll(/id="ag-[0-9]+-[a-zA-Z]+"/g, ''));
    });
    return snap;
};

export const findSnapshotter = (container: HTMLDivElement, api: GridApi) => {
    const snap = {};
    const stringsToFind = [
        'Total',
        'autoColDef.cellRendererParams.totalValueGetter',
        'Ireland',
        '2000',
        'Donald Knuth',
    ];
    for (const str of stringsToFind) {
        api.setGridOption('findSearchValue', str);
        snap[str] = api.findGetTotalMatches();
    }
    return snap;
};

export function getTestConcerns_masterDetail(gridOptions: GridOptions): TestPermutation[] {
    return [
        { property: 'groupDisplayType', values: ['singleColumn', 'multipleColumns'] },
        {
            property: 'groupHideOpenParents',
            values: [true, false],
            condition: (go) => go.groupDisplayType === 'multipleColumns',
        },
        getExpandedConcern(gridOptions),
        { property: 'showOpenedGroup', values: [true, false] },
    ];
}

export function getGridOptions_masterDetail(gridOptions: GridOptions): GridOptions {
    return { ...gridOptions, masterDetail: true };
}

export function getTestConcerns_pivot(gridOptions: GridOptions): TestPermutation[] {
    return [
        { property: 'groupDisplayType', values: ['singleColumn', 'multipleColumns'] },
        {
            property: 'groupHideOpenParents',
            values: [true, false],
            condition: (go) => go.groupDisplayType === 'multipleColumns',
        },
        getExpandedConcern(gridOptions),
        { property: 'showOpenedGroup', values: [true, false] },
    ];
}

export function getGridOptions_pivot(gridOptions: GridOptions): GridOptions {
    return { ...gridOptions, pivotMode: true };
}

// Base concerns for renderer tests - can be customized with includeGroupRows
export function getTestConcerns_correctRenderer(gridOptions: GridOptions, includeGroupRows = true): TestPermutation[] {
    const groupDisplayValues = includeGroupRows
        ? (['singleColumn', 'multipleColumns', 'groupRows'] as const)
        : (['singleColumn', 'multipleColumns'] as const);

    return [
        { property: 'groupDisplayType', values: groupDisplayValues as any },
        {
            property: 'groupHideOpenParents',
            values: [true, false],
            condition: (go) => go.groupDisplayType === 'multipleColumns',
        },
        getExpandedConcern(gridOptions),
        { property: 'showOpenedGroup', values: [true, false] },
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
    return { ...gridOptions };
}

// Base concerns for value tests - can be customized with includeGroupRows
export function getTestConcerns_correctValue(gridOptions: GridOptions, includeGroupRows = true): TestPermutation[] {
    const groupDisplayValues = includeGroupRows
        ? (['singleColumn', 'multipleColumns', 'groupRows'] as const)
        : (['singleColumn', 'multipleColumns'] as const);

    return [
        { property: 'groupDisplayType', values: groupDisplayValues as any },
        {
            property: 'groupHideOpenParents',
            values: [true, false],
            condition: (go) => go.groupDisplayType === 'multipleColumns',
        },
        getExpandedConcern(gridOptions),
        { property: 'showOpenedGroup', values: [true, false] },
        {
            property: 'colDef[1].valueFormatter',
            values: [undefined, (p) => `columnDef[1].valueFormatter(${p.value})`],
            setter: sportColDefSetter('valueFormatter'),
        },
        {
            property: 'autoGroupColumnDef.valueGetter',
            values: [undefined, (p) => `autoColDef.valueGetter(${p.data?.athlete ?? 'MISSING'})`],
            setter: autoColDefSetter('valueGetter'),
            condition: (go) => go.showOpenedGroup === false, // not supported together
        },
        {
            property: 'autoGroupColumnDef.valueFormatter',
            values: [undefined, (p) => `autoColDef.valueFormatter(${p.value})`],
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
    return { ...gridOptions };
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

export function getGridOptions_correctValue_colDefInnerRendererGroupCol(gridOptions: GridOptions) {
    const [column0, column1, ...rest] = gridOptions.columnDefs!;
    const column1WithRenderer = {
        ...column1,
        cellRenderer: (p: { valueFormatted: any; value: any }) =>
            `columnDef[1].cellRenderer(${p.valueFormatted ?? p.value})`,
    };
    return {
        ...gridOptions,
        columnDefs: [column0, column1WithRenderer, ...rest],
    };
}

export function getTestConcerns_suppressCount(gridOptions: GridOptions): TestPermutation[] {
    return [
        { property: 'groupDisplayType', values: ['singleColumn', 'multipleColumns'] },
        {
            property: 'groupHideOpenParents',
            values: [true, false],
            condition: (go) => go.groupDisplayType === 'multipleColumns',
        },
        getExpandedConcern(gridOptions),
        { property: 'showOpenedGroup', values: [true, false] },
    ];
}

export function getGridOptions_suppressCount(gridOptions: GridOptions): GridOptions {
    return {
        ...gridOptions,
        autoGroupColumnDef: {
            ...gridOptions.autoGroupColumnDef,
            cellRendererParams: {
                suppressCount: true,
            },
        },
    };
}

export function getTestConcerns_checkboxes(gridOptions: GridOptions): TestPermutation[] {
    return [
        { property: 'groupDisplayType', values: ['singleColumn', 'multipleColumns'] },
        {
            property: 'groupHideOpenParents',
            values: [true, false],
            condition: (go) => go.groupDisplayType === 'multipleColumns',
        },
        getExpandedConcern(gridOptions),
        { property: 'showOpenedGroup', values: [true, false] },
        {
            property: 'rowSelection.checkboxes',
            values: [true, false],
            condition: (go) =>
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
