import path from 'path';
import url from 'url';
import glob from 'glob-promise';
import chalk from 'chalk';
import { promises as fs, existsSync } from 'fs';
import { launch, Browser, Page } from 'puppeteer';
import PromisePool from 'es6-promise-pool';
import resemble from 'resemblejs';
import { Spec, SpecResults, SpecDefinition, SpecStep } from './types';
import { getReportHtml } from './reporting';
import { wait, getElement, addErrorMessage, saveErrorFile } from './utils';

const defaultSpecPath = '/example.php';
const defaultSelector = '.ag-root-wrapper';
const exampleBasePath = '/example-runner/vanilla.php';
const maxParallelPageLoads = 8;

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
    filter: string;
    server: string;
    handler: (screenshot: Buffer, specName: string) => Promise<void>;
}

const setThemeInBrowser = (theme: string) => {
    const setTheme = () => {
        if (document.readyState === 'complete') {
            (window as any).setThemeError = 'This code is supposed to be run before ag-grid loads';
        }
        const themeElements = document.querySelectorAll(
            '[class^="ag-theme-"], [class*=" ag-theme-"]'
        );
        themeElements.forEach(el => {
            el.className = el.className.replace(/ag-theme-\w+/g, theme);
        });
    };
    setTheme();
    document.addEventListener('DOMContentLoaded', setTheme);
};

const getTestCaseName = (spec: Spec, step: SpecStep) => `${spec.name}-${step.name}`;

const getTestCaseImagePath = (params: RunSuiteParams, testCaseName: string) =>
    path.join(params.folder, `${testCaseName}.png`);

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
            await page.evaluateOnNewDocument(setThemeInBrowser, spec.urlParams.theme);
        }
        const pageUrl = url.resolve(context.server, path);
        await page.goto(pageUrl);
        const setThemeError = await page.evaluate(() => (window as any).setThemeError);
        if (setThemeError) {
            throw new Error('Error setting theme: ' + setThemeError);
        }
        await wait(500); // let the page stabilise
        const selector = spec.selector || defaultSelector;
        const wrapper = await getElement(page, selector);

        for (let step of spec.steps) {
            const viewport = step.viewport || spec.defaultViewport;
            await page.setViewport(viewport);
            if (step.prepare) {
                await step.prepare(page);
            }
            const testCaseName = getTestCaseName(spec, step);
            if (testCaseName.includes(context.filter)) {
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

const getImageDifferencesAsDataUri = async (
    image1: Buffer,
    image2: Buffer
): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        (resemble as any).compare(
            image1,
            image2,
            {
                ignoreAntialiasing: true,
                largeImageThreshold: 2000
            },
            (err: any, result: ImageAnalysisResult) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.rawMisMatchPercentage > 0 ? result.getImageDataUrl() : null);
                }
            }
        );
    });
};

const pngBufferToDataUri = (image: Buffer): string =>
    'data:image/png;base64,' + image.toString('base64');

export interface RunSuiteParams {
    specs: SpecDefinition[];
    mode: 'compare' | 'update';
    folder: string;
    server: string;
    reportFile: string;
    filter: string;
    defaultThemes: string[];
    clean: boolean;
}

export const runSuite = async (params: RunSuiteParams) => {
    const log = console.error.bind(console);
    log('Running suite...');

    if (params.mode === 'update') {
        await ensureEmptyFolder(params.folder, params.clean);
    }

    let specsAlreadyCreated = 0;

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
                spec.name.includes(params.filter) ||
                spec.steps.find(step => getTestCaseName(spec, step).includes(params.filter))
            );
        });

    const totalImageCount = specs.reduce((acc, spec) => acc + spec.steps.length, 0);

    if (params.mode === 'update') {
        // skip specs where the images are already present
        specs = specs.filter(spec => {
            const testCaseNames = spec.steps.map(step => getTestCaseName(spec, step));
            const imagePaths = testCaseNames.map(name => getTestCaseImagePath(params, name));
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

    const results: SpecResults[] = [];
    const browser = await launch();

    let generatedCount = 0;

    await runSpecs(specs, {
        browser,
        server: params.server,
        filter: params.filter,
        handler: async (screenshot, testCaseName) => {
            const file = getTestCaseImagePath(params, testCaseName);
            if (params.mode === 'update') {
                await fs.writeFile(file, screenshot);
                log(`🙌  ${chalk.blue(path.relative('.', file))}`);
                ++generatedCount;
            } else {
                const oldData = await fs.readFile(file);
                const difference = await getImageDifferencesAsDataUri(oldData, screenshot);
                results.push({
                    name: testCaseName,
                    difference,
                    new: pngBufferToDataUri(screenshot),
                    original: pngBufferToDataUri(oldData)
                });
                if (difference) {
                    log(
                        `${chalk.red.bold(`✘ ${testCaseName}`)} - found difference, see report.html`
                    );
                } else {
                    log(`${chalk.green.bold(`✔ ${testCaseName}`)} - OK`);
                }
            }
        }
    });

    await browser.close();

    if (params.mode === 'compare') {
        const html = getReportHtml(results);
        await fs.writeFile(params.reportFile, html);
        log(`✨  report written to ${chalk.bold(path.relative('.', params.reportFile))}`);
    } else {
        log(`✨  generated ${generatedCount} images, total image count is ${totalImageCount}`);
    }
};
