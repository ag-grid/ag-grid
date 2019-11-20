import path from 'path';
import url from 'url';
import glob from 'glob-promise';
import { promises as fsp } from 'fs';
import { Page, Browser, launch, BrowserOptions } from 'puppeteer';
import PromisePool from 'es6-promise-pool';

const BASE_URL = 'http://localhost:8080';
const DEFAULT_PATH = '/example.php';
const DEFAULT_SELECTOR = '.ag-root-wrapper';
const EXAMPLE_PATH_BASE =
    '/example-runner/vanilla.php?enterprise=1&generated=1' +
    '&grid={"noStyle"%3A0%2C"height"%3A"100%25"%2C"width"%3A"100%25"%2C"enterprise"%3A1}';
const MAX_PARALLEL_PAGE_LOADS = 4;

export interface Spec {
    name: string;
    steps: SpecStep[];
    viewport?: BrowserOptions['defaultViewport'];
    exampleSection?: string;
    exampleId?: string;
    path?: string;
    urlParams?: object;
    selector?: string;
    autoRtl?: boolean;
}

export interface SpecStep {
    name: string;
    prepare?: (page: Page) => Promise<void>;
}

const buildUrlQuery = (base: string, params: object) => {
    Object.entries(params).forEach(([key, value]) => {
        const separator = base.includes('?') ? '&' : '?';
        base += separator + encodeURIComponent(key) + '=' + encodeURIComponent(value);
    });
    return base;
};

export const runSpec = async (
    spec: Spec,
    handler: (data: Buffer, specName: string) => Promise<void>
) => {
    const browser = await launch({
        defaultViewport: spec.viewport
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
    await page.goto(url.resolve(BASE_URL, path));
    const selector = spec.selector || DEFAULT_SELECTOR;
    const wrapper = await page.$(selector);
    if (!wrapper) {
        throw new Error(`Spec ${spec.name}: could not find selector "${selector}"`);
    }

    for (let step of spec.steps) {
        if (step.prepare) {
            await step.prepare(page);
        }
        const screenshot = await wrapper.screenshot({
            encoding: 'binary'
        });
        handler(screenshot, `${spec.name}-${step.name}`);
    }

    await browser.close();
};

export const runSpecs = async (
    specs: Spec[],
    handler: (data: Buffer, specName: string) => Promise<void>
) => {
    let i = 0;
    const generatePromises = () => {
        const spec = specs[i++];
        if (!spec) {
            return;
        }
        return (async () => {
            const screenshot = await runSpec(spec, handler);
        })();
    };
    await new PromisePool(generatePromises, MAX_PARALLEL_PAGE_LOADS).start();
};

export interface RunSuiteParams {
    specs: Spec[];
    mode: 'compare' | 'update';
    folder: string;
    themes: string[];
}

export const runSuite = async ({ specs, mode, folder, themes }: RunSuiteParams) => {
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
        const existing = await glob(path.join(folder, '*.png'));
        await Promise.all(existing.map(file => fsp.unlink(file)));
    }
    await fsp.mkdir(folder, { recursive: true });
    console.log('Running suite...');
    await runSpecs(specs, async (data, specName) => {
        console.log(`processing spec ${specName}`);
        const file = path.join(folder, `${specName}.png`);
        if (mode === 'update') {
            await fsp.writeFile(file, data);
        }
    });
};
