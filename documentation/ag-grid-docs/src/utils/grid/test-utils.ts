/* eslint-disable no-empty-pattern */
import type { Locator, Page, Response, TestType } from '@playwright/test';
import { test as base, expect as playwrightExpect } from '@playwright/test';

import { type AgModuleName, wrapAgTestIdFor } from 'ag-grid-community';

import { applyCpuThrottle, clearCpuThrottle } from './test/applyCpuThrottle';
import { routeExampleAssetsFromDisk, routeExternalThroughMirror, warnOnNetworkAccess } from './test/localSources';
import { type AsyncGridApi, type EventLog, createRemoteGridApiProxy } from './test/remoteGridapi';
import { shouldBeAsyncGuard } from './test/shouldBeAsyncGuard';
import { WAF_BYPASS_HEADER, wafBypassSecret } from './test/wafBypass';

type ExtractFixtures<T> = T extends TestType<infer A, infer O> ? A & O : never;

// Extract the fixtures from the base test type as Playwright doesn't export them directly
type PlaywrightFixtures = ExtractFixtures<typeof base>;

type AgIdFor = ReturnType<typeof wrapAgTestIdFor<Locator>>;
type LoadPageOptions = {
    prod: boolean;
    version: string;
};

type RemoteGrid = ((page: Page, gridId?: string) => AsyncGridApi) & {
    eventLog: EventLog;
    waitForEventlog: (timeoutMs: number) => Promise<EventLog>;
};

export type AgGridFixtures = {
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
    bypassRequestCache: boolean;
    localSources: void;
    wafBypass: void;
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

/**
 * React is the only framework declared twice - once on the production build, once forcing the development
 * one - so this only ever drops a React variant. That is a sixth of the suite, and locally the development
 * build is the one worth the wall clock, so CI runs both and a local run does not.
 */
const runAllFrameworkVariants = !!process.env.CI || process.env.ALL_FRAMEWORK_VARIANTS === 'true';

const PROD_VARIANT_FRAMEWORK = 'reactFunctionalTs';

// Filter frameworks based on FRAMEWORK environment variable
function getFilteredFrameworks(): readonly AgFramework[] {
    const frameworkFilter = process.env.FRAMEWORK;
    if (frameworkFilter) {
        const requestedFramework = frameworkFilter as AgFramework;
        if (ALL_FRAMEWORKS.includes(requestedFramework)) {
            return [requestedFramework] as const;
        } else {
            throw new Error(
                `Invalid framework specified in FRAMEWORK environment variable: ${frameworkFilter}. Valid options are: ${ALL_FRAMEWORKS.join(', ')}`
            );
        }
    }
    if (!runAllFrameworkVariants) {
        return ALL_FRAMEWORKS.filter((framework) => framework !== PROD_VARIANT_FRAMEWORK);
    }
    return ALL_FRAMEWORKS;
}

const FILTERED_FRAMEWORKS = getFilteredFrameworks();

// One worker, so a run says once what it is doing rather than once per worker.
if (process.env.TEST_WORKER_INDEX === '0' && !process.env.FRAMEWORK) {
    // eslint-disable-next-line no-console
    console.log(
        runAllFrameworkVariants
            ? `Running all framework variants: ${FILTERED_FRAMEWORKS.join(', ')}`
            : `Skipping the ${PROD_VARIANT_FRAMEWORK} variant - set ALL_FRAMEWORK_VARIANTS=true to include it`
    );
}

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
    'Window.fullScreen attribute is deprecated and will be removed in the future.',
    'XML Parsing Error: not well-formed',
    'XML Parsing Error: syntax error',
    'Layout was forced before the page was fully loaded. If stylesheets are not yet loaded this may cause a flash of unstyled content.',
    'Request to access cookie or storage on “<URL>” was blocked because it came from a tracker and Enhanced Tracking Protection is enabled.',
    'This site appears to use a scroll-linked positioning effect.',
    // Timing-dependent browser warning: a preloaded font occasionally isn't consumed within the
    // browser's few-second window (e.g. under CI load), emitting a benign warning unrelated to the grid.
    'preloaded with link preload was not used within a few seconds',
    // AG-17134: staging serves a Content-Security-Policy-Report-Only header with no report endpoint
    // (violations are captured via the securitypolicyviolation JS listener, not report-uri/report-to).
    // Browsers warn that such a policy can't report — benign for our validation window.
    'has a Report-Only policy without a report-uri directive nor a report-to directive', // Firefox
    "was delivered in report-only mode, but does not specify a 'report-uri'", // Chromium
    "was delivered in report-only mode, but does not specify a 'report-to'", // Chromium
    "directive 'frame-ancestors' is ignored when delivered in a report-only policy",
    // React warnings from examples that intentionally render read-only controls / raw style props.
    'You provided a `checked` prop to a form field without an `onChange` handler.',
    'Unsupported style property %s. Did you mean %s? white-space whiteSpace',
    'Unsupported style property %s. Did you mean %s? white-space-collapse whiteSpaceCollapse',
];

// Markers present in the CloudFront/WAF "Request blocked" error page served instead of the example.
const wafBlockMarkers = ['Generated by cloudfront', 'The request could not be satisfied'];

export function setupConsoleExpectations(page: Page, allowedMessages: string[] = []) {
    const errors: string[] = [];

    // catch any errors or warnings and fail the test
    page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            const text = msg.text();
            if (!licenseTexts.includes(text)) {
                // `allowedMessages` lets an example opt into expected console output (e.g. a diagnostic it
                // intentionally demonstrates), scoped to that example rather than the global exclude list.
                if (excludeErrors.some((e) => text.includes(e)) || allowedMessages.some((e) => text.includes(e))) {
                    test.skip(false, text);
                } else {
                    // A failed request (e.g. 403) only names the offending URL in the message location,
                    // not in the text, so append it to keep the CI report diagnosable.
                    const url = msg.location().url;
                    errors.push(url ? `${text} (${url})` : text);
                }
            }
        }
    });

    return errors;
}

// Detects a CDN/WAF block page so callers can fail fast instead of waiting out the full timeout
// for a grid that will never appear.
async function isWafBlockResponse(response: Response | null): Promise<boolean> {
    if (!response || response.status() !== 403) {
        return false;
    }

    try {
        const body = await response.text();
        return wafBlockMarkers.some((marker) => body.includes(marker));
    } catch {
        // Body unreadable (e.g. already consumed/streamed) - not enough to call this a block page.
        return false;
    }
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

    // Stated rather than left to the boilerplate, whose default is the development build - so the two React
    // variants both loaded it and the production build was never actually exercised.
    if (loadPageOptions?.prod || (loadPageOptions?.prod === undefined && agFramework === PROD_VARIANT_FRAMEWORK)) {
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

    // The trailing slash is the canonical form for a deployed example (see urlWithPrefix). Without it
    // both staging and the archive answer 301, so every page load costs an extra round trip.
    const url = `./examples/${agExampleUrl}/${urlFramework}/?${queryParams.toString()}`;
    const response = await page.goto(url);

    if (await isWafBlockResponse(response)) {
        throw new Error(
            `Request blocked by the CDN/WAF (403) for ${url} - this is an infrastructure block, not a grid defect. ` +
                `Likely the runner's IP was flagged; check the WAF before investigating the grid.`
        );
    }

    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    // await page.waitForLoadState('networkidle'); Not recommended by Playwright as can lead to tests hanging

    return page;
}

export const extended = base.extend<TestFixtures>({
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
    remoteGrid: [
        ({ page }, use) => {
            const eventLog: any[] = [];

            const fn = (page: Page, gridId: string) => createRemoteGridApiProxy(page, gridId, eventLog);
            fn.eventLog = eventLog;
            fn.waitForEventlog = async (timeoutMs: number) => {
                await page.waitForTimeout(timeoutMs);
                return eventLog;
            };

            use(fn as unknown as RemoteGrid);
        },
        { option: true },
    ],
    cpuThrottle: [undefined, { option: true }],
    // A fixture rather than a loadPage call so specs that navigate themselves get them too. Declared before
    // wafBypass, which must register later to run first and pass its header down via fallback.
    localSources: [
        async ({ page, baseURL, bypassRequestCache }, use) => {
            if (bypassRequestCache || !baseURL) {
                await use();
                return;
            }
            const siteOrigin = new URL(baseURL).origin;
            // Ordered, not concurrent: the later route matches first, and a shipped asset must beat the
            // mirror to it. Registered together, whichever won the race decided whether disk or the CDN
            // served `/example-assets/`.
            await routeExternalThroughMirror(page, siteOrigin);
            await routeExampleAssetsFromDisk(page);
            await use();
        },
        { auto: true },
    ],
    // Attaches the WAF bypass header to the site's own origin only. Playwright's context-level
    // extraHTTPHeaders would send it with every request an example makes, including third-party CDNs
    // (jsdelivr, Google Fonts), leaving the secret in logs we do not control.
    wafBypass: [
        async ({ page, baseURL }, use) => {
            const secret = wafBypassSecret;
            if (!secret || !baseURL) {
                await use();
                return;
            }

            const siteOrigin = new URL(baseURL).origin;
            await page.route(
                (url) => url.origin === siteOrigin,
                async (route) => {
                    const headers = route.request().headers();
                    headers[WAF_BYPASS_HEADER] = secret;
                    await route.fallback({ headers });
                }
            );

            await use();
        },
        { auto: true },
    ],
});

const frameworkTest =
    (agFramework: AgFramework) =>
    /**
     * Run the test against a specific framework.
     * @param testName Names of this test case. Useful if running multiple tests against the same example.
     * @param testBody The test body function that will be executed for each framework.
     */
    (
        testName: string | undefined,
        testBody: (fixtures: TestFixtures) => Promise<void>,
        opts?: { allowedConsoleMessages?: string[] }
    ): void => {
        // A single-framework test (test.typescript(...), etc.) hardcodes its framework, bypassing the
        // FRAMEWORK filter that eachFramework applies via FILTERED_FRAMEWORKS. Declaring a test only to
        // skip it at runtime when the CI job targets another framework produces a fake "skipped" result
        // and still spins up a browser fixture, so don't declare it at all for a filtered-out framework.
        if (!FILTERED_FRAMEWORKS.includes(agFramework)) {
            return;
        }

        extended.use({ agFramework });

        // cachedRoute needs to be destructured in testWrapper for Playwright to initialise it correctly
        const testWrapper = async (
            {
                page,
                agExampleUrl,
                agIdFor,
                loadPageOptions,
                remoteGrid,
                agModules,
                cpuThrottle,
                baseURL,
                request,
                context,
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
            await testBody({
                page,
                agExampleUrl,
                agIdFor,
                agFramework,
                loadPageOptions,
                remoteGrid,
                baseURL,
                request,
                context,
            } as TestFixtures);
            await clearCpuThrottle({ page, cpuThrottle });
        };

        if (testName) {
            extended.describe(testName, () => {
                let errors: string[];
                extended.beforeEach(async ({ page }) => {
                    errors = setupConsoleExpectations(page, opts?.allowedConsoleMessages);
                });

                extended(`${agFramework} (only)`, testWrapper);

                extended.afterEach(async ({ page }) => {
                    await checkForErrorsAndTearDownExample(errors, page);
                });
            });
        } else {
            extended(`${agFramework}`, testWrapper);
        }
    };

/**
 * Run the same test against all frameworks (or filtered frameworks based on FRAMEWORK env var).
 * @param testName Names of this test case. Useful if running multiple tests against the same example.
 * @param testBody The test body function that will be executed for each framework.
 */
const eachFramework = (
    testName: string,
    testBody: (fixtures: TestFixtures) => Promise<void>,
    opts?: { allowedConsoleMessages?: string[] }
) => {
    extended.describe(testName, () => {
        let errors: string[];
        extended.beforeEach(async ({ page }) => {
            errors = setupConsoleExpectations(page, opts?.allowedConsoleMessages);
        });

        FILTERED_FRAMEWORKS.forEach((framework) => frameworkTest(framework)(undefined, testBody));

        extended.afterEach(async ({ page }) => {
            await checkForErrorsAndTearDownExample(errors, page);
        });
    });
};

async function checkForErrorsAndTearDownExample(errors: string[], page: Page) {
    // If the test was skipped, don't check for errors that might have been logged about a missing example URL
    // or other errors that are expected when skipping a test
    if (test.info().status === 'skipped') {
        return;
    }
    // log url if any errors
    if (test.info().status === 'failed') {
        // eslint-disable-next-line no-console
        console.log(`Test failed, page URL: ${page.url()}`);
    }

    if (errors.length > 0) {
        const errorMessage = `Error / Warnings found in console:\n\n - ${errors.join('\n\n - ')}\n\n${page.url()}`;

        expect(errors.length, errorMessage).toBe(0);
        errors = [];
    }

    const exampleRemoved = await page.evaluate(() => {
        const win: any = window;
        if (!win.tearDownExample) {
            return false;
        }
        win.tearDownExample();
        return true;
    });
    if (exampleRemoved) {
        const root = page.locator('.ag-root-wrapper');
        await root.waitFor({ state: 'detached' });
    }

    expect(errors, 'Example Errors during destruction').toEqual([]);

    if (errors.length > 0) {
        const errorMessage = `Error / Warnings found in console:\n\n - ${errors.join('\n\n - ')}\n\n${page.url()}`;
        expect(errors.length, errorMessage).toBe(0);
    }

    // Ensure the routes registered by the fixtures are removed to avoid warnings in the logs
    await page.unrouteAll({ behavior: 'ignoreErrors' });

    warnOnNetworkAccess();
}

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

const expect = shouldBeAsyncGuard<typeof extended.expect>(playwrightExpect);
const describe = test.describe;

export { expect, describe, test };

export async function dragFillHandleOverTo(fillHandle: Locator, target: Locator) {
    return dragOverTo(fillHandle, target, 'bottomRight');
}

export async function dragOverTo(source: Locator, target: Locator, offsetPosition?: 'bottomRight') {
    const { mouse } = source.page();
    await source.hover();
    await source.hover();
    await mouse.down();

    let hoverParams = undefined;
    if (offsetPosition === 'bottomRight') {
        // Hover near the bottom right of the target cell to ensure we're in the cell's drop zone and not just near it which can cause issues with mouse events not firing
        const box = await target.boundingBox();
        hoverParams = {
            position: {
                x: box ? box.width - 10 : 0,
                y: box ? box.height - 10 : 0,
            },
        };
    }
    await target.hover(hoverParams);
    await target.hover(hoverParams);

    await mouse.up();
}

/**
 * Waits until row animations have settled — i.e. no "zombie" rows remain in the DOM.
 *
 * Row animations leave zombie rows in the DOM for ~400ms. A zombie and its
 * replacement share the same `row-id`, causing strict-mode locators to throw a
 * "resolved to N elements" error. Call this helper after any action that triggers
 * row expansion/collapse before making strict-mode assertions.
 *
 * Implementation notes:
 * - Yields one animation frame first so that any pending DOM mutations from the
 *   preceding action are applied before polling begins (avoids a false early pass).
 * - Checks uniqueness within each row container independently. AG Grid renders the
 *   same logical row in multiple containers (left-pinned, center, right-pinned);
 *   those cross-container duplicates are permanent and expected, so a global
 *   uniqueness check would hang on grids with pinned columns.
 */
export async function waitForRowAnimations(page: Page) {
    // Flush any pending microtasks / rAF callbacks so DOM mutations from the
    // preceding action are visible before we start polling.
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

    await page.waitForFunction(() => {
        // AG Grid renders rows across several named containers. Zombie rows only
        // appear as duplicates *within* the same container, not across containers.
        const centerContainerSelectors = [
            '.ag-grid-scrolling-container',
            '.ag-grid-pinned-top-rows-container',
            '.ag-grid-pinned-bottom-rows-container',
            '.ag-grid-sticky-top-rows-container',
            '.ag-grid-sticky-bottom-rows-container',
        ].join(', ');

        for (const container of document.querySelectorAll(centerContainerSelectors)) {
            const seen = new Set<string>();
            for (const row of container.querySelectorAll('.ag-row')) {
                const rowId = row.getAttribute('row-id');
                if (!rowId) {
                    continue;
                }
                if (seen.has(rowId)) {
                    return false;
                }
                seen.add(rowId);
            }
        }
        return true;
    });
}

/**
 * Assert which row-id occupies a given `row-index` once the grid has settled after a sort.
 *
 * A sort that moves a row a long distance animates the outgoing row out over one animation
 * cycle, during which the DOM briefly holds a second element sharing the moved row's
 * row-id/row-index, and the moved row may leave the viewport (virtualised out) entirely.
 * Asserting a specific row's `row-index` is therefore fragile — a strict-mode duplicate while
 * the animation runs, or element-not-found once the row scrolls out. Reading the row-id at a
 * fixed, always-rendered index inside a retry rides out that transient.
 */
export async function expectRowIdAtIndex(page: Page, rowIndex: number, rowId: string, options: { not?: boolean } = {}) {
    const row = page.locator(`.ag-grid-scrolling-container .ag-row[row-index="${rowIndex}"]`);
    await expect(async () => {
        const actual = await row.getAttribute('row-id');
        if (options.not) {
            expect(actual).not.toBe(rowId);
        } else {
            expect(actual).toBe(rowId);
        }
    }).toPass();
}

/**
 * Click a column header's label to cycle its sort.
 *
 * Clicking the header cell itself targets the cell's centre. On a narrow column whose menu and
 * filter buttons are always shown, those icons occupy the centre, so the click opens the menu
 * instead of sorting. The label is always the sort target, whatever the remaining width.
 */
export async function clickHeaderToSort(headerCell: Locator) {
    await headerCell.locator('.ag-header-cell-label').click();
}

export async function clickAllButtons(page: Page) {
    // Click all visible buttons in the grid example
    // Don't use buttons within the ag-root-wrapper as these are not part of the example
    // and will cause the test to fail if they are clicked
    const buttons = page.locator('button:visible:not([disabled]):not(.ag-root-wrapper button):not(.ag-chart button)');
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
        await buttons.nth(i).click();
    }
}

export type ConsistentDomOptions = {
    /** Root element to serialise. Defaults to `.ag-root-wrapper` (the framework-independent grid subtree). */
    rootSelector?: string;
    /** Snapshot file name (shared across all frameworks). Defaults to `grid-dom.html`. */
    snapshotName?: string;
    /** Include trimmed text content of elements. Defaults to `true`. Disable for examples with volatile text (timestamps, random data). */
    includeText?: boolean;
    /** Extra attribute names to drop before comparing (in addition to the volatile defaults). */
    ignoreAttributes?: string[];
    /**
     * Collapse measured pixel values and virtualisation transforms in `style` attributes. Defaults to
     * `false`, so widths, offsets and scroll positions are compared as their real values. Set to
     * `true` when comparing across frameworks or browsers, where measured layout legitimately differs
     * ({@link expectConsistentFrameworkDom} does this).
     */
    normalisePixels?: boolean;
};

// Attributes dropped before comparing:
// - runtime-generated ids / id references (`id`, `aria-*`, `for`) which are not structural
// - `data-ref`: the grid core sets these on internal elements in the vanilla/Angular/Vue wrappers, but the
//   React wrapper renders equivalent elements without them. This is a known, systematic wrapper difference
//   (present on almost every element), so ignoring it keeps the guard focused on genuine class/structure drift.
//   Pass a spec-specific `ignoreAttributes` if you need to relax further.
const DEFAULT_VOLATILE_ATTRIBUTES = [
    'id',
    'aria-labelledby',
    'aria-describedby',
    'aria-activedescendant',
    'aria-controls',
    'aria-owns',
    'for',
    'data-ref',
    // Monotonic component-instance counter — value depends on creation order, not structure.
    'comp-id',
];

/**
 * Opt-in assertion that the grid DOM is structurally identical across framework variants.
 *
 * Call this from inside a `test.eachFramework(...)` block. Because the Playwright
 * `snapshotPathTemplate` contains no framework/project token, every framework compares against
 * the same committed baseline file — so any divergence in the grid's classes / DOM structure
 * (typically from a hand-written `provided/` variant drifting from the generated ones) fails the test.
 *
 * Only the subtree rooted at `.ag-root-wrapper` is compared: that is produced by the grid core and
 * is expected to be identical, whereas the outer host element (`ag-grid-angular`, `ag-grid-vue`,
 * React provider div, vanilla `#myGrid`) legitimately differs and is excluded.
 *
 * The serialised markup is normalised to remove non-structural noise: measured pixel values and
 * transforms are collapsed (frameworks and browsers measure layout differently), generated ids are
 * dropped, and class lists are sorted.
 *
 * The first framework to run writes the shared baseline snapshot (`<spec>-snapshots/grid-dom.html`);
 * commit it alongside the spec. On the initial run Playwright reports the baseline-writing test as
 * failed — re-run and it passes.
 *
 * @example
 * // Simplest usage — compare the grid DOM across every framework variant.
 * import { expectConsistentFrameworkDom, test } from '@utils/grid/test-utils';
 *
 * test.agExample(import.meta, () => {
 *     test.eachFramework('renders a consistent grid DOM across frameworks', async ({ page }) => {
 *         await expectConsistentFrameworkDom(page);
 *     });
 * });
 *
 * @example
 * // Example with volatile text (timestamps, random data) or extra runtime attributes to ignore.
 * test.eachFramework('renders a consistent grid DOM across frameworks', async ({ page }) => {
 *     await expectConsistentFrameworkDom(page, {
 *         includeText: false,
 *         ignoreAttributes: ['data-generated-timestamp'],
 *     });
 * });
 *
 * @example
 * // Compare a sub-section of the grid, with a distinct snapshot name if called more than once per spec.
 * test.eachFramework('header is consistent across frameworks', async ({ page }) => {
 *     await expectConsistentFrameworkDom(page, {
 *         rootSelector: '.ag-header',
 *         snapshotName: 'header-dom.html',
 *     });
 * });
 */
export async function expectConsistentFrameworkDom(page: Page, options?: ConsistentDomOptions) {
    const snapshotName = options?.snapshotName ?? 'grid-dom.html';

    // One baseline is shared by every framework and browser, where measured layout legitimately differs.
    const serialised = await serializeGridDom(page, { normalisePixels: true, ...options });

    playwrightExpect(serialised).toMatchSnapshot(snapshotName);
}

/**
 * Serialise the rendered grid DOM to a normalised, comparable string.
 *
 * This is the primitive behind {@link expectConsistentFrameworkDom}. Use it directly to compare
 * the rendered grid at two points in the same test — for example capturing the grid before and
 * after a destroy/recreate cycle to assert that restored state renders identically:
 *
 * @example
 * const before = await serializeGridDom(page);
 * await recreateGrid();
 * await waitForGridContent(page);
 * expect(await serializeGridDom(page)).toBe(before);
 *
 * Only the subtree rooted at `rootSelector` (default `.ag-root-wrapper`, the grid core's output) is
 * serialised, so the differing framework host element is excluded. Generated ids / `comp-id`s are
 * dropped and class lists are sorted, while measured pixel values are compared as-is unless
 * `normalisePixels` is set.
 */
export async function serializeGridDom(page: Page, options?: ConsistentDomOptions): Promise<string> {
    const rootSelector = options?.rootSelector ?? '.ag-root-wrapper';
    const includeText = options?.includeText ?? true;
    const volatileAttributes = [...DEFAULT_VOLATILE_ATTRIBUTES, ...(options?.ignoreAttributes ?? [])];
    const normalisePixels = options?.normalisePixels ?? false;

    // Wait for the grid to render before serialising — the raw page.evaluate does not auto-wait like a locator.
    await page.locator(rootSelector).first().waitFor({ state: 'attached' });

    const serialised = await page.evaluate(
        ({ rootSelector, includeText, volatileAttributes, normalisePixels }) => {
            const root = document.querySelector(rootSelector);
            if (!root) {
                return null;
            }

            const normaliseStyle = (value: string): string => {
                const measured = normalisePixels
                    ? value
                          // Collapse measured pixel values (widths, offsets) that depend on runtime layout.
                          .replace(/-?\d+(\.\d+)?px/g, 'Npx')
                          // Collapse virtualisation transforms.
                          .replace(/translate[XY3d]*\([^)]*\)/g, 'translate(_)')
                    : value;
                const collapsed = measured.replace(/\s+/g, ' ').trim();
                // Sort declarations — property order is not structurally significant and varies by framework.
                return collapsed
                    .split(';')
                    .map((d) => d.trim())
                    .filter(Boolean)
                    .sort()
                    .join('; ');
            };

            const lines: string[] = [];

            const walk = (el: Element, depth: number): void => {
                const indent = '  '.repeat(depth);
                const tag = el.tagName.toLowerCase();

                const attrs = Array.from(el.attributes)
                    .filter((a) => !volatileAttributes.includes(a.name))
                    .map((a): [string, string] => {
                        if (a.name === 'style') {
                            return [a.name, normaliseStyle(a.value)];
                        }
                        if (a.name === 'class') {
                            return [a.name, a.value.split(/\s+/).filter(Boolean).sort().join(' ')];
                        }
                        return [a.name, a.value];
                    })
                    .filter(([, v]) => v !== '')
                    .sort((x, y) => (x[0] < y[0] ? -1 : 1))
                    .map(([n, v]) => `${n}="${v}"`);

                const openTag = `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>`;

                const elementChildren = Array.from(el.children);
                if (elementChildren.length === 0) {
                    const text = includeText ? (el.textContent ?? '').replace(/\s+/g, ' ').trim() : '';
                    lines.push(`${indent}${openTag}${text}</${tag}>`);
                    return;
                }

                lines.push(`${indent}${openTag}`);
                for (let i = 0, len = elementChildren.length; i < len; ++i) {
                    walk(elementChildren[i], depth + 1);
                }
                lines.push(`${indent}</${tag}>`);
            };

            walk(root, 0);
            return lines.join('\n');
        },
        { rootSelector, includeText, volatileAttributes, normalisePixels }
    );

    if (serialised === null) {
        throw new Error(`Element matching '${rootSelector}' was detached before it could be serialised`);
    }

    return serialised;
}

export { ensureGridReady, waitForGridContent } from './test/remoteGridapi';
export { orderedValues } from './test/orderedValues';
export { repeat } from './test/repeat';
export { scrollGridRelative } from './test/scrollGridRelative';
export { waitForChartModels } from './test/waitForChartModels';
