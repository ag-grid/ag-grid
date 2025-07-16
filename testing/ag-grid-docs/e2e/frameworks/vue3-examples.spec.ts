import { test } from '@playwright/test';

import { getExampleConfig, getFrameworkExamples, runExampleSpec, setupConsoleExpectations } from '../exampleTestRunner';

const framework = 'vue3';

test.describe(framework, async () => {
    const allExamples = await getFrameworkExamples(framework);

    for (const e of allExamples) {
        const { examplePath, url } = getExampleConfig(e);

        let errors: string[];
        test.beforeEach(async ({ page }) => {
            errors = setupConsoleExpectations(page);
        });

        test(`${examplePath}`, async ({ page }) => {
            await runExampleSpec(page, url, errors);
        });
    }
});
