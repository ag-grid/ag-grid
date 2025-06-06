import { waitFor } from '../../playwright.utils';
import type { Describe } from './framework';
import test from './framework';

const describe: Describe = {
    name: 'Compare performance of setting data',
    iterations: 50,
    timeout: 15 * 60_000, // 15 minutes
    testCases: [
        {
            name: 'examples/performance-test/lots-of-cells',
            framework: 'typescript',
            control: { version: 'prod' },
            variant: { version: 'staging' },
            setup: async (page) => {
                await page.getByText('Clear').click();
            },
            actions: async (page) => {
                await page.getByText('Set Data').click();
                await waitFor(() => document.body.textContent.includes('Athlete'), page);
            },
            metrics: 'long-animation-frame',
        },
        {
            name: 'examples/performance-test/lots-of-cells',
            framework: 'reactFunctionalTs',
            control: { version: 'prod' },
            variant: { version: 'staging' },
            setup: async (page) => {
                await page.getByText('Clear').click();
            },
            actions: async (page) => {
                await page.getByText('Set Data').click();
                await waitFor(() => document.body.textContent.includes('Athlete'), page);
            },
            metrics: 'long-animation-frame',
        },
    ],
};

test(`Performance Test - ${describe.name} - ${describe.iterations} iterations`, describe);
