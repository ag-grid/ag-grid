import { getDependencies } from './getDependencies';

describe('getDependencies', () => {
    test.each`
        framework       | licensedGrid | licensedCharts | importType    | standaloneCharts | expected
        ${'react'}      | ${false}     | ${false}       | ${'packages'} | ${false}         | ${['ag-grid-react']}
        ${'react'}      | ${true}      | ${false}       | ${'packages'} | ${false}         | ${['ag-grid-react', 'ag-grid-enterprise']}
        ${'react'}      | ${false}     | ${true}        | ${'packages'} | ${false}         | ${['ag-grid-react']}
        ${'react'}      | ${true}      | ${true}        | ${'packages'} | ${false}         | ${['ag-grid-react', 'ag-grid-charts-enterprise']}
        ${'react'}      | ${false}     | ${false}       | ${'modules'}  | ${false}         | ${['@ag-grid-community/react']}
        ${'react'}      | ${true}      | ${false}       | ${'modules'}  | ${false}         | ${['@ag-grid-community/react', '@ag-grid-enterprise/core']}
        ${'react'}      | ${false}     | ${true}        | ${'modules'}  | ${false}         | ${['@ag-grid-community/react']}
        ${'react'}      | ${true}      | ${true}        | ${'modules'}  | ${false}         | ${['@ag-grid-community/react', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'react'}      | ${false}     | ${false}       | ${'packages'} | ${true}          | ${['ag-grid-react', 'ag-charts-community']}
        ${'react'}      | ${true}      | ${false}       | ${'packages'} | ${true}          | ${['ag-grid-react', 'ag-grid-enterprise', 'ag-charts-community']}
        ${'react'}      | ${false}     | ${true}        | ${'packages'} | ${true}          | ${['ag-grid-react', 'ag-charts-enterprise']}
        ${'react'}      | ${true}      | ${true}        | ${'packages'} | ${true}          | ${['ag-grid-react', 'ag-grid-charts-enterprise', 'ag-charts-enterprise']}
        ${'react'}      | ${false}     | ${false}       | ${'modules'}  | ${true}          | ${['@ag-grid-community/react', 'ag-charts-community']}
        ${'react'}      | ${true}      | ${false}       | ${'modules'}  | ${true}          | ${['@ag-grid-community/react', '@ag-grid-enterprise/core', 'ag-charts-community']}
        ${'react'}      | ${false}     | ${true}        | ${'modules'}  | ${true}          | ${['@ag-grid-community/react', 'ag-charts-enterprise']}
        ${'react'}      | ${true}      | ${true}        | ${'modules'}  | ${true}          | ${['@ag-grid-community/react', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise', 'ag-charts-enterprise']}
        ${'angular'}    | ${false}     | ${false}       | ${'packages'} | ${false}         | ${['ag-grid-angular']}
        ${'angular'}    | ${true}      | ${false}       | ${'packages'} | ${false}         | ${['ag-grid-angular', 'ag-grid-enterprise']}
        ${'angular'}    | ${false}     | ${true}        | ${'packages'} | ${false}         | ${['ag-grid-angular']}
        ${'angular'}    | ${true}      | ${true}        | ${'packages'} | ${false}         | ${['ag-grid-angular', 'ag-grid-charts-enterprise']}
        ${'angular'}    | ${false}     | ${false}       | ${'modules'}  | ${false}         | ${['@ag-grid-community/angular']}
        ${'angular'}    | ${true}      | ${false}       | ${'modules'}  | ${false}         | ${['@ag-grid-community/angular', '@ag-grid-enterprise/core']}
        ${'angular'}    | ${false}     | ${true}        | ${'modules'}  | ${false}         | ${['@ag-grid-community/angular']}
        ${'angular'}    | ${true}      | ${true}        | ${'modules'}  | ${false}         | ${['@ag-grid-community/angular', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'angular'}    | ${false}     | ${false}       | ${'packages'} | ${true}          | ${['ag-grid-angular', 'ag-charts-community']}
        ${'angular'}    | ${true}      | ${false}       | ${'packages'} | ${true}          | ${['ag-grid-angular', 'ag-grid-enterprise', 'ag-charts-community']}
        ${'angular'}    | ${false}     | ${true}        | ${'packages'} | ${true}          | ${['ag-grid-angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${true}      | ${true}        | ${'packages'} | ${true}          | ${['ag-grid-angular', 'ag-grid-charts-enterprise', 'ag-charts-enterprise']}
        ${'angular'}    | ${false}     | ${false}       | ${'modules'}  | ${true}          | ${['@ag-grid-community/angular', 'ag-charts-community']}
        ${'angular'}    | ${true}      | ${false}       | ${'modules'}  | ${true}          | ${['@ag-grid-community/angular', '@ag-grid-enterprise/core', 'ag-charts-community']}
        ${'angular'}    | ${false}     | ${true}        | ${'modules'}  | ${true}          | ${['@ag-grid-community/angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${true}      | ${true}        | ${'modules'}  | ${true}          | ${['@ag-grid-community/angular', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise', 'ag-charts-enterprise']}
        ${'vue'}        | ${false}     | ${false}       | ${'packages'} | ${false}         | ${['ag-grid-vue3']}
        ${'vue'}        | ${true}      | ${false}       | ${'packages'} | ${false}         | ${['ag-grid-vue3', 'ag-grid-enterprise']}
        ${'vue'}        | ${false}     | ${true}        | ${'packages'} | ${false}         | ${['ag-grid-vue3']}
        ${'vue'}        | ${true}      | ${true}        | ${'packages'} | ${false}         | ${['ag-grid-vue3', 'ag-grid-charts-enterprise']}
        ${'vue'}        | ${false}     | ${false}       | ${'modules'}  | ${false}         | ${['@ag-grid-community/vue3']}
        ${'vue'}        | ${true}      | ${false}       | ${'modules'}  | ${false}         | ${['@ag-grid-community/vue3', '@ag-grid-enterprise/core']}
        ${'vue'}        | ${false}     | ${true}        | ${'modules'}  | ${false}         | ${['@ag-grid-community/vue3']}
        ${'vue'}        | ${true}      | ${true}        | ${'modules'}  | ${false}         | ${['@ag-grid-community/vue3', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'vue'}        | ${false}     | ${false}       | ${'packages'} | ${true}          | ${['ag-grid-vue3', 'ag-charts-community']}
        ${'vue'}        | ${true}      | ${false}       | ${'packages'} | ${true}          | ${['ag-grid-vue3', 'ag-grid-enterprise', 'ag-charts-community']}
        ${'vue'}        | ${false}     | ${true}        | ${'packages'} | ${true}          | ${['ag-grid-vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${true}      | ${true}        | ${'packages'} | ${true}          | ${['ag-grid-vue3', 'ag-grid-charts-enterprise', 'ag-charts-enterprise']}
        ${'vue'}        | ${false}     | ${false}       | ${'modules'}  | ${true}          | ${['@ag-grid-community/vue3', 'ag-charts-community']}
        ${'vue'}        | ${true}      | ${false}       | ${'modules'}  | ${true}          | ${['@ag-grid-community/vue3', '@ag-grid-enterprise/core', 'ag-charts-community']}
        ${'vue'}        | ${false}     | ${true}        | ${'modules'}  | ${true}          | ${['@ag-grid-community/vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${true}      | ${true}        | ${'modules'}  | ${true}          | ${['@ag-grid-community/vue3', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise', 'ag-charts-enterprise']}
        ${'javascript'} | ${false}     | ${false}       | ${'packages'} | ${false}         | ${['ag-grid-community']}
        ${'javascript'} | ${true}      | ${false}       | ${'packages'} | ${false}         | ${['ag-grid-enterprise']}
        ${'javascript'} | ${false}     | ${true}        | ${'packages'} | ${false}         | ${['ag-grid-community']}
        ${'javascript'} | ${true}      | ${true}        | ${'packages'} | ${false}         | ${['ag-grid-charts-enterprise']}
        ${'javascript'} | ${false}     | ${false}       | ${'modules'}  | ${false}         | ${['@ag-grid-community/core']}
        ${'javascript'} | ${true}      | ${false}       | ${'modules'}  | ${false}         | ${['@ag-grid-enterprise/core']}
        ${'javascript'} | ${false}     | ${true}        | ${'modules'}  | ${false}         | ${['@ag-grid-community/core']}
        ${'javascript'} | ${true}      | ${true}        | ${'modules'}  | ${false}         | ${['@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'javascript'} | ${false}     | ${false}       | ${'packages'} | ${true}          | ${['ag-grid-community', 'ag-charts-community']}
        ${'javascript'} | ${true}      | ${false}       | ${'packages'} | ${true}          | ${['ag-grid-enterprise', 'ag-charts-community']}
        ${'javascript'} | ${false}     | ${true}        | ${'packages'} | ${true}          | ${['ag-grid-community', 'ag-charts-enterprise']}
        ${'javascript'} | ${true}      | ${true}        | ${'packages'} | ${true}          | ${['ag-grid-charts-enterprise', 'ag-charts-enterprise']}
        ${'javascript'} | ${false}     | ${false}       | ${'modules'}  | ${true}          | ${['@ag-grid-community/core', 'ag-charts-community']}
        ${'javascript'} | ${true}      | ${false}       | ${'modules'}  | ${true}          | ${['@ag-grid-enterprise/core', 'ag-charts-community']}
        ${'javascript'} | ${false}     | ${true}        | ${'modules'}  | ${true}          | ${['@ag-grid-community/core', 'ag-charts-enterprise']}
        ${'javascript'} | ${true}      | ${true}        | ${'modules'}  | ${true}          | ${['@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise', 'ag-charts-enterprise']}
    `(
        '$framework { grid: $licensedGrid, charts: $licensedCharts } $importType standaloneCharts: $standaloneCharts is $expected',
        ({ framework, licensedGrid, licensedCharts, importType, standaloneCharts, expected }) => {
            expect(
                getDependencies({
                    framework,
                    licensedProducts: {
                        grid: licensedGrid,
                        charts: licensedCharts,
                    },
                    importType,
                    useStandaloneCharts: standaloneCharts,
                }).sort()
            ).toEqual(expected.sort());
        }
    );
});
