import type { TestCase } from '../../benchmarking';
import { getUrl } from '../../benchmarking';
import test from '../../benchmarking';
import { waitFor } from '../../playwright.utils';

const athleteCheck = () => document.body.textContent!.includes('Tony Smith');
test(`Performance Test - `, {
    timeout: 10 * 60_000,
    minIterations: 5,
    maxIterations: 10,
    warmupIterations: 5,
    testCases: [
        {
            name: 'example',
            description: 'Scheduled: demo pages',
            control: { version: 'local', url: getUrl({ url: 'https://localhost:4610/example/?rows=100000&cols=10' }) },
            variant: {
                version: 'staging',
                url: getUrl({ url: 'https://grid-staging.ag-grid.com/example/?rows=100000&cols=10' }),
            },
            preSetup: async (page) => {
                page.addScriptTag({ content });
            },
            actions: async (page) => {
                await waitFor(athleteCheck, page);
            },
        } as TestCase,
    ],
});
