import path from 'path';
import url from 'url';
import glob from 'glob-promise';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { launch, Browser } from 'puppeteer';
import PromisePool from 'es6-promise-pool';
import resemble from 'resemblejs';
import { Spec, SpecResults, SpecDefinition } from './types';
import { getReportHtml } from './reporting';
import { wait, getError, getElement } from './utils';

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

const createSpecFromDefinition = (spec: SpecDefinition): Spec => {
    let name: string;
    if (spec.name) {
        name = spec.name;
    } else if (spec.exampleSection) {
        name = `${spec.exampleSection}-${spec.exampleId}`;
    } else {
        throw new Error(`Specs require a name or an example section: ${JSON.stringify(spec)}`);
    }

    return {
        ...spec,
        name,
        steps: spec.steps || [
            {
                name: 'default'
            }
        ],
        urlParams: spec.urlParams || {},
        defaultViewport: spec.defaultViewport || { width: 800, height: 600 }
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

export const runSpec = async (spec: Spec, context: RunContext) => {
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

        const page = await context.browser.newPage();
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
            const testCaseName = `${spec.name}-${step.name}`;
            if (testCaseName.includes(context.filter)) {
                // let CSS animations stabilise before taking screenshot
                await wait(500);
                const screenshot = await wrapper.screenshot({
                    encoding: 'binary',
                    clip: { x: 0, y: 0, width: viewport.width, height: viewport.height }
                });
                await context.handler(screenshot, testCaseName);
            }
        }
    } catch (e) {
        e.specName = spec.name;
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
    themes: string[];
    clean: boolean;
}

export const runSuite = async (params: RunSuiteParams) => {
    const log = console.error.bind(console);

    const specs: Spec[] = params.specs
        .map(createSpecFromDefinition)
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
        .flatMap(spec =>
            params.themes.map(theme => ({
                ...spec,
                name: `${spec.name}-${theme}`,
                urlParams: { ...spec.urlParams, theme: `ag-theme-${theme}` }
            }))
        )
        .filter(spec => {
            return (
                spec.name.includes(params.filter) ||
                (spec.steps &&
                    spec.steps.find(step => `${spec.name}-${step.name}`.includes(params.filter)))
            );
        });
    if (params.mode === 'update') {
        const deleteExisting = params.clean || !params.filter;
        await ensureEmptyFolder(params.folder, deleteExisting);
    }

    log('Running suite...');
    const results: SpecResults[] = [];

    const browser = await launch();

    await runSpecs(specs, {
        browser,
        server: params.server,
        filter: params.filter,
        handler: async (screenshot, specName) => {
            const file = path.join(params.folder, `${specName}.png`);
            if (params.mode === 'update') {
                await fs.writeFile(file, screenshot);
                log(`${chalk.blue(specName)} - written to ${path.relative('.', file)}`);
            } else {
                const oldData = await fs.readFile(file);
                const difference = await getImageDifferencesAsDataUri(oldData, screenshot);
                results.push({
                    name: specName,
                    difference,
                    new: pngBufferToDataUri(screenshot),
                    original: pngBufferToDataUri(oldData)
                });
                if (difference) {
                    log(`${chalk.red.bold(`✘ ${specName}`)} - found difference, see report.html`);
                } else {
                    log(`${chalk.green.bold(`✔ ${specName}`)} - OK`);
                }
            }
        }
    });

    await browser.close();

    if (params.mode === 'compare') {
        const html = getReportHtml(results);
        await fs.writeFile(params.reportFile, html);
        log(`✨  report written to ${chalk.bold(path.relative('.', params.reportFile))}`);
    }
};
