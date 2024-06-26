import { getDependencies } from './getDependencies';

describe('grid getDependencies', () => {
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
                getDependencies({
                    library: 'grid',
                    framework,
                    isIntegratedCharts,
                    importType,
                }).sort()
            ).toEqual(expected.sort());
        }
    );
});

describe('charts getDependencies', () => {
    test.each`
        framework       | isIntegratedCharts | importType    | expected
        ${'react'}      | ${false}           | ${'packages'} | ${['ag-charts-react', 'ag-charts-enterprise']}
        ${'react'}      | ${true}            | ${'packages'} | ${['ag-charts-react', 'ag-charts-enterprise']}
        ${'angular'}    | ${false}           | ${'packages'} | ${['ag-charts-angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${true}            | ${'packages'} | ${['ag-charts-angular', 'ag-charts-enterprise']}
        ${'vue'}        | ${false}           | ${'packages'} | ${['ag-charts-vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${true}            | ${'packages'} | ${['ag-charts-vue3', 'ag-charts-enterprise']}
        ${'javascript'} | ${false}           | ${'packages'} | ${['ag-charts-enterprise']}
        ${'javascript'} | ${true}            | ${'packages'} | ${['ag-charts-enterprise']}
    `(
        '$framework { isIntegratedCharts: $isIntegratedCharts, importType: $importType } is $expected',
        ({ framework, isIntegratedCharts, importType, expected }) => {
            expect(
                getDependencies({
                    library: 'charts',
                    framework,
                    isIntegratedCharts,
                    importType,
                }).sort()
            ).toEqual(expected.sort());
        }
    );

    test('Throws error if getting charts modules', () => {
        expect(() =>
            getDependencies({
                library: 'charts',
                framework: 'react',
                importType: 'modules',
            }).sort()
        ).toThrow();

        expect(() =>
            getDependencies({
                library: 'charts',
                framework: 'angular',
                importType: 'modules',
            }).sort()
        ).toThrow();

        expect(() =>
            getDependencies({
                library: 'charts',
                framework: 'vue',
                importType: 'modules',
            }).sort()
        ).toThrow();

        expect(() =>
            getDependencies({
                library: 'charts',
                framework: 'javascript',
                importType: 'modules',
            }).sort()
        ).toThrow();
    });
});
