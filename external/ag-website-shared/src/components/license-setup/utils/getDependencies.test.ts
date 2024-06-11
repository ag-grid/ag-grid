import { getDependencies } from './getDependencies';

describe('getDependencies', () => {
    test.each`
        framework       | gridEnterprise | integratedEnterprise | chartsEnterprise | importType    | expected
        ${'react'}      | ${false}       | ${false}             | ${false}         | ${'packages'} | ${['ag-grid-react', 'ag-grid-community', 'ag-charts-react', 'ag-charts-community']}
        ${'react'}      | ${true}        | ${false}             | ${false}         | ${'packages'} | ${['ag-grid-react', 'ag-grid-enterprise']}
        ${'react'}      | ${false}       | ${true}              | ${false}         | ${'packages'} | ${['ag-grid-react', 'ag-grid-charts-enterprise']}
        ${'react'}      | ${true}        | ${true}              | ${false}         | ${'packages'} | ${['ag-grid-react', 'ag-grid-charts-enterprise']}
        ${'react'}      | ${false}       | ${false}             | ${true}          | ${'packages'} | ${['ag-charts-react', 'ag-charts-enterprise']}
        ${'react'}      | ${true}        | ${false}             | ${true}          | ${'packages'} | ${['ag-grid-react', 'ag-grid-enterprise', 'ag-charts-react', 'ag-charts-enterprise']}
        ${'react'}      | ${false}       | ${true}              | ${true}          | ${'packages'} | ${['ag-grid-react', 'ag-grid-charts-enterprise', 'ag-charts-react', 'ag-charts-enterprise']}
        ${'react'}      | ${true}        | ${true}              | ${true}          | ${'packages'} | ${['ag-grid-react', 'ag-grid-charts-enterprise', 'ag-charts-react', 'ag-charts-enterprise']}
        ${'angular'}    | ${false}       | ${false}             | ${false}         | ${'packages'} | ${['ag-grid-react', 'ag-grid-community', 'ag-charts-react', 'ag-charts-community']}
        ${'angular'}    | ${true}        | ${false}             | ${false}         | ${'packages'} | ${['ag-grid-angular', 'ag-grid-enterprise']}
        ${'angular'}    | ${false}       | ${true}              | ${false}         | ${'packages'} | ${['ag-grid-angular', 'ag-grid-charts-enterprise']}
        ${'angular'}    | ${true}        | ${true}              | ${false}         | ${'packages'} | ${['ag-grid-angular', 'ag-grid-charts-enterprise']}
        ${'angular'}    | ${false}       | ${false}             | ${true}          | ${'packages'} | ${['ag-charts-angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${true}        | ${false}             | ${true}          | ${'packages'} | ${['ag-grid-angular', 'ag-grid-enterprise', 'ag-charts-angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${false}       | ${true}              | ${true}          | ${'packages'} | ${['ag-grid-angular', 'ag-grid-charts-enterprise', 'ag-charts-angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${true}        | ${true}              | ${true}          | ${'packages'} | ${['ag-grid-angular', 'ag-grid-charts-enterprise', 'ag-charts-angular', 'ag-charts-enterprise']}
        ${'vue'}        | ${false}       | ${false}             | ${false}         | ${'packages'} | ${['ag-grid-react', 'ag-grid-community', 'ag-charts-react', 'ag-charts-community']}
        ${'vue'}        | ${true}        | ${false}             | ${false}         | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-enterprise']}
        ${'vue'}        | ${false}       | ${true}              | ${false}         | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-charts-enterprise']}
        ${'vue'}        | ${true}        | ${true}              | ${false}         | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-charts-enterprise']}
        ${'vue'}        | ${false}       | ${false}             | ${true}          | ${'packages'} | ${['ag-charts-vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${true}        | ${false}             | ${true}          | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-enterprise', 'ag-charts-vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${false}       | ${true}              | ${true}          | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-charts-enterprise', 'ag-charts-vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${true}        | ${true}              | ${true}          | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-charts-enterprise', 'ag-charts-vue3', 'ag-charts-enterprise']}
        ${'javascript'} | ${false}       | ${false}             | ${false}         | ${'packages'} | ${['ag-grid-react', 'ag-grid-community', 'ag-charts-react', 'ag-charts-community']}
        ${'javascript'} | ${true}        | ${false}             | ${false}         | ${'packages'} | ${['ag-grid-enterprise']}
        ${'javascript'} | ${false}       | ${true}              | ${false}         | ${'packages'} | ${['ag-grid-charts-enterprise']}
        ${'javascript'} | ${true}        | ${true}              | ${false}         | ${'packages'} | ${['ag-grid-charts-enterprise']}
        ${'javascript'} | ${false}       | ${false}             | ${true}          | ${'packages'} | ${['ag-charts-enterprise']}
        ${'javascript'} | ${true}        | ${false}             | ${true}          | ${'packages'} | ${['ag-grid-enterprise', 'ag-charts-enterprise']}
        ${'javascript'} | ${false}       | ${true}              | ${true}          | ${'packages'} | ${['ag-grid-charts-enterprise', 'ag-charts-enterprise']}
        ${'javascript'} | ${true}        | ${true}              | ${true}          | ${'packages'} | ${['ag-grid-charts-enterprise', 'ag-charts-enterprise']}
    `(
        '$framework { gridEnterprise: $gridEnterprise, integratedEnterprise: $integratedEnterprise, chartsEnterprise: $chartsEnterprise } $importType is $expected',
        ({ framework, gridEnterprise, integratedEnterprise, chartsEnterprise, importType, expected }) => {
            expect(
                getDependencies({
                    framework,
                    products: {
                        gridEnterprise,
                        integratedEnterprise,
                        chartsEnterprise,
                    },
                    importType,
                }).sort()
            ).toEqual(expected.sort());
        }
    );
});
