import { Window } from 'happy-dom';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import { Canvas, DOMMatrix, Image, Path2D, loadImage } from 'skia-canvas';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const MINI_CHARTS_DIR = 'packages/ag-grid-enterprise/src/charts/chartComp/menu/settings/miniCharts';
const OUT_DIR = join(ROOT, 'tmp/mini-chart-svgs/captures');
const PROOF_DIR = join(ROOT, 'tmp/mini-chart-svgs/proof');
const SIZE = 58;
const DPRS = [1, 2];
const PALETTES = ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];
const PROOF_PALETTE = 'proof';
const SIGNIFICANT = 16;

const CONVERTED = [
    'MiniColumn',
    'MiniStackedColumn',
    'MiniNormalizedColumn',
    'MiniBar',
    'MiniStackedBar',
    'MiniNormalizedBar',
    'MiniLine',
    'MiniStackedLine',
    'MiniNormalizedLine',
    'MiniArea',
    'MiniStackedArea',
    'MiniNormalizedArea',
    'MiniHistogram',
];
const PROOF_ONLY = ['MiniRadialColumn', 'MiniNightingale'];

const win: any = new Window();
const nodeCanvases = new WeakMap<object, any>();
Object.assign(globalThis, { window: win, document: win.document, Path2D, DOMMatrix, Image });

const { ConfiguredCanvasMixin, applySkiaPatches } = await import('ag-charts-core');
const skia: any = await import('skia-canvas');
applySkiaPatches(skia.CanvasRenderingContext2D, DOMMatrix);
const NodeCanvas = ConfiguredCanvasMixin(Canvas);
(globalThis as any).OffscreenCanvas = NodeCanvas;

const originalCreateElement = win.document.createElement.bind(win.document);
win.document.createElement = (tag: string, options?: unknown) => {
    const element = originalCreateElement(tag, options);
    if (tag.toLowerCase() !== 'canvas') {
        return element;
    }
    Object.defineProperty(element, 'getContext', {
        value: (type: string) => {
            if (type !== '2d') {
                return null;
            }
            let canvas = nodeCanvases.get(element);
            if (!canvas || canvas.width !== element.width || canvas.height !== element.height) {
                canvas = new NodeCanvas(element.width || 1, element.height || 1);
                nodeCanvases.set(element, canvas);
            }
            return canvas.getContext('2d');
        },
        configurable: true,
    });
    return element;
};

const scene = await import('ag-charts-community/scene');
const { _Theme } = await import('ag-charts-community');
const miniCharts = await import(`../../${MINI_CHARTS_DIR}/index.ts`);
const { MINI_CHART_SVG_TEMPLATES } = await import(
    pathToFileURL(join(ROOT, MINI_CHARTS_DIR, 'svg/miniChartSvgTemplates.generated.ts')).href
);

interface Palette {
    name: string;
    fills: string[];
    strokes: string[];
}

const paletteOf = (name: string): Palette => {
    const { fills, strokes } = _Theme.getChartTheme(name).palette;
    if (![...fills, ...strokes].every((c: unknown) => typeof c === 'string')) {
        throw new Error(`${name}: palette has non-string colours`);
    }
    return { name, fills: [...fills], strokes: [...strokes] };
};

const PROOF_FILLS = ['#5090dc', '#ffa03a', '#459d55', '#34bfe1', '#e1cc00', '#9669cb', '#b5b5b5', '#fb6767'];
const PROOF_STROKES = ['#2b5c95', '#cc6f10', '#1e652e', '#18859e', '#a39400', '#603c88', '#575757', '#ab1d1d'];

const paint = (p: any, palette: Palette) =>
    p == null ? 'none' : typeof p === 'string' ? p : (p.palette === 'fills' ? palette.fills : palette.strokes)[p.index];

function nodeToSvg(node: any, palette: Palette): string {
    if (node.tag === 'g') {
        const inner = node.children.map((c: any) => nodeToSvg(c, palette)).join('');
        const attrs = [
            node.opacity != null ? ` opacity="${node.opacity}"` : '',
            node.transform ? ` transform="${node.transform}"` : '',
        ].join('');
        if (!node.clip) {
            return `<g${attrs}>${inner}</g>`;
        }
        const [x, y, w, h] = node.clip;
        return `<g${attrs}><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}" overflow="hidden">${inner}</svg></g>`;
    }
    const attrs = Object.entries(node.attrs)
        .map(([k, v]) => ` ${k}="${v}"`)
        .join('');
    const stroke = node.stroke != null ? ` stroke="${paint(node.stroke, palette)}"` : '';
    return `<${node.tag}${attrs} fill="${paint(node.fill, palette)}"${stroke}/>`;
}

const templateToSvg = (template: any, palette: Palette, dpr: number) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE * dpr}" height="${SIZE * dpr}" viewBox="0 0 ${SIZE} ${SIZE}">${template.children.map((n: any) => nodeToSvg(n, palette)).join('')}</svg>`;

const scaleSvgFile = (svg: string, dpr: number) =>
    svg.replace(/^<svg ([^>]*?)width="\d+" height="\d+"/, `<svg $1width="${SIZE * dpr}" height="${SIZE * dpr}"`);

function renderCanvasBefore(selectorName: string, palette: Palette, dpr: number): any {
    const selector = miniCharts[selectorName];
    win.devicePixelRatio = dpr;
    const container = win.document.createElement('div');
    const chart = new selector.miniChart(container, { _Scene: scene }, [...palette.fills], [...palette.strokes], false);
    chart.chartTranslation = { translate: (key: string) => key };
    chart.beans = {
        log: {
            error: (...args: unknown[]) => {
                throw new Error(`${selectorName}: ${JSON.stringify(args)}`);
            },
            warn: () => {},
        },
    };
    chart.postConstruct();
    const element = chart.scene.canvas.element;
    const source = nodeCanvases.get(element);
    if (!source || source.width !== SIZE * dpr || source.height !== SIZE * dpr) {
        throw new Error(`${selectorName}: unexpected canvas ${source?.width}x${source?.height} at DPR ${dpr}`);
    }
    return flatten(source, dpr);
}

function flatten(source: any, dpr: number): any {
    const canvas = new Canvas(SIZE * dpr, SIZE * dpr);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
}

async function renderSvgAfter(svg: string, dpr: number): Promise<any> {
    const image = await loadImage(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
    const canvas = new Canvas(SIZE * dpr, SIZE * dpr);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
}

const browser = await chromium.launch();
const contexts = new Map<number, any>();

async function renderChromiumAfter(svg: string, dpr: number): Promise<any> {
    if (!contexts.has(dpr)) {
        contexts.set(
            dpr,
            await browser.newContext({ deviceScaleFactor: dpr, viewport: { width: SIZE, height: SIZE } })
        );
    }
    const page = await contexts.get(dpr).newPage();
    await page.setContent(`<!doctype html><body style="margin:0;background:white">${svg}</body>`);
    const png: Buffer = await page.screenshot({ clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
    await page.close();
    return flatten(await loadImage(png), dpr);
}

interface Diff {
    max: number;
    differing: number;
    significant: number;
    total: number;
    image: any;
}

function diff(before: any, after: any): Diff {
    const a = before.getContext('2d').getImageData(0, 0, before.width, before.height).data;
    const b = after.getContext('2d').getImageData(0, 0, after.width, after.height).data;
    const image = new Canvas(before.width, before.height);
    const ictx = image.getContext('2d');
    const out = ictx.createImageData(before.width, before.height);
    let max = 0;
    let differing = 0;
    let significant = 0;
    for (let i = 0; i < a.length; i += 4) {
        let d = 0;
        for (let c = 0; c < 4; c++) {
            d = Math.max(d, Math.abs(a[i + c] - b[i + c]));
        }
        max = Math.max(max, d);
        differing += d > 0 ? 1 : 0;
        significant += d > SIGNIFICANT ? 1 : 0;
        const v = 255 - Math.min(255, d * 4);
        out.data.set([255, v, v, 255], i);
    }
    ictx.putImageData(out, 0, 0);
    return { max, differing, significant, total: a.length / 4, image };
}

const savePng = (canvas: any, file: string) =>
    canvas.toBufferSync('png') && writeFileSync(file, canvas.toBufferSync('png'));

interface Row {
    type: string;
    palette: string;
    dpr: number;
    kind: string;
    d: Diff;
    skia: Diff;
}

async function capture(): Promise<void> {
    mkdirSync(OUT_DIR, { recursive: true });
    const rows: Row[] = [];
    const sheets = new Map<number, { type: string; palette: string; before: any; after: any; d: Diff }[]>();
    const palettes = [...PALETTES.map(paletteOf), { name: PROOF_PALETTE, fills: PROOF_FILLS, strokes: PROOF_STROKES }];

    for (const dpr of DPRS) {
        sheets.set(dpr, []);
        for (const selectorName of [...CONVERTED, ...PROOF_ONLY]) {
            const { chartType } = miniCharts[selectorName];
            const proofOnly = PROOF_ONLY.includes(selectorName);
            const template = proofOnly
                ? JSON.parse(readFileSync(join(PROOF_DIR, `${chartType}.json`), 'utf8'))
                : MINI_CHART_SVG_TEMPLATES[chartType];
            if (!template) {
                throw new Error(`${selectorName}: no template for ${chartType}`);
            }
            for (const palette of palettes) {
                const isProofPalette = palette.name === PROOF_PALETTE;
                if (isProofPalette && !proofOnly) {
                    continue;
                }
                const before = renderCanvasBefore(selectorName, palette, dpr);
                const svgAt = (scale: number) =>
                    isProofPalette
                        ? scaleSvgFile(readFileSync(join(PROOF_DIR, `${chartType}.svg`), 'utf8'), scale)
                        : templateToSvg(template, palette, scale);
                const afterSkia = await renderSvgAfter(svgAt(dpr), dpr);
                const after = await renderChromiumAfter(svgAt(1), dpr);
                const d = diff(before, after);
                const skia = diff(before, afterSkia);
                const base = `${chartType}__${palette.name}__dpr${dpr}`;
                savePng(before, join(OUT_DIR, `${base}__before.png`));
                savePng(after, join(OUT_DIR, `${base}__after.png`));
                savePng(d.image, join(OUT_DIR, `${base}__diff.png`));
                savePng(afterSkia, join(OUT_DIR, `${base}__after-skia.png`));
                savePng(skia.image, join(OUT_DIR, `${base}__diff-skia.png`));
                const kind = proofOnly ? 'proof-only' : 'converted';
                rows.push({ type: chartType, palette: palette.name, dpr, kind, d, skia });
                sheets.get(dpr)!.push({ type: chartType, palette: palette.name, before, after, d });
            }
        }
    }

    writeContactSheets(sheets);
    writeFileSync(join(OUT_DIR, 'diff-table.md'), buildTable(rows));
    const worst = rows.reduce((m, r) => (r.d.max > m.d.max ? r : m), rows[0]);
    console.log(
        `Wrote ${rows.length} comparisons to ${relative(ROOT, OUT_DIR)}; worst max diff ${worst.d.max} (${worst.type}/${worst.palette}/dpr${worst.dpr})`
    );
}

function buildTable(rows: Row[]): string {
    const cells = (d: Diff) => `${d.max} | ${d.differing} | ${d.significant}`;
    const lines = [
        '# Mini chart canvas vs SVG parity',
        '',
        'Before: real `_Scene.Scene` drawing into skia-canvas. After (Chromium): the SVG built from the template and palette, screenshotted in headless Chromium at the given device scale factor. After (skia-svg): the same SVG sized to device pixels and rasterised by skia-canvas `loadImage`.',
        `All images are composited on white. Differing: any RGBA channel differs. Significant: any channel differs by more than ${SIGNIFICANT}/255. Total pixels per image is 58*DPR squared.`,
        '',
        '| Type | Kind | Palette | DPR | Chromium max | Chromium differing | Chromium significant | skia-svg max | skia-svg differing | skia-svg significant |',
        '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
        ...rows.map(
            ({ type, kind, palette, dpr, d, skia }) =>
                `| ${type} | ${kind} | ${palette} | ${dpr} | ${cells(d)} | ${cells(skia)} |`
        ),
        '',
        '## Worst palette per type and DPR',
        '',
        '| Type | DPR | Chromium max | Chromium significant | skia-svg max | skia-svg significant | Worst palette (Chromium significant) |',
        '| --- | --- | --- | --- | --- | --- | --- |',
    ];
    const keys = [...new Set(rows.map((r) => `${r.dpr}|${r.type}`))];
    for (const key of keys) {
        const [dpr, type] = key.split('|');
        const group = rows.filter((r) => r.type === type && String(r.dpr) === dpr);
        const worst = group.reduce((m, r) => (r.d.significant > m.d.significant ? r : m), group[0]);
        const peak = (pick: (r: Row) => Diff, field: 'max' | 'significant') =>
            Math.max(...group.map((r) => pick(r)[field]));
        lines.push(
            `| ${type} | ${dpr} | ${peak((r) => r.d, 'max')} | ${peak((r) => r.d, 'significant')} | ${peak((r) => r.skia, 'max')} | ${peak((r) => r.skia, 'significant')} | ${worst.palette} |`
        );
    }
    return `${lines.join('\n')}\n`;
}

function writeContactSheets(
    sheets: Map<number, { type: string; palette: string; before: any; after: any; d: Diff }[]>
) {
    for (const [dpr, entries] of sheets) {
        const types = [...new Set(entries.map((e) => e.type))];
        const columns = [...PALETTES, PROOF_PALETTE];
        const cell = SIZE * dpr + 4 * dpr;
        const width = columns.length * 3 * cell;
        const height = types.length * cell;
        const sheet = new Canvas(width, height);
        const ctx = sheet.getContext('2d');
        ctx.fillStyle = '#ddd';
        ctx.fillRect(0, 0, width, height);
        for (const e of entries) {
            const x = columns.indexOf(e.palette) * 3 * cell;
            const y = types.indexOf(e.type) * cell;
            ctx.drawImage(e.before, x, y);
            ctx.drawImage(e.after, x + cell, y);
            ctx.drawImage(e.d.image, x + 2 * cell, y);
        }
        savePng(sheet, join(OUT_DIR, `contact-sheet-dpr${dpr}.png`));
    }
}

await capture();
await browser.close();
