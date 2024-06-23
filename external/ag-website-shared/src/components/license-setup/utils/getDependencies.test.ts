import { getGridDependencies } from './getDependencies';

describe('getGridDependencies', () => {
    test.each`
        framework       | isIntegratedCharts | importType    | expected
        ${'react'}      | ${false}           | ${'packages'} | ${['ag-grid-react', 'ag-grid-enterprise']}
        ${'react'}      | ${true}            | ${'packages'} | ${['ag-grid-react', 'ag-grid-charts-enterprise']}
        ${'angular'}    | ${false}           | ${'packages'} | ${['ag-grid-angular', 'ag-grid-enterprise']}
        ${'angular'}    | ${true}            | ${'packages'} | ${['ag-grid-angular', 'ag-grid-charts-enterprise']}
        ${'vue'}        | ${false}           | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-enterprise']}
        ${'vue'}        | ${true}            | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-charts-enterprise']}
        ${'javascript'} | ${false}           | ${'packages'} | ${['ag-grid-enterprise']}
        ${'javascript'} | ${true}            | ${'packages'} | ${['ag-grid-charts-enterprise']}
        ${'react'}      | ${false}           | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/react', '@ag-grid-enterprise/core']}
        ${'react'}      | ${true}            | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/react', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'angular'}    | ${false}           | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/angular', '@ag-grid-enterprise/core']}
        ${'angular'}    | ${true}            | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/angular', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'vue'}        | ${false}           | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/vue3', '@ag-grid-enterprise/core']}
        ${'vue'}        | ${true}            | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/vue3', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'javascript'} | ${false}           | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-enterprise/core']}
        ${'javascript'} | ${true}            | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
    `(
        '$framework { isIntegratedCharts: $isIntegratedCharts, importType: $importType } is $expected',
        ({ framework, isIntegratedCharts, importType, expected }) => {
            expect(
                getGridDependencies({
                    framework,
                    isIntegratedCharts,
                    importType,
                }).sort()
            ).toEqual(expected.sort());
        }
    );
});
