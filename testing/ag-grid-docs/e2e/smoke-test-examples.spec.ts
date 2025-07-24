import { test } from '@playwright/test';

import type { InternalFramework } from './exampleTestRunner';
import { getExampleConfig, getFrameworkExamples, runExampleSpec, setupConsoleExpectations } from './exampleTestRunner';

const baseURL = process.env.BASE_URL ?? 'https://ag-grid.com';
const fractionToRun = process.env.AG_GRID_PERCENTAGE_TO_RUN ? Number(process.env.AG_GRID_PERCENTAGE_TO_RUN) : 0.01;

console.log(`Running ${fractionToRun * 100}% of examples to smoke tests against base URL: ${baseURL}`);

test.use({
    baseURL,
});

const runTestsForFramework = (framework: InternalFramework) => {
    test.describe(framework, async () => {
        const allExamples = await getFrameworkExamples(framework);

        const allExamplesCount = allExamples.length;
        // Get every nth example based on the percentage of tests to run
        const nthExample = Math.round(allExamplesCount / (fractionToRun * allExamplesCount));
        const offset = new Date().getDate() % nthExample;

        const filteredExamples = allExamples.filter((_, i) => (i + offset) % nthExample === 0);

        for (const e of filteredExamples) {
            const { url } = getExampleConfig(e);

            let errors: string[];
            test.beforeEach(async ({ page }) => {
                errors = setupConsoleExpectations(page);
            });

            test(`${baseURL}${url}`, async ({ page }) => {
                await runExampleSpec(page, url, errors);
            });
        }
    });
};

const allFrameworks: InternalFramework[] = [
    'vanilla',
    'typescript',
    'reactFunctional',
    'reactFunctionalTs',
    'angular',
    'vue3',
];
for (const f of allFrameworks) {
    runTestsForFramework(f);
}
