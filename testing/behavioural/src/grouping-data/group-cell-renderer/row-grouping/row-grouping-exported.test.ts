import type { ColDef, GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../test-utils';
import type { TestPermutation } from '../util';
import { getTestGenerator } from '../util';
import { rowModelGridOptions } from './grid-config';

describe('ag-grid exported group values', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });
    const snapshotCsv = (container: HTMLDivElement, api: GridApi) => {
        return api.getDataAsCsv();
    };
    const createTests = getTestGenerator(gridsManager, snapshotCsv);

    beforeEach(() => {
        gridsManager.reset();
        vi.useFakeTimers();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.useFakeTimers();
    });

    describe.each(['clientSide', 'serverSide'])('with rowModelType=%s', (rowModelType) => {
        const { csrm, ssrm } = rowModelGridOptions;
        const gridOptions = rowModelType === 'clientSide' ? csrm : ssrm;

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
        const testConcerns: TestPermutation[] = [
            { property: 'groupDisplayType', values: ['singleColumn', 'multipleColumns'] },
            { property: 'pivotMode', values: [true, false] },
            {
                property: 'groupHideOpenParents',
                values: [true, false],
                condition: (go) => go.groupDisplayType === 'multipleColumns',
            },
            { property: 'showOpenedGroup', values: [true, false] },
            {
                property: 'autoGroupColumnDef.valueGetter',
                values: [undefined, (p) => `autoColDef.valueGetter(${p.data?.athlete ?? 'MISSING'})`],
                setter: autoColDefSetter('valueGetter'),
                condition: (go) => go.showOpenedGroup === false && go.groupDisplayType !== 'groupRows', // not supported together
            },
            {
                property: 'autoGroupColumnDef.valueFormatter',
                values: [undefined, (p) => `autoColDef.valueFormatter(${p.value})`],
                setter: autoColDefSetter('valueFormatter'),
            },
            {
                // only check if formatter is applied, when theres a formatter
                condition: (go) => go.autoGroupColumnDef?.valueFormatter !== undefined,
                property: 'autoGroupColumnDef.useValueFormatterForExport',
                values: [true, false],
                setter: autoColDefSetter('useValueFormatterForExport'),
            },
            {
                property: 'colDef[1].valueFormatter',
                values: [undefined, (p) => `columnDef[1].valueFormatter(${p.value})`],
                setter: sportColDefSetter('valueFormatter'),
            },
            {
                // only check if formatter is applied, when theres a formatter
                condition: (go) => (go.columnDefs?.[1] as ColDef)?.valueFormatter !== undefined,
                property: 'colDef[1].useValueFormatterForExport',
                values: [true, false],
                setter: sportColDefSetter('useValueFormatterForExport'),
            },
        ];
        createTests(testConcerns, {
            ...gridOptions,
        });

        // special case, include extra empty column to export the group row
        describe('groupDisplayType=groupRows', () => {
            // skip display type concern
            const [, ...otherConcerns] = testConcerns;
            createTests(otherConcerns, {
                ...gridOptions,
                groupDisplayType: 'groupRows',
                columnDefs: [...gridOptions.columnDefs!, {}],
            });
        });
    });
});
