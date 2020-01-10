import path from 'path';
import url from 'url';
import glob from 'glob-promise';
import chalk from 'chalk';
import { promises as fs, existsSync } from 'fs';
import { launch, Browser, Page } from 'puppeteer';
import PromisePool from 'es6-promise-pool';
import resemble from 'resemblejs';
import { Spec, SpecResult, SpecDefinition, SpecStep } from './types';
import { getReportHtml } from './reporting';
import { wait, getElement, addErrorMessage, saveErrorFile } from './utils';

const defaultSpecPath = '/example.php';
const defaultSelector = '.ag-root-wrapper';
const exampleBasePath = '/example-runner/vanilla.php';
const maxParallelPageLoads = 8;
const failedTestsFile = 'tmp-failed-tests.txt';

const buildUrlQuery = (base: string, params: object) => {
    Object.entries(params).forEach(([key, value]) => {
        if (typeof value !== 'undefined') {
            const separator = base.includes('?') ? '&' : '?';
            base += separator + encodeURIComponent(key) + '=' + encodeURIComponent(value);
        }
    });
    return base;
};

const createSpecFromDefinition = (definition: SpecDefinition): Spec => {
    let name: string;
    if (definition.name) {
        name = definition.name;
    } else if (definition.exampleSection) {
        name = `${definition.exampleSection}-${definition.exampleId}`;
    } else {
        throw new Error(
            `Spec definitions require a name or an example section: ${JSON.stringify(definition)}`
        );
    }

    return {
        ...definition,
        name,
        steps: definition.steps || [
            {
                name: 'default'
            }
        ],
        urlParams: definition.urlParams || {},
        defaultViewport: definition.defaultViewport || { width: 800, height: 600 },
        withoutThemes: definition.withoutThemes || []
    };
};

interface RunContext {
    browser: Browser;
    passesFilter: Filter;
    server: string;
    handler: (screenshot: Buffer, specName: string) => Promise<void>;
}

// this function runs in the browser so can't reference any other functions or vars in this file
// arguments are passed in by page.evaluateOnNewDocument
const initInBrowser = (theme: string) => {
    try {
        if (document.readyState === 'complete') {
            throw new Error('This code is supposed to be run before ag-grid loads');
        }
        const setTheme = () => {
            const themeElements = document.querySelectorAll(
                '[class^="ag-theme-"], [class*=" ag-theme-"]'
            );
            themeElements.forEach(el => {
                el.className = el.className.replace(/ag-theme-\w+/g, theme);
            });

            if (document.head) {
                const style = document.createElement('style');
                style.innerHTML =
                    // hide text cursor because it blinks, so screenshots vary based on timing
                    `
                    input, textarea {
                        caret-color: transparent !important;
                    }
                    ` +
                    // disable all transitions because they mess up text rendering
                    `
                    * {
                        transition: none !important;
                    }
                    ` +
                    // disable subpixel antialiasing because it causes variations between monitors
                    `
                    * {
                        -webkit-font-smoothing: antialiased; !important;
                    }`;
                document.head.appendChild(style);
            }
        };
        setTheme();
        document.addEventListener('DOMContentLoaded', setTheme);

        // override Math.random with a PRNG so that examples that use random data don't
        // vary between screenshots
        // Uses the Park-Miller PRNG http://www.firstpr.com.au/dsp/rand31/
        let seed = 728364;
        const limit = 2147483647;
        Math.random = () => {
            return (seed = (seed * 16807) % limit) / limit;
        };
    } catch (e) {
        (window as any).initInBrowserError = e.stack || e.message;
    }
};

const getTestCaseName = (spec: Spec, step: SpecStep) => `${spec.name}-${step.name}`;

const getTestCaseImagePath = (folder: string, testCaseName: string) =>
    path.join(folder, `${testCaseName}.png`);

export const runSpec = async (spec: Spec, context: RunContext) => {
    let page: Page | null = null;
    try {
        let path = spec.path;
        if (spec.exampleSection || spec.exampleId) {
            if (path) {
                throw new Error(`Spec ${spec.name} provides both a path and an example.`);
            }
            const type = spec.exampleType || 'generated';
            path = buildUrlQuery(exampleBasePath, {
                section: `javascript-grid-${spec.exampleSection}`,
                example: spec.exampleId,
                generated: type === 'generated' ? 1 : undefined,
                enterprise: !spec.community,
                grid: JSON.stringify({
                    height: '100%',
                    width: '100%',
                    enterprise: spec.community ? undefined : 1
                })
            });
        }
        if (!path) {
            path = defaultSpecPath;
        }
        if (spec.urlParams) {
            path = buildUrlQuery(path, spec.urlParams);
        }

        page = await context.browser.newPage();
        if (spec.urlParams.theme) {
            await page.evaluateOnNewDocument(initInBrowser, spec.urlParams.theme);
        }
        const pageUrl = url.resolve(context.server, path);
        await page.goto(pageUrl);
        const initInBrowserError = await page.evaluate(() => (window as any).initInBrowserError);
        if (initInBrowserError) {
            throw new Error('Error setting theme: ' + initInBrowserError);
        }

        let exampleHasLoaded = false;
        while (!exampleHasLoaded) {
            await wait(500);
            const content = await page.evaluate(() => document.body.textContent);
            exampleHasLoaded = content != null && !content.includes('Loading...');
        }

        const selector = spec.selector || defaultSelector;
        const wrapper = await getElement(page, selector);

        for (let step of spec.steps) {
            const viewport = step.viewport || spec.defaultViewport;
            await page.setViewport(viewport);
            if (step.prepare) {
                await step.prepare(page);
            }
            const testCaseName = getTestCaseName(spec, step);
            if (context.passesFilter(testCaseName)) {
                // let CSS animations stabilise before taking screenshot
                await wait(500);
                const screenshotElement = step.selector
                    ? await getElement(page, step.selector)
                    : wrapper;
                const screenshot = await screenshotElement.screenshot({
                    encoding: 'binary'
                });
                await context.handler(screenshot, testCaseName);
            }
        }
    } catch (e) {
        addErrorMessage(e, `Error in spec ${spec.name}`);
        if (page) {
            const message = await saveErrorFile(page);
            addErrorMessage(e, message);
        }
        throw e;
    }
};

export const runSpecs = async (specs: Spec[], context: RunContext) => {
    let i = 0;
    const generateNextPromise = () => {
        const spec = specs[i++];
        if (!spec) {
            return;
        }
        return runSpec(spec, context);
    };
    await new PromisePool(generateNextPromise, maxParallelPageLoads).start();
};

const ensureEmptyFolder = async (folder: string, deleteImages: boolean) => {
    await fs.mkdir(folder, { recursive: true });
    if (deleteImages) {
        const existing = await glob(path.join(folder, '*.png'));
        await Promise.all(existing.map(file => fs.unlink(file)));
    }
};

interface ImageAnalysisResult {
    isSameDimensions: boolean;
    dimensionDifference: { width: number; height: number };
    rawMisMatchPercentage: number;
    misMatchPercentage: string;
    diffBounds: { top: number; left: number; bottom: number; right: number };
    analysisTime: number;
    getImageDataUrl: () => string;
    getBuffer: () => Buffer;
}

const getImageDifferences = async (
    image1: Buffer,
    image2: Buffer
): Promise<ImageAnalysisResult> => {
    return new Promise((resolve, reject) => {
        (resemble as any).compare(
            image1,
            image2,
            {
                ignore: "nothing",
                largeImageThreshold: 2000
            },
            (err: any, result: ImageAnalysisResult) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

const pngBufferToDataUri = (image: Buffer): string =>
    'data:image/png;base64,' + image.toString('base64');

export interface RunSuiteParams {
    specs: SpecDefinition[];
    mode: 'compare' | 'update' | 'view';
    folder: string;
    server: string;
    reportFile: string;
    filter: string;
    defaultThemes: string[];
    onlyFailed: boolean;
    overwrite: boolean;
    clean: boolean;
}

type Filter = (testCaseName: string) => boolean;

export const runSuite = async (params: RunSuiteParams) => {
    const log = console.error.bind(console);

    if (params.mode === 'update') {
        await ensureEmptyFolder(params.folder, params.clean);
    }

    let specsAlreadyCreated = 0;

    let filters: Filter[] = [];
    const nameMatchesFilter = (name: string) => !filters.find(f => !f(name));

    if (params.filter) {
        const filterRegexp = new RegExp(params.filter);
        filters.push(name => filterRegexp.test(name));
    }
    if (params.onlyFailed && existsSync(failedTestsFile)) {
        const failedLastRun = (await fs.readFile(failedTestsFile, 'utf8')).trim().split('\n');
        log(chalk.yellow(`Limiting to ${failedLastRun.length} tests that failed last run.`));
        filters.push(name => failedLastRun.includes(name));
    }

    let specs: Spec[] = params.specs
        .map(createSpecFromDefinition)
        // generate rtl versions of provided specs
        .flatMap(spec =>
            spec.autoRtl
                ? [
                      spec,
                      {
                          ...spec,
                          name: `${spec.name}-rtl`,
                          urlParams: { ...spec.urlParams, rtl: true }
                      }
                  ]
                : spec
        )
        // generate alternate theme versions of provided specs
        .flatMap(spec =>
            params.defaultThemes
                .filter(theme => !spec.withoutThemes.includes(theme))
                .map(theme => ({
                    ...spec,
                    name: `${spec.name}-${theme}`,
                    urlParams: { ...spec.urlParams, theme: `ag-theme-${theme}` }
                }))
        )
        // apply provided filter
        .filter(spec => {
            return (
                nameMatchesFilter(spec.name) ||
                spec.steps.find(step => nameMatchesFilter(getTestCaseName(spec, step)))
            );
        });

    if (params.mode === 'update' && !params.overwrite) {
        // skip specs where the images are already present
        specs = specs.filter(spec => {
            const testCaseNames = spec.steps.map(step => getTestCaseName(spec, step));
            const imagePaths = testCaseNames.map(name => getTestCaseImagePath(params.folder, name));
            const anyStepsMissingImage = !!imagePaths.find(path => !existsSync(path));
            if (!anyStepsMissingImage) {
                ++specsAlreadyCreated;
            }
            return anyStepsMissingImage;
        });
    }

    if (specsAlreadyCreated > 0) {
        log(
            chalk.rgb(255, 128, 0)(
                `${chalk.bold(
                    'NOTE:'
                )} skipping ${specsAlreadyCreated} specs that have already been generated. Pass --clean to generate all specs from scratch.`
            )
        );
    }

    const results: SpecResult[] = [];
    const writeReportFile = async (inProgress: boolean) => {
        const html = getReportHtml(results, inProgress);
        await fs.writeFile(params.reportFile, html);
    };

    if (params.mode === 'view') {
        log('Generating view of existing images...');
        for (const spec of specs) {
            for (const step of spec.steps) {
                const name = getTestCaseName(spec, step);
                if (nameMatchesFilter(name)) {
                    const imageFile = getTestCaseImagePath(params.folder, name);
                    const imageBuffer = await fs.readFile(imageFile);
                    const dataUru = pngBufferToDataUri(imageBuffer);
                    results.push({
                        type: 'view',
                        name,
                        originalUri: dataUru
                    });
                }
            }
        }
        await writeReportFile(false);
        log(`✨  report written to ${chalk.bold(path.relative('.', params.reportFile))}`);
        return;
    }

    log('Running suite...');

    let reportIteration = -1;
    const reportGenerationInterval = 2500;
    const startTime = Date.now();

    const browser = await launch({
        args: ['--disable-gpu', '--font-render-hinting=none']
    });

    const totalMatchingTestCases = specs.reduce((acc, spec) => {
        const matchingCases = spec.steps.filter(step =>
            nameMatchesFilter(getTestCaseName(spec, step))
        );
        return acc + matchingCases.length;
    }, 0);
    let testCasesRun = 0;

    let failedTestCases: string[] = [];

    await runSpecs(specs, {
        browser,
        passesFilter: nameMatchesFilter,
        server: params.server,
        handler: async (screenshot, testCaseName) => {
            ++testCasesRun;
            const file = getTestCaseImagePath(params.folder, testCaseName);
            if (params.mode === 'update') {
                await fs.writeFile(file, screenshot);
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(
                    `🙌  generating: ${testCasesRun} of ${totalMatchingTestCases}`
                );
            } else {
                const oldData = await fs.readFile(file);
                const result = await getImageDifferences(oldData, screenshot);
                const differenceUri =
                    result.rawMisMatchPercentage > 0 ? result.getImageDataUrl() : null;
                results.push({
                    type: 'test',
                    name: testCaseName,
                    differenceUri,
                    newUri: pngBufferToDataUri(screenshot),
                    originalUri: pngBufferToDataUri(oldData),
                    area: result.diffBounds
                });
                if (differenceUri) {
                    log(
                        `${chalk.red.bold(`✘ ${testCaseName}`)} - found difference, see report.html`
                    );
                    failedTestCases.push(testCaseName);
                } else {
                    log(`${chalk.green.bold(`✔ ${testCaseName}`)} - OK`);
                }
            }

            const thisReportIteration = Math.floor(
                (Date.now() - startTime) / reportGenerationInterval
            );
            if (params.mode === 'compare' && reportIteration !== thisReportIteration) {
                reportIteration = thisReportIteration;
                await writeReportFile(true);
            }
        }
    });

    await browser.close();

    if (testCasesRun === 0) {
        log(chalk.yellow('No test cases match filter'));
    } else if (params.mode === 'compare') {
        if (failedTestCases.length > 0) {
            log(
                chalk.red.bold(
                    failedTestCases.length === 1
                        ? '1 FAILURE'
                        : `${failedTestCases.length} FAILURES`
                )
            );
            await fs.writeFile(failedTestsFile, failedTestCases.join('\n'));
        } else {
            log(chalk.green.bold('ALL PASSED'));
            if (existsSync(failedTestsFile)) {
                await fs.unlink(failedTestsFile);
            }
        }
        await writeReportFile(false);
        log(`✨  report written to ${chalk.bold(path.relative('.', params.reportFile))}`);
    } else {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        log(`✨  generated ${testCasesRun} images`);
    }
};
