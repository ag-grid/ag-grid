import { readFileSync, writeFileSync } from 'fs';

type Example = {
    pageName: string;
    exampleName: string;
    internalFramework: 'vanilla' | 'typescript' | 'angular' | 'reactFunctional' | 'reactFunctionalTs' | 'vue2';
};

const ENV_BASE_URLS = {
    dev: 'https://localhost:4610',
    staging: 'https://grid-staging.ag-grid.com',
    production: 'https://www.ag-grid.com',
};

const environment = process.env.NX_TASK_TARGET_CONFIGURATION || 'staging';

const baseUrl = `${ENV_BASE_URLS[environment]}/examples/`;

const examplesFile: Example[] = JSON.parse(readFileSync('./all-examples.json', 'utf8'));
const examplesToProcess = examplesFile.filter((example) => example.internalFramework === 'vanilla');
const examplesByPageName = examplesToProcess.reduce((acc, example: Example) => {
    const { pageName } = example;
    acc[pageName] = acc[pageName] || [];
    acc[pageName] = [...acc[pageName], example];
    return acc;
}, {});

const TEST_TEMPLATE = `
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('@EXAMPLE_PAGE_NAME@ Tests', () => {
@TEST_CASE@
});`;

const TEST_CASE_TEMPLATE = `
    test('Test @EXAMPLE_NAME@ for accessibility violations', async ({page}) => {
        await page.goto('@EXAMPLE_URL@');

        await page.waitForLoadState('domcontentloaded');
        await page.waitForLoadState('load');
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({page})
            .include('.ag-root')
            .analyze();
        const criticalViolations = accessibilityScanResults.violations.filter(result => result.impact === 'critical');

        expect(criticalViolations).toHaveLength(0);
    });`;

Object.keys(examplesByPageName).forEach((pageName) => {
    let pageExamples = TEST_TEMPLATE.replace('@EXAMPLE_PAGE_NAME@', pageName);

    examplesByPageName[pageName].forEach((example) => {
        const { exampleName, internalFramework } = example;
        const testCase = TEST_CASE_TEMPLATE.replace('@EXAMPLE_NAME@', exampleName).replace(
            '@EXAMPLE_URL@',
            `${baseUrl}${pageName}/${exampleName}/${internalFramework}/`
        );

        pageExamples = pageExamples.replace('@TEST_CASE@', testCase + '\n@TEST_CASE@');
    });

    pageExamples = pageExamples.replace('@TEST_CASE@', '');

    writeFileSync(`./e2e/${pageName}.spec.js`, pageExamples, 'utf8');
});
