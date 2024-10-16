import { getDependencies } from './getDependencies';

describe('grid getDependencies', () => {
    test.each`
        framework       | isIntegratedCharts | expected
        ${'react'}      | ${false}           | ${['ag-grid-react', 'ag-grid-enterprise']}
        ${'react'}      | ${true}            | ${['ag-grid-react', 'ag-grid-charts-enterprise']}
        ${'angular'}    | ${false}           | ${['ag-grid-angular', 'ag-grid-enterprise']}
        ${'angular'}    | ${true}            | ${['ag-grid-angular', 'ag-grid-charts-enterprise']}
        ${'vue'}        | ${false}           | ${['ag-grid-vue3', 'ag-grid-enterprise']}
        ${'vue'}        | ${true}            | ${['ag-grid-vue3', 'ag-grid-charts-enterprise']}
        ${'javascript'} | ${false}           | ${['ag-grid-enterprise']}
        ${'javascript'} | ${true}            | ${['ag-grid-charts-enterprise']}
    `(
        '$framework { isIntegratedCharts: $isIntegratedCharts } is $expected',
        ({ framework, isIntegratedCharts, expected }) => {
            expect(
                getDependencies({
                    library: 'grid',
                    framework,
                    isIntegratedCharts,
                }).sort()
            ).toEqual(expected.sort());
        }
    );
});

describe('charts getDependencies', () => {
    test.each`
        framework       | isIntegratedCharts | expected
        ${'react'}      | ${false}           | ${['ag-charts-react', 'ag-charts-enterprise']}
        ${'react'}      | ${true}            | ${['ag-charts-react', 'ag-charts-enterprise']}
        ${'angular'}    | ${false}           | ${['ag-charts-angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${true}            | ${['ag-charts-angular', 'ag-charts-enterprise']}
        ${'vue'}        | ${false}           | ${['ag-charts-vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${true}            | ${['ag-charts-vue3', 'ag-charts-enterprise']}
        ${'javascript'} | ${false}           | ${['ag-charts-enterprise']}
        ${'javascript'} | ${true}            | ${['ag-charts-enterprise']}
    `(
        '$framework { isIntegratedCharts: $isIntegratedCharts } is $expected',
        ({ framework, isIntegratedCharts, expected }) => {
            expect(
                getDependencies({
                    library: 'charts',
                    framework,
                    isIntegratedCharts,
                }).sort()
            ).toEqual(expected.sort());
        }
    );
});
