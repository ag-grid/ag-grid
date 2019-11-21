import path from 'path';
import url from 'url';
import glob from 'glob-promise';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { launch } from 'puppeteer';
import PromisePool from 'es6-promise-pool';
import resemble from 'resemblejs';
import { Spec, SpecResults } from './types';
import { getReportHtml } from './reporting';

const DEFAULT_PATH = '/example.php';
const DEFAULT_SELECTOR = '.ag-root-wrapper';
const EXAMPLE_PATH_BASE =
    '/example-runner/vanilla.php?enterprise=1&generated=1' +
    '&grid={"noStyle"%3A0%2C"height"%3A"100%25"%2C"width"%3A"100%25"%2C"enterprise"%3A1}';
const MAX_PARALLEL_PAGE_LOADS = 4;

const buildUrlQuery = (base: string, params: object) => {
    Object.entries(params).forEach(([key, value]) => {
        const separator = base.includes('?') ? '&' : '?';
        base += separator + encodeURIComponent(key) + '=' + encodeURIComponent(value);
    });
    return base;
};

const wait = async (ms: number) => new Promise(resolve => {
    setTimeout(resolve, ms);
})

export const runSpec = async (
    spec: Spec,
    server: string,
    handler: (screenshot: Buffer, specName: string) => Promise<void>
) => {
    const browser = await launch({
        defaultViewport: spec.defaultViewport
    });

    let path = spec.path;
    if (spec.exampleSection || spec.exampleId) {
        if (path) {
            throw new Error(`Spec ${spec.name} provides both a path and an example.`);
        }
        path = buildUrlQuery(EXAMPLE_PATH_BASE, {
            section: spec.exampleSection,
            example: spec.exampleId
        });
    }
    if (!path) {
        path = DEFAULT_PATH;
    }
    if (spec.urlParams) {
        path = buildUrlQuery(path, spec.urlParams);
    }

    const page = await browser.newPage();
    await page.goto(url.resolve(server, path));
    await wait(500); // let the page stabilise
    const selector = spec.selector || DEFAULT_SELECTOR;
    const wrapper = await page.$(selector);
    if (!wrapper) {
        throw new Error(`Spec ${spec.name}: could not find selector "${selector}"`);
    }

    for (let step of spec.steps) {
        if (step.viewport) {
            page.setViewport(step.viewport);
        } else if (spec.defaultViewport) {
            page.setViewport(spec.defaultViewport);
        }
        if (step.prepare) {
            await step.prepare(page);
        }
        // let CSS animations stabilise before taking screenshot
        await wait(500);
        const screenshot = await wrapper.screenshot({
            encoding: 'binary'
        });
        await handler(screenshot, `${spec.name}-${step.name}`);
    }

    await browser.close();
};

export const runSpecs = async (
    specs: Spec[],
    server: string,
    handler: (screenshot: Buffer, specName: string) => Promise<void>
) => {
    let i = 0;
    const generatePromises = () => {
        const spec = specs[i++];
        if (!spec) {
            return;
        }
        return (async () => {
            await runSpec(spec, server, handler);
        })();
    };
    await new PromisePool(generatePromises, MAX_PARALLEL_PAGE_LOADS).start();
};

const ensureEmptyFolder = async (folder: string) => {
    await fs.mkdir(folder, { recursive: true });
    const existing = await glob(path.join(folder, '*.png'));
    await Promise.all(existing.map(file => fs.unlink(file)));
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
    specs: Spec[];
    mode: 'compare' | 'update';
    folder: string;
    server: string;
    reportFile: string;
    themes: string[];
}

export const runSuite = async ({
    specs,
    mode,
    folder,
    themes,
    server,
    reportFile
}: RunSuiteParams) => {
    const log = console.error.bind(console);

    specs = specs
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
            themes.map(theme => ({
                ...spec,
                name: `${spec.name}-${theme}`,
                urlParams: { ...spec.urlParams, theme: `ag-theme-${theme}` }
            }))
        );
    if (mode === 'update') {
        await ensureEmptyFolder(folder);
    }

    log('Running suite...');
    const results: SpecResults[] = [];
    await runSpecs(specs, server, async (screenshot, specName) => {
        const file = path.join(folder, `${specName}.png`);
        if (mode === 'update') {
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
                log(`❌  ${chalk.red.bold(specName)} - found difference, see report.html`);
            } else {
                log(`✅  ${chalk.green.bold(specName)} - OK`);
            }
        }
    });
    if (mode === 'compare') {
        const html = getReportHtml(results);
        await fs.writeFile(reportFile, html);
        log(`✨  report written to ${chalk.bold(path.relative('.', reportFile))}`);
    }
};
