import type { GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../test-utils';
import type { TestPermutation } from '../util';
import { getTestGenerator } from '../util';
import { rowModelGridOptions } from './grid-config';

const autoColDefSetter = (field) => (go, value) => {
    go.autoGroupColumnDef = {
        ...go.autoGroupColumnDef,
        [field]: value,
    };
};
const sportColDefSetter = (field) => (go, value) => {
    go.columnDefs = [...go.columnDefs];
    go.columnDefs[1] = {
        ...go.columnDefs[1],
        [field]: value,
    };
};
const cellRendererParamsSetter = (field) => (go, value) => {
    go.autoGroupColumnDef = {
        ...go.autoGroupColumnDef,
        cellRendererParams: {
            ...go.autoGroupColumnDef?.cellRendererParams,
            [field]: value,
        },
    };
};

const rowSelectionSetter = (field) => (go, value) => {
    go.rowSelection = {
        mode: 'singleRow',
        ...go.rowSelection,
        [field]: value,
    };
};

describe('ag-grid find API', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });
    const groupCellSnapshotter = (container: HTMLDivElement, api: GridApi) => {
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
    const createTests = getTestGenerator(gridsManager, groupCellSnapshotter);

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // test work for SSRM, but find doesn't support SSRM, so removed for now.
    describe.each(['clientSide'])('with rowModelType=%s', (rowModelType) => {
        const { csrm, ssrm } = rowModelGridOptions;
        const gridOptions = rowModelType === 'clientSide' ? csrm : ssrm;
        const csrmExpandedConcern: TestPermutation = {
            condition: (go) => go.groupHideOpenParents === true,
            property: 'groupDefaultExpanded',
            values: [-1, 0, 1],
        };
        const ssrmExpandedConcern: TestPermutation = {
            condition: (go) => go.groupHideOpenParents === true,
            property: 'isServerSideGroupOpenByDefault',
            values: [() => true, () => false],
        };
        const expandedConcern = rowModelType === 'clientSide' ? csrmExpandedConcern : ssrmExpandedConcern;

        describe('with master detail', () => {
            const testConcerns: TestPermutation[] = [
                { property: 'groupDisplayType', values: ['singleColumn', 'multipleColumns'] },
                {
                    property: 'groupHideOpenParents',
                    values: [true, false],
                    condition: (go) => go.groupDisplayType === 'multipleColumns',
                },
                expandedConcern,
                { property: 'showOpenedGroup', values: [true, false] },
            ];
            createTests(testConcerns, {
                ...gridOptions,
                masterDetail: true,
            });
        });

        describe('with pivot mode', () => {
            const testConcerns: TestPermutation[] = [
                { property: 'groupDisplayType', values: ['singleColumn', 'multipleColumns'] },
                {
                    property: 'groupHideOpenParents',
                    values: [true, false],
                    condition: (go) => go.groupDisplayType === 'multipleColumns',
                },
                expandedConcern,
                { property: 'showOpenedGroup', values: [true, false] },
            ];
            createTests(testConcerns, {
                ...gridOptions,
                pivotMode: true,
            });
        });

        describe('correct renderer is used', () => {
            const testConcerns: TestPermutation[] = [
                { property: 'groupDisplayType', values: ['singleColumn', 'multipleColumns'] },
                {
                    property: 'groupHideOpenParents',
                    values: [true, false],
                    condition: (go) => go.groupDisplayType === 'multipleColumns',
                },
                expandedConcern,
                { property: 'showOpenedGroup', values: [true, false] },
                {
                    property: 'autoGroupColumnDef.cellRendererParams.innerRenderer' as any,
                    values: [
                        undefined,
                        (p) => `autoColDef.cellRendererParams.innerRenderer(${p.valueFormatted ?? p.value})`,
                    ],
                    setter: cellRendererParamsSetter('innerRenderer'),
                },
                {
                    property: 'colDef[1].cellRenderer',
                    values: [undefined, (p) => `columnDef[1].cellRenderer(${p.valueFormatted ?? p.value})`],
                    setter: sportColDefSetter('cellRenderer'),
                },
            ];
            createTests(testConcerns, {
                ...gridOptions,
            });
        });

        describe('correct values are displayed', () => {
            const testConcerns: TestPermutation[] = [
                { property: 'groupDisplayType', values: ['singleColumn', 'multipleColumns'] },
                {
                    property: 'groupHideOpenParents',
                    values: [true, false],
                    condition: (go) => go.groupDisplayType === 'multipleColumns',
                },
                expandedConcern,
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
                        (p) => `autoColDef.cellRendererParams.totalValueGetter(${p.valueFormatted ?? p.value})`,
                    ],
                    setter: cellRendererParamsSetter('totalValueGetter'),
                },
            ];

            describe('with the default renderer', () => {
                createTests(testConcerns, {
                    ...gridOptions,
                });
            });

            describe('with an autoColDef.cellRenderer.innerRenderer', () => {
                createTests(testConcerns, {
                    ...gridOptions,
                    autoGroupColumnDef: {
                        ...gridOptions.autoGroupColumnDef,
                        cellRendererParams: {
                            innerRenderer: (p) =>
                                `autoColDef.cellRendererParams.innerRenderer(${p.valueFormatted ?? p.value})`,
                        },
                    },
                });
            });

            describe('with a colDef.innerRenderer on a row grouped column', () => {
                const [column0, column1, ...rest] = gridOptions.columnDefs!;
                const column1WithRenderer = {
                    ...column1,
                    cellRenderer: (p) => `columnDef[1].cellRenderer(${p.valueFormatted ?? p.value})`,
                };
                createTests(testConcerns, {
                    ...gridOptions,
                    columnDefs: [column0, column1WithRenderer, ...rest],
                });
            });
        });

        describe('autoColDef.cellRendererParams.suppressCount=true ', () => {
            const testConcerns: TestPermutation[] = [
                { property: 'groupDisplayType', values: ['singleColumn', 'multipleColumns'] },
                {
                    property: 'groupHideOpenParents',
                    values: [true, false],
                    condition: (go) => go.groupDisplayType === 'multipleColumns',
                },
                expandedConcern,
                { property: 'showOpenedGroup', values: [true, false] },
            ];
            createTests(testConcerns, {
                ...gridOptions,
                autoGroupColumnDef: {
                    ...gridOptions.autoGroupColumnDef,
                    cellRendererParams: {
                        suppressCount: true,
                    },
                },
            });
        });

        describe('checkboxes', () => {
            const testConcerns: TestPermutation[] = [
                { property: 'groupDisplayType', values: ['singleColumn', 'multipleColumns'] },
                {
                    property: 'groupHideOpenParents',
                    values: [true, false],
                    condition: (go) => go.groupDisplayType === 'multipleColumns',
                },
                expandedConcern,
                { property: 'showOpenedGroup', values: [true, false] },
                {
                    property: 'rowSelection.checkboxes',
                    values: [true, false],
                    condition: (go) =>
                        typeof go.rowSelection === 'object' && go.rowSelection.checkboxLocation === 'autoGroupColumn',
                    setter: rowSelectionSetter('checkboxes'),
                }, // check if location is correct, we can disable via boolean
                {
                    property: 'rowSelection.checkboxLocation',
                    values: ['selectionColumn', 'autoGroupColumn'],
                    setter: rowSelectionSetter('checkboxLocation'),
                },
            ];
            createTests(testConcerns, {
                ...gridOptions,
            });
        });
    });
});
