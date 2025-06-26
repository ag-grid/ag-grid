import type { ColDef } from 'ag-grid-community';

import { autoColDefSetter, sportColDefSetter } from '../../util';
import type { TestPermutation } from '../../util';

export function getExportedTestConcerns(): TestPermutation[] {
    return [
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
}
