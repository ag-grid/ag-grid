import type { Frame, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import path from 'node:path';

import { mountGrid } from '../src/mountGrid';

const REPO_ROOT = path.join(__dirname, '../../..');
const BEST_WIDTH = 850;
const BEST_HEIGHT = 470;
const HEIGHT_RATIO = 0.553;
const LICENCE_BANNER = /licen[sc]e|trial|^\*/i;

const createChartOptions = () => ({
    columnDefs: [
        { field: 'country', chartDataType: 'category' as const },
        { field: 'gold', chartDataType: 'series' as const },
        { field: 'silver', chartDataType: 'series' as const },
    ],
    rowData: [
        { country: 'Russia', gold: 3, silver: 1 },
        { country: 'USA', gold: 4, silver: 2 },
        { country: 'Norway', gold: 5, silver: 3 },
    ],
    cellSelection: true,
    popupParent: document.body,
});

const createChartSource = `window.gridApi.createRangeChart({
    cellRange: { columns: ['country', 'gold', 'silver'] },
    chartType: 'groupedColumn',
});`;

function collectErrors(page: Page) {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error' && !LICENCE_BANNER.test(message.text())) {
            errors.push(message.text());
        }
    });
    return errors;
}

function expectedDialogSize(hostWidth: number) {
    const width = Math.min(BEST_WIDTH, hostWidth * 0.75);
    const height = width < BEST_WIDTH ? Math.round(width * HEIGHT_RATIO) : BEST_HEIGHT;
    return { width, height };
}

/** Measures the dialog and its offset parent's client box, which is what the dialog is centred against. */
async function measureDialog(frame: Frame) {
    return frame.evaluate(() => {
        const dialog = document.querySelector<HTMLElement>('.ag-dialog')!;
        const box = dialog.getBoundingClientRect();
        const parent = dialog.offsetParent!;
        const parentBox = parent.getBoundingClientRect();
        return {
            width: box.width,
            height: box.height,
            centreX: box.left + box.width / 2 - parentBox.left - parent.clientLeft - parent.clientWidth / 2,
            centreY: box.top + box.height / 2 - parentBox.top - parent.clientTop - parent.clientHeight / 2,
            hostWidth: parent.clientWidth,
        };
    });
}

async function expectSizedAndCentred(frame: Frame) {
    await expect
        .poll(async () => {
            const { width, hostWidth } = await measureDialog(frame);
            return Math.abs(width - expectedDialogSize(hostWidth).width) <= 1;
        })
        .toBe(true);
    const measured = await measureDialog(frame);
    const { width, height } = expectedDialogSize(measured.hostWidth);
    expect(Math.abs(measured.width - width)).toBeLessThanOrEqual(1);
    expect(Math.abs(measured.height - height)).toBeLessThanOrEqual(1);
    expect(Math.abs(measured.centreX)).toBeLessThanOrEqual(1);
    expect(Math.abs(measured.centreY)).toBeLessThanOrEqual(1);
}

test.describe('integrated charts created before the popup parent has layout', () => {
    test('a dialog chart created in a hidden document is sized and centred once the page is shown', async ({
        page,
    }) => {
        const errors = collectErrors(page);
        await mountGrid(page, {
            enterprise: true,
            integratedCharts: true,
            css: 'html,body{width:100%;height:100%}',
            options: createChartOptions,
        });

        await page.evaluate(`document.documentElement.style.display = 'none'; ${createChartSource}`);
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
        await page.evaluate(() => {
            document.documentElement.style.display = '';
        });

        await expect(page.locator('.ag-dialog')).toBeVisible();
        await expectSizedAndCentred(page.mainFrame());
        expect(errors).toEqual([]);
    });

    test('a dialog chart created in a 0x0 iframe is sized and centred once the iframe is resized', async ({ page }) => {
        const errors = collectErrors(page);
        await page.setContent(
            '<!DOCTYPE html><html><body style="margin:0"><iframe id="host" style="width:0;height:0;border:0" ' +
                'srcdoc="<!DOCTYPE html><html><head><style>html,body{margin:0;height:100%}' +
                'body{padding:16px;box-sizing:border-box;width:100%;height:100%}</style></head>' +
                "<body><div id=myGrid style='width:600px;height:400px'></div></body></html>\"></iframe></body></html>"
        );
        const frame = (await (await page.locator('#host').elementHandle())!.contentFrame())!;
        await frame.waitForSelector('#myGrid');
        await frame.addScriptTag({
            path: path.join(REPO_ROOT, 'node_modules/ag-charts-enterprise/dist/umd/ag-charts-enterprise.js'),
        });
        await frame.addScriptTag({
            path: path.join(REPO_ROOT, 'packages/ag-grid-enterprise/dist/ag-grid-enterprise.js'),
        });
        await frame.evaluate(
            `window.gridApi = agGrid.createGrid(document.getElementById('myGrid'), (${createChartOptions.toString()})());` +
                createChartSource
        );

        await page.locator('#host').evaluate((iframe) => {
            iframe.style.width = '1000px';
            iframe.style.height = '700px';
        });

        await expect(frame.locator('.ag-dialog')).toBeVisible();
        await expectSizedAndCentred(frame);
        expect(errors).toEqual([]);
    });
});
