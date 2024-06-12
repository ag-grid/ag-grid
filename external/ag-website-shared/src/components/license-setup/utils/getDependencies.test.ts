import { getDependencies } from './getDependencies';

describe('getDependencies', () => {
    test.each`
        framework       | gridEnterprise | integratedEnterprise | chartsEnterprise | noProducts | importType    | expected
        ${'react'}      | ${false}       | ${false}             | ${false}         | ${true}    | ${'packages'} | ${['ag-grid-react', 'ag-grid-community', 'ag-charts-react', 'ag-charts-community']}
        ${'react'}      | ${true}        | ${false}             | ${false}         | ${false}   | ${'packages'} | ${['ag-grid-react', 'ag-grid-enterprise']}
        ${'react'}      | ${false}       | ${true}              | ${false}         | ${false}   | ${'packages'} | ${['ag-grid-react', 'ag-grid-charts-enterprise']}
        ${'react'}      | ${true}        | ${true}              | ${false}         | ${false}   | ${'packages'} | ${['ag-grid-react', 'ag-grid-charts-enterprise']}
        ${'react'}      | ${false}       | ${false}             | ${true}          | ${false}   | ${'packages'} | ${['ag-charts-react', 'ag-charts-enterprise']}
        ${'react'}      | ${true}        | ${false}             | ${true}          | ${false}   | ${'packages'} | ${['ag-grid-react', 'ag-grid-enterprise', 'ag-charts-react', 'ag-charts-enterprise']}
        ${'react'}      | ${false}       | ${true}              | ${true}          | ${false}   | ${'packages'} | ${['ag-grid-react', 'ag-grid-charts-enterprise', 'ag-charts-react', 'ag-charts-enterprise']}
        ${'react'}      | ${true}        | ${true}              | ${true}          | ${false}   | ${'packages'} | ${['ag-grid-react', 'ag-grid-charts-enterprise', 'ag-charts-react', 'ag-charts-enterprise']}
        ${'angular'}    | ${false}       | ${false}             | ${false}         | ${true}    | ${'packages'} | ${['ag-grid-angular', 'ag-grid-community', 'ag-charts-angular', 'ag-charts-community']}
        ${'angular'}    | ${true}        | ${false}             | ${false}         | ${false}   | ${'packages'} | ${['ag-grid-angular', 'ag-grid-enterprise']}
        ${'angular'}    | ${false}       | ${true}              | ${false}         | ${false}   | ${'packages'} | ${['ag-grid-angular', 'ag-grid-charts-enterprise']}
        ${'angular'}    | ${true}        | ${true}              | ${false}         | ${false}   | ${'packages'} | ${['ag-grid-angular', 'ag-grid-charts-enterprise']}
        ${'angular'}    | ${false}       | ${false}             | ${true}          | ${false}   | ${'packages'} | ${['ag-charts-angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${true}        | ${false}             | ${true}          | ${false}   | ${'packages'} | ${['ag-grid-angular', 'ag-grid-enterprise', 'ag-charts-angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${false}       | ${true}              | ${true}          | ${false}   | ${'packages'} | ${['ag-grid-angular', 'ag-grid-charts-enterprise', 'ag-charts-angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${true}        | ${true}              | ${true}          | ${false}   | ${'packages'} | ${['ag-grid-angular', 'ag-grid-charts-enterprise', 'ag-charts-angular', 'ag-charts-enterprise']}
        ${'vue'}        | ${false}       | ${false}             | ${false}         | ${true}    | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-community', 'ag-charts-vue3', 'ag-charts-community']}
        ${'vue'}        | ${true}        | ${false}             | ${false}         | ${false}   | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-enterprise']}
        ${'vue'}        | ${false}       | ${true}              | ${false}         | ${false}   | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-charts-enterprise']}
        ${'vue'}        | ${true}        | ${true}              | ${false}         | ${false}   | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-charts-enterprise']}
        ${'vue'}        | ${false}       | ${false}             | ${true}          | ${false}   | ${'packages'} | ${['ag-charts-vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${true}        | ${false}             | ${true}          | ${false}   | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-enterprise', 'ag-charts-vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${false}       | ${true}              | ${true}          | ${false}   | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-charts-enterprise', 'ag-charts-vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${true}        | ${true}              | ${true}          | ${false}   | ${'packages'} | ${['ag-grid-vue3', 'ag-grid-charts-enterprise', 'ag-charts-vue3', 'ag-charts-enterprise']}
        ${'javascript'} | ${false}       | ${false}             | ${false}         | ${true}    | ${'packages'} | ${['ag-grid-community', 'ag-charts-community']}
        ${'javascript'} | ${true}        | ${false}             | ${false}         | ${false}   | ${'packages'} | ${['ag-grid-enterprise']}
        ${'javascript'} | ${false}       | ${true}              | ${false}         | ${false}   | ${'packages'} | ${['ag-grid-charts-enterprise']}
        ${'javascript'} | ${true}        | ${true}              | ${false}         | ${false}   | ${'packages'} | ${['ag-grid-charts-enterprise']}
        ${'javascript'} | ${false}       | ${false}             | ${true}          | ${false}   | ${'packages'} | ${['ag-charts-enterprise']}
        ${'javascript'} | ${true}        | ${false}             | ${true}          | ${false}   | ${'packages'} | ${['ag-grid-enterprise', 'ag-charts-enterprise']}
        ${'javascript'} | ${false}       | ${true}              | ${true}          | ${false}   | ${'packages'} | ${['ag-grid-charts-enterprise', 'ag-charts-enterprise']}
        ${'javascript'} | ${true}        | ${true}              | ${true}          | ${false}   | ${'packages'} | ${['ag-grid-charts-enterprise', 'ag-charts-enterprise']}
        ${'react'}      | ${false}       | ${false}             | ${false}         | ${true}    | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/react', 'ag-charts-react', 'ag-charts-community']}
        ${'react'}      | ${true}        | ${false}             | ${false}         | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/react', '@ag-grid-enterprise/core']}
        ${'react'}      | ${false}       | ${true}              | ${false}         | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/react', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'react'}      | ${true}        | ${true}              | ${false}         | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/react', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'react'}      | ${false}       | ${false}             | ${true}          | ${false}   | ${'modules'}  | ${['ag-charts-react', 'ag-charts-enterprise']}
        ${'react'}      | ${true}        | ${false}             | ${true}          | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/react', '@ag-grid-enterprise/core', 'ag-charts-react', 'ag-charts-enterprise']}
        ${'react'}      | ${false}       | ${true}              | ${true}          | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/react', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise', 'ag-charts-react', 'ag-charts-enterprise']}
        ${'react'}      | ${true}        | ${true}              | ${true}          | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/react', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise', 'ag-charts-react', 'ag-charts-enterprise']}
        ${'angular'}    | ${false}       | ${false}             | ${false}         | ${true}    | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/angular', 'ag-charts-angular', 'ag-charts-community']}
        ${'angular'}    | ${true}        | ${false}             | ${false}         | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/angular', '@ag-grid-enterprise/core']}
        ${'angular'}    | ${false}       | ${true}              | ${false}         | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/angular', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'angular'}    | ${true}        | ${true}              | ${false}         | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/angular', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'angular'}    | ${false}       | ${false}             | ${true}          | ${false}   | ${'modules'}  | ${['ag-charts-angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${true}        | ${false}             | ${true}          | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/angular', '@ag-grid-enterprise/core', 'ag-charts-angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${false}       | ${true}              | ${true}          | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/angular', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise', 'ag-charts-angular', 'ag-charts-enterprise']}
        ${'angular'}    | ${true}        | ${true}              | ${true}          | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/angular', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise', 'ag-charts-angular', 'ag-charts-enterprise']}
        ${'vue'}        | ${false}       | ${false}             | ${false}         | ${true}    | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/vue3', 'ag-charts-vue3', 'ag-charts-community']}
        ${'vue'}        | ${true}        | ${false}             | ${false}         | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/vue3', '@ag-grid-enterprise/core']}
        ${'vue'}        | ${false}       | ${true}              | ${false}         | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/vue3', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'vue'}        | ${true}        | ${true}              | ${false}         | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/vue3', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'vue'}        | ${false}       | ${false}             | ${true}          | ${false}   | ${'modules'}  | ${['ag-charts-vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${true}        | ${false}             | ${true}          | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/vue3', '@ag-grid-enterprise/core', 'ag-charts-vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${false}       | ${true}              | ${true}          | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/vue3', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise', 'ag-charts-vue3', 'ag-charts-enterprise']}
        ${'vue'}        | ${true}        | ${true}              | ${true}          | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-community/vue3', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise', 'ag-charts-vue3', 'ag-charts-enterprise']}
        ${'javascript'} | ${false}       | ${false}             | ${false}         | ${true}    | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', 'ag-charts-community']}
        ${'javascript'} | ${true}        | ${false}             | ${false}         | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-enterprise/core']}
        ${'javascript'} | ${false}       | ${true}              | ${false}         | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'javascript'} | ${true}        | ${true}              | ${false}         | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise']}
        ${'javascript'} | ${false}       | ${false}             | ${true}          | ${false}   | ${'modules'}  | ${['ag-charts-enterprise']}
        ${'javascript'} | ${true}        | ${false}             | ${true}          | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-enterprise/core', 'ag-charts-enterprise']}
        ${'javascript'} | ${false}       | ${true}              | ${true}          | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise', 'ag-charts-enterprise']}
        ${'javascript'} | ${true}        | ${true}              | ${true}          | ${false}   | ${'modules'}  | ${['@ag-grid-community/client-side-row-model', '@ag-grid-community/styles', '@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise', 'ag-charts-enterprise']}
    `(
        '$framework { gridEnterprise: $gridEnterprise, integratedEnterprise: $integratedEnterprise, chartsEnterprise: $chartsEnterprise, noProducts: $noProducts } $importType is $expected',
        ({ framework, gridEnterprise, integratedEnterprise, chartsEnterprise, noProducts, importType, expected }) => {
            expect(
                getDependencies({
                    framework,
                    products: {
                        gridEnterprise,
                        integratedEnterprise,
                        chartsEnterprise,
                    },
                    noProducts,
                    importType,
                }).sort()
            ).toEqual(expected.sort());
        }
    );
});
