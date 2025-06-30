import { test } from '@playwright/test';

import { getExampleConfig, getFrameworkExamples, runExampleSpec, setupConsoleExpectations } from './exampleTestRunner';
import type { InternalFramework } from './exampleTestRunner';

const allFrameworks: InternalFramework[] = [
    'vanilla',
    'typescript',
    'reactFunctional',
    'reactFunctionalTs',
    'angular',
    'vue3',
];

const framework: InternalFramework | undefined = process.env.FRAMEWORK as InternalFramework;

if (framework !== undefined && !allFrameworks.includes(framework)) {
    throw new Error(
        `Invalid FRAMEWORK environment variable. Expected one of ${allFrameworks.join(', ')}, but got "${framework}".`
    );
}

const runTestsForFramework = (framework: InternalFramework) => {
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
};

for (const f of allFrameworks) {
    if (framework !== undefined) {
        if (f !== framework) {
            continue; // Skip if the framework does not match
        }
        console.log(`Running tests for framework: ${framework}`);
        runTestsForFramework(f);
    } else {
        runTestsForFramework(f);
    }
}
