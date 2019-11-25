import { promises as fs } from 'fs';
import { Page } from 'puppeteer';

const errorHtmlFile = 'error.html';
const errorScreenShotFile = 'error.png';

export const wait = async (ms: number) =>
    new Promise(resolve => {
        setTimeout(resolve, ms);
    });

export const saveErrorFile = async (page: Page) => {
    let html = await page.evaluate(() => document.body.innerHTML);
    html = `<!--\n${page.url()}\n-->${html}`;
    await fs.writeFile(errorHtmlFile, html);
    await page.screenshot({ path: errorScreenShotFile });
    return `Page HTML saved to ${errorHtmlFile} and image to ${errorScreenShotFile}`;
};

interface VisualTestingError extends Error {
    extraMessages?: string;
}

export const addErrorMessage = (e: VisualTestingError, message: string) => {
    e.extraMessages = e.extraMessages ? `${e.extraMessages}; ${message}` : message;
};

export const getErrorMessage = (e: VisualTestingError) =>
    (e.extraMessages = e.extraMessages ? `${e.extraMessages}; ${e.stack}` : e.stack);

export const tickCheckBoxWithin = async (page: Page, parentSelector: string) => {
    // support native and legacy style checkbox
    await page.click(
        `${parentSelector} .ag-icon-checkbox-unchecked, ${parentSelector} input[type="checkbox"]`
    );
};

export const untickCheckBoxWithin = async (page: Page, parentSelector: string) => {
    // support native and legacy style checkbox
    await page.click(
        `${parentSelector} .ag-icon-checkbox-checked, ${parentSelector} input[type="checkbox"]`
    );
};

export const cellSelector = (colId: string, rowIndex: number) =>
    `[row-index="${rowIndex}"] [col-id="${colId}"]`;

export const getElement = async (page: Page, selector: string) => {
    const el = await page.$(selector);
    if (!el) {
        throw new Error(`Could not find selector "${selector}"`);
    }
    return el;
};

interface XY {
    x: number;
    y: number;
}

export const getElementCentre = async (page: Page, selector: string): Promise<XY> => {
    const el = await getElement(page, selector);
    const box = await el.boundingBox()!;
    if (!box) {
        throw new Error(`Element "${selector}" has no bounds`);
    }
    return {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2
    };
};

interface DragOptions {
    page: Page;
    from: string | XY;
    to: string | XY;
    leaveMouseDown?: boolean;
}

export const dragFromTo = async ({ page, from, to, leaveMouseDown }: DragOptions) => {
    if (typeof from === 'string') {
        from = await getElementCentre(page, from);
    }
    if (typeof to === 'string') {
        to = await getElementCentre(page, to);
    }

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y);
    if (!leaveMouseDown) {
        await page.mouse.up();
    }
};
