import type { InternalFramework } from '@ag-grid-types';

import { getImportMap } from './getImportMap';

const FRAMEWORKS: InternalFramework[] = ['typescript', 'reactFunctional', 'reactFunctionalTs', 'angular', 'vue3'];

describe('getImportMap', () => {
    describe.each(FRAMEWORKS)('%s', (internalFramework) => {
        test('resolves the grid, its stylesheets and the framework wrapper', () => {
            const importMap = getImportMap({ internalFramework, isEnterprise: false });

            expect(importMap['ag-grid-community']).toBeDefined();
            expect(importMap['ag-grid-community/styles/']).toMatch(/\/styles\/$/);

            const wrapper = {
                typescript: undefined,
                vanilla: undefined,
                reactFunctional: 'ag-grid-react',
                reactFunctionalTs: 'ag-grid-react',
                angular: 'ag-grid-angular',
                vue3: 'ag-grid-vue3',
            }[internalFramework];

            if (wrapper) {
                expect(importMap[wrapper]).toBeDefined();
            }
        });
    });

    test('only includes the charts packages for enterprise examples', () => {
        const community = getImportMap({ internalFramework: 'typescript', isEnterprise: false });
        const enterprise = getImportMap({ internalFramework: 'typescript', isEnterprise: true });

        expect(community['ag-charts-community']).toBeUndefined();
        expect(enterprise['ag-charts-community']).toBeDefined();

        // Resolvable either way, for the generator's test-id block
        expect(community['ag-grid-enterprise']).toBeDefined();
    });
});
