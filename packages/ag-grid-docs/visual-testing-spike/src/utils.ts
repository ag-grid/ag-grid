import { promises as fs } from 'fs';
import { Page } from 'puppeteer';

const errorFile = 'error.html';

export const wait = async (ms: number) =>
    new Promise(resolve => {
        setTimeout(resolve, ms);
    });

export const getError = async (page: Page, message: string) => {
    let html = await page.evaluate(() => document.body.innerHTML);
    html = `<!--\n${page.url()}\n-->${html}`;
    await fs.writeFile(errorFile, html);
    return new Error(`${message}; Page HTML saved to ${errorFile}`);
};

export const getElement = async (page: Page, selector: string) => {
    const el = await page.$(selector);
    if (!el) {
        throw await getError(page, `Could not find selector "${selector}"`);
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
        throw await getError(page, `Element "${selector}" has no bounds`);
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
