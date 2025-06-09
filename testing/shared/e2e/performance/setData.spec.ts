import { waitFor } from '../../playwright.utils';
import test from './benchmarking';

import path = require('path');

const noRowsCheck = () => document.body.textContent.includes('No Rows To Show');
const athleteCheck = () => document.body.textContent.includes('Athlete');
const localLotsOfCells = `file://${path.join(__dirname, './lots-of-cells.html')}`;

test(`Performance Test - Compare performance of setting data`, {
    timeout: 45 * 60_000,
    minIterations: 100,
    testCases: [
        {
            skip: true, // only enable for sanity check
            name: 'examples/performance-test/lots-of-cells',
            framework: 'typescript',
            control: { version: 'prod' },
            variant: { version: 'prod' },
            setupPreActions: async (page) => {
                await page.getByText('Clear').click({ force: true });
                await waitFor(noRowsCheck, page);
            },
            actions: async (page) => {
                await page.getByText('Set Data').click({ force: true });
                await waitFor(athleteCheck, page);
            },
            metrics: 'long-animation-frame',
        },
        {
            name: 'lots of cells with injected script',
            framework: 'typescript',
            control: { version: 'local', url: localLotsOfCells, shouldInjectScript: true },
            variant: { version: 'v33.0.0', url: localLotsOfCells, shouldInjectScript: true },
            preSetup: async (page) => {
                await page.getByText('Run grid').click({ force: true });
            },
            setupPreActions: async (page) => {
                await page.getByText('Clear').click({ force: true });
                await waitFor(noRowsCheck, page);
            },
            actions: async (page) => {
                await page.getByText('Set Data').click({ force: true });
                await waitFor(athleteCheck, page);
            },
            metrics: 'long-animation-frame',
        },
        {
            name: 'examples/performance-test/lots-of-cells',
            framework: 'reactFunctionalTs',
            control: { version: 'prod' },
            variant: { version: 'staging' },
            setupPreActions: async (page) => {
                await page.getByText('Clear').click({ force: true });
                await waitFor(noRowsCheck, page);
            },
            actions: async (page) => {
                await page.getByText('Set Data').click({ force: true });
                await waitFor(athleteCheck, page);
            },
            metrics: 'long-animation-frame',
        },
    ],
});
