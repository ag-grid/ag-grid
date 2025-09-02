/* eslint-disable no-empty-pattern */
import type { Locator, Page, TestType } from '@playwright/test';
import { test as base, expect } from '@playwright/test';
import { CacheRoute } from 'playwright-network-cache';

import { type AgModuleName, wrapAgTestIdFor } from 'ag-grid-community';

import { type AsyncGridApi, type EventLog, createRemoteGridApiProxy } from './test-remote-gridapi-utils';

type ExtractFixtures<T> = T extends TestType<infer A, infer O> ? A & O : never;

// Extract the fixtures from the base test type as Playwright doesn't export them directly
type PlaywrightFixtures = ExtractFixtures<typeof base>;

type AgIdFor = ReturnType<typeof wrapAgTestIdFor<Locator>>;
type LoadPageOptions = {
    prod: boolean;
    version: string;
};

type RemoteGrid = ((page: Page, gridId?: string) => AsyncGridApi) & { eventLog: EventLog };

type AgGridFixtures = {
    agFramework: AgFramework;
    agExampleUrl?: AgExampleUrl;
    /**
     * A locator to get the ag-grid test ID for a specific cell or element.
     */
    agIdFor: AgIdFor;
    loadPageOptions?: LoadPageOptions;
    agModules?: AgModuleName[];
    remoteGrid: RemoteGrid;
    cpuThrottle?: number;
};

type CacheFixtures = {
    cacheRoute?: CacheRoute;
    bypassRequestCache: boolean;
};

type TestFixtures = PlaywrightFixtures & AgGridFixtures & CacheFixtures;

type AgExampleUrl = `${string}/${string}`;
const reactFunctionalTsDev = 'reactFunctionalTs_Dev' as const;
const ALL_FRAMEWORKS = [
    'typescript',
    'vanilla',
    // 'reactFunctional', // These are computed from reactFunctionalTs by Typescript stripping the types so very unlikely to result in different errors to the typescript version
    'reactFunctionalTs',
    reactFunctionalTsDev,
    'angular',
    'vue3',
] as const;
type AgFramework = (typeof ALL_FRAMEWORKS)[number];

const licenseTexts = [
    '****************************************************************************************************************************',
    '************************************************ AG Grid Enterprise License ************************************************',
    '************************************************** License Key Not Found ***************************************************',
    '* All AG Grid Enterprise features are unlocked for trial.                                                                  *',
    '* If you want to hide the watermark please email info@ag-grid.com for a trial license key.                                 *',
    '***************************************** AG Grid and AG Charts Enterprise License *****************************************',
    '* All AG Grid and AG Charts Enterprise features are unlocked for trial.                                                    *',
];

// TEMPORARY: maybe need a cleaner way of ignoring these warnings for specific tests
// Errors that we want to exclude from the test based on partial text match
const excludeErrors = [
    'AG Grid: Using custom components without `reactiveCustomComponents = true` is deprecated.',
    'ERROR ResizeObserver loop completed with undelivered notifications',
    // This error is thrown when a favicon is not found which is not relevant to the test
    'Failed to load resource: the server responded with a status of 404 ()',

    // Firefox specific errors that we want to ignore
    'InstallTrigger is deprecated and will be removed in the future.',
    'onmozfullscreenchange is deprecated.',
    'onmozfullscreenerror is deprecated.',
    'XML Parsing Error: not well-formed',
    'XML Parsing Error: syntax error',
    'Layout was forced before the page was fully loaded. If stylesheets are not yet loaded this may cause a flash of unstyled content.',
    'Request to access cookie or storage on “<URL>” was blocked because it came from a tracker and Enhanced Tracking Protection is enabled.',
];

function setupConsoleExpectations(page: Page) {
    const errors: string[] = [];

    // catch any errors or warnings and fail the test
    page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            const text = msg.text();
            if (!licenseTexts.includes(text)) {
                if (excludeErrors.some((e) => text.includes(e))) {
                    test.skip(false, text);
                } else {
                    errors.push(text);
                }
            }
        }
    });

    return errors;
}

async function loadPage(
    page: Page,
    agExampleUrl: AgExampleUrl,
    agFramework: (typeof ALL_FRAMEWORKS)[number],
    loadPageOptions: LoadPageOptions | undefined,
    agModules: AgModuleName[] | undefined
): Promise<Page> {
    const queryOptions: any = {
        enableTestIds: 'true',
    };

    if (loadPageOptions?.prod) {
        queryOptions.prod = 'true';
    } else if (loadPageOptions?.prod === false || agFramework === reactFunctionalTsDev) {
        queryOptions.prod = 'false';
    }

    if (loadPageOptions?.version) {
        queryOptions.version = loadPageOptions.version;
    }

    if (agModules && agModules.length > 0) {
        queryOptions.modules = agModules.join(',');
    }

    const queryParams = new URLSearchParams(queryOptions);
    const urlFramework = agFramework === reactFunctionalTsDev ? 'reactFunctionalTs' : agFramework;

    await page.goto(`./examples/${agExampleUrl}/${urlFramework}?${queryParams.toString()}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    return page;
}

const extended = base.extend<TestFixtures>({
    agExampleUrl: [({}, use) => use(undefined), { option: true }],
    agFramework: [({}, use) => use(ALL_FRAMEWORKS[0]), { option: true }],
    agIdFor: [
        ({ page }, use) => {
            const wrap = wrapAgTestIdFor((testId: string) => page.getByTestId(testId));
            if (process.env.PRE_34_VERSION) {
                prev34WrapAdapter(wrap, page);
            }
            return use(wrap);
        },
        { option: true },
    ],
    bypassRequestCache: [false, { option: true }],
    loadPageOptions: [({}, use) => use(undefined), { option: true }],
    agModules: [undefined, { option: true }],
    cacheRoute: [
        async ({ page, bypassRequestCache }: TestFixtures, use: (r?: CacheRoute) => Promise<void>) => {
            if (bypassRequestCache) {
                await use(undefined);
                return;
            }

            const cdnPatterns = bypassRequestCache
                ? []
                : [
                      /* jsdelivr */ /cdn\.jsdelivr\.net/,
                      /* fonts.googleapis */ /fonts\.googleapis\.com/,
                      /* fonts.gstatic */ /fonts\.gstatic\.com/,
                      /* ag-grid */ /www\.ag-grid\.com/,

                      // No localhost caching due to known issues with Playwright and localhost caching
                      // https://github.com/vitalets/playwright-network-cache/issues/6
                      // https://github.com/microsoft/playwright/issues/12148
                  ];

            const cacheRoute = new CacheRoute(page, {
                baseDir: '.playwright-network-cache',
                ttlMinutes: 60, // refresh after 60 minutes, long enough for build to complete

                match: (req) => {
                    try {
                        return cdnPatterns.some((re) => re.test(new URL(req.url()).hostname));
                    } catch {
                        return false;
                    }
                },
            });

            await cacheRoute.ALL('**/*'); // send all requests to cacheRoute handler

            await use(cacheRoute);
        },
        { option: true },
    ],
    remoteGrid: [
        ({}, use) => {
            const eventLog: any[] = [];

            const fn = (page: Page, gridId: string) => createRemoteGridApiProxy(page, gridId, eventLog);
            fn.eventLog = eventLog;

            use(fn as unknown as RemoteGrid);
        },
        { option: true },
    ],
    cpuThrottle: [undefined, { option: true }],
});

// Add CPU throttling hooks when cpuThrottle is specified
const applyCpuThrottle = async ({ page, cpuThrottle }: any, testInfo: any) => {
    const envThrottle = process.env.CPU_THROTTLE ? parseInt(process.env.CPU_THROTTLE) : undefined;

    cpuThrottle = cpuThrottle ?? envThrottle;

    if (cpuThrottle && typeof cpuThrottle === 'number') {
        // Use test.step to make it more visible at the top level
        await base.step(`cpuThrottle (${cpuThrottle}x slower)`, async () => {
            const cdpSession = await page.context().newCDPSession(page);
            await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle! });

            // Add annotation to test for better visibility in reports
            testInfo.annotations.push({
                type: 'cpu-throttle',
                description: `CPU throttled ${cpuThrottle}x slower than normal`,
            });
        });
    }
};

const clearCpuThrottle = async ({ page, cpuThrottle }: any) => {
    const envThrottle = process.env.CPU_THROTTLE ? parseInt(process.env.CPU_THROTTLE) : undefined;

    cpuThrottle = cpuThrottle ?? envThrottle;

    if (cpuThrottle && typeof cpuThrottle === 'number') {
        await base.step(`cpuThrottle (normal)`, async () => {
            const cdpSession = await page.context().newCDPSession(page);
            await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: 1 }); // Reset to normal speed
            try {
                await cdpSession.detach();
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error detaching CDP session:', error);
            }
        });
    }
};

const frameworkTest =
    (agFramework: AgFramework) =>
    /**
     * Run the test against a specific framework.
     * @param testName Names of this test case. Useful if running multiple tests against the same example.
     * @param testBody The test body function that will be executed for each framework.
     */
    (testName: string | undefined, testBody: (fixtures: TestFixtures) => Promise<void>): void => {
        extended.use({ agFramework });
        // cachedRoute needs to be destructured in testWrapper for Playwright to initialise it correctly
        const testWrapper = async (
            {
                page,
                agExampleUrl,
                agIdFor,
                cacheRoute: _,
                loadPageOptions,
                remoteGrid,
                agModules,
                cpuThrottle,
            }: TestFixtures,
            testInfo: any
        ) => {
            if (!agExampleUrl) {
                throw new Error(
                    `Missing 'setAgExampleUrl(import.meta)' in the test file. This is required to set the example URL for the test.`
                );
            }

            await loadPage(page, agExampleUrl, agFramework, loadPageOptions, agModules);
            await applyCpuThrottle({ page, cpuThrottle }, testInfo);
            await testBody({ page, agExampleUrl, agIdFor, agFramework, loadPageOptions, remoteGrid } as TestFixtures);
            await clearCpuThrottle({ page, cpuThrottle });
        };

        if (testName) {
            extended.describe(testName, () => {
                let errors: string[];
                extended.beforeEach(async ({ page }) => {
                    errors = setupConsoleExpectations(page);
                });

                extended(`${agFramework} (only)`, testWrapper);

                extended.afterEach(async () => {
                    if (errors.length > 0) {
                        const errorMessage = `Error / Warnings found in console:\n\n - ${errors.join('\n\n - ')}\n\n`;
                        expect(errors.length, errorMessage).toBe(0);
                    }
                });
            });
        } else {
            extended(`${agFramework}`, testWrapper);
        }
    };

/**
 * Run the same test against all frameworks.
 * @param testName Names of this test case. Useful if running multiple tests against the same example.
 * @param testBody The test body function that will be executed for each framework.
 */
const eachFramework = (testName: string, testBody: (fixtures: TestFixtures) => Promise<void>) => {
    extended.describe(testName, () => {
        let errors: string[];
        extended.beforeEach(async ({ page }) => {
            errors = setupConsoleExpectations(page);
        });

        ALL_FRAMEWORKS.forEach((framework) => frameworkTest(framework)(undefined, testBody));

        extended.afterEach(async () => {
            if (errors.length > 0) {
                const errorMessage = `Error / Warnings found in console:\n\n - ${errors.join('\n\n - ')}\n\n`;
                expect(errors.length, errorMessage).toBe(0);
            }
        });
    });
};

function prev34WrapAdapter(wrap: ReturnType<typeof wrapAgTestIdFor<any>>, page: Page) {
    wrap.cell = (rowId: string | null, colId: string | null) => {
        const index = parseInt(rowId ?? '') + 1; // pre-34 rowIds were 1-indexed

        const discriminator = `[row-id="${isNaN(index) ? rowId : index}"]`;

        return page.locator(`:nth-match(.ag-row${discriminator} .ag-cell[col-id="${colId}"], 1)`);
    };
    wrap.autoGroupCell = (rowId: string | null) => wrap.cell(rowId, 'ag-Grid-AutoColumn');
    wrap.fillHandle = () => page.locator('.ag-row .ag-cell .ag-fill-handle');
    wrap.headerCell = (colId: string | null) => page.locator(`.ag-header-cell[col-id="${colId}"]`);
    wrap.headerFilterButton = (colId: string | null) =>
        page.locator(`.ag-header-cell[col-id="${colId}"] .ag-header-cell-filter-button`);
    wrap.filterInstancePickerDisplay = (_: { source: string }) => page.locator(`.ag-picker-field-icon`);
    wrap.numberFilterInstanceInput = (_: { source: string }) =>
        page.locator(`.ag-input-field-input.ag-number-field-input[placeholder="Filter..."]`);
    wrap.rowNode = (rowId: string | null) => page.locator(`.ag-row[row-id="${rowId}"]`);
}

/**
 * Set the example URL for the tests.
 * @param importMeta The import.meta object from the module where this function is called.
 */
function setAgExampleUrl(importMeta: ImportMeta): AgExampleUrl {
    const pSegment = importMeta.url.split('/');

    const page = pSegment[pSegment.length - 4];
    const example = pSegment[pSegment.length - 2];

    const agExampleUrl = `${page}/${example}` as AgExampleUrl;
    extended.use({ agExampleUrl });
    return agExampleUrl;
}

export const agExample = (importMeta: ImportMeta, callback: () => any) => {
    base.describe(setAgExampleUrl(importMeta), () => {
        callback();
    });
};

// Expose call for each framework
const singleFrameworkTests: { [K in AgFramework]: ReturnType<typeof frameworkTest> } = {
    typescript: frameworkTest('typescript'),
    vanilla: frameworkTest('vanilla'),
    reactFunctionalTs: frameworkTest('reactFunctionalTs'),
    reactFunctionalTs_Dev: frameworkTest('reactFunctionalTs_Dev'),
    angular: frameworkTest('angular'),
    vue3: frameworkTest('vue3'),
} as const;

const agGridTestExtension = {
    eachFramework: process.env.PRE_34_VERSION ? frameworkTest('vanilla') : eachFramework,
    agExample,
};

type ExternalTestType = typeof extended & typeof agGridTestExtension & typeof singleFrameworkTests;

const test = Object.assign(extended, agGridTestExtension, singleFrameworkTests) as ExternalTestType;

export { expect, test };

export async function dragOverTo(source: Locator, target: Locator) {
    const { mouse } = source.page();
    await source.hover();
    await source.hover();
    await mouse.down();
    await target.hover();
    await target.hover();
    await mouse.up();
}

export { ensureGridReady } from './test-remote-gridapi-utils';

export async function repeat(
    page: Page,
    title: string,
    fn: () => Promise<void>,
    { count, eachWait, afterAllWait }: { count: number; eachWait?: number; afterAllWait?: number } = { count: 1 }
) {
    await test.step(title, async () => {
        if (count < 2) {
            await fn();
            if (eachWait !== undefined) {
                await page.waitForTimeout(eachWait);
                return;
            }
            if (afterAllWait !== undefined) {
                await page.waitForTimeout(afterAllWait);
            }
        }

        for (let i = 0; i < count; i++) {
            await fn();
            if (eachWait !== undefined) {
                await page.waitForTimeout(eachWait);
            }
        }
        if (afterAllWait !== undefined) {
            await page.waitForTimeout(afterAllWait);
        }
    });
}

export async function scrollGridRelative(
    method: 'wheel' | 'element',
    page: Page,
    { x, y }: { x?: number; y?: number },
    waitForTimeout = 10
) {
    async function scrollElement() {
        const verticalView = page.locator('.ag-body-viewport.ag-row-animation.ag-layout-normal');
        const horizontalView = page.locator('.ag-viewport.ag-center-cols-viewport');

        if (y !== undefined) {
            await verticalView.evaluate((el, { y }) => (el.scrollTop += y), { y });
            await page.waitForTimeout(waitForTimeout);
        }

        if (x !== undefined) {
            await horizontalView.evaluate((el, { x }) => (el.scrollLeft += x), { x });
            await page.waitForTimeout(waitForTimeout);
        }
    }

    async function scrollWheel() {
        if (y !== undefined) {
            await page.mouse.wheel(0, y);
            await page.waitForTimeout(waitForTimeout);
        }

        if (x !== undefined) {
            await page.mouse.wheel(x, 0);
            await page.waitForTimeout(waitForTimeout);
        }
    }

    const directionWord = [];

    if (x !== undefined && x !== 0) {
        directionWord.push(x > 0 ? 'right' : 'left');
    }

    if (y !== undefined && y !== 0) {
        directionWord.push(y > 0 ? 'down' : 'up');
    }

    await test.step(`Scroll grid ${directionWord.join('-')}`, async () => {
        if (method === 'element') {
            await scrollElement();
        } else if (method === 'wheel') {
            await scrollWheel();
        } else {
            // TODO: implement scrolling with keyboard, and scrollbars
        }
    });
}
