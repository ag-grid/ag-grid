import type { InternalFramework } from '@ag-grid-types';
import { FILES_BASE_PATH } from '@constants';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { getImportMap } from './getImportMap';

const REPO_ROOT = path.resolve(__dirname, '../../../../..');

const FRAMEWORKS: InternalFramework[] = ['typescript', 'reactFunctional', 'reactFunctionalTs', 'angular', 'vue3'];

const LOCAL_PACKAGE_ROOTS: Record<string, string> = {
    'ag-stack': 'packages/ag-stack',
    'ag-grid-community': 'packages/ag-grid-community',
    'ag-grid-enterprise': 'packages/ag-grid-enterprise',
    'ag-grid-react': 'packages/ag-grid-react',
    'ag-grid-vue3': 'packages/ag-grid-vue3',
    'ag-grid-angular': 'packages/ag-grid-angular/dist/ag-grid-angular',
    '@ag-grid-community/locale': 'community-modules/locale',
    'ag-charts-types': 'node_modules/ag-charts-types',
    'ag-charts-core': 'node_modules/ag-charts-core',
    'ag-charts-community': 'node_modules/ag-charts-community',
    'ag-charts-enterprise': 'node_modules/ag-charts-enterprise',
};

const isLocal = (url: string) => !url.startsWith('http');

const toLocalPath = (url: string) => {
    const [, filePath] = url.split(`${FILES_BASE_PATH.replace(/^\//, '')}/`);
    const packageName = Object.keys(LOCAL_PACKAGE_ROOTS)
        .filter((name) => filePath.startsWith(`${name}/`))
        .sort((a, b) => b.length - a.length)[0];

    expect(packageName, `no local root known for ${filePath}`).toBeDefined();

    return path.join(REPO_ROOT, LOCAL_PACKAGE_ROOTS[packageName], filePath.slice(packageName.length + 1));
};

describe('getImportMap', () => {
    describe.each(FRAMEWORKS)('%s', (internalFramework) => {
        test.each([true, false])('local entry points exist (enterprise: %s)', (isEnterprise) => {
            const importMap = getImportMap({ internalFramework, isEnterprise, isIntegratedCharts: true });

            const localEntries = Object.entries(importMap).filter(
                ([specifier, url]) => isLocal(url) && !specifier.endsWith('/')
            );

            expect(localEntries.length).toBeGreaterThan(0);
            for (const [specifier, url] of localEntries) {
                expect(existsSync(toLocalPath(url)), `${specifier} -> ${url}`).toBe(true);
            }
        });
    });
});
