import { Window } from 'happy-dom';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { DOMMatrix, Path2D } from 'skia-canvas';

import type {
    MiniChartSvgGroup,
    MiniChartSvgNode,
    MiniChartSvgPaint,
    MiniChartSvgShape,
    MiniChartSvgSlot,
    MiniChartSvgTemplate,
} from '../../packages/ag-grid-enterprise/src/charts/chartComp/menu/settings/miniCharts/svg/miniChartSvgTypes';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const MINI_CHARTS_DIR = 'packages/ag-grid-enterprise/src/charts/chartComp/menu/settings/miniCharts';
const OUTPUT_FILE = join(ROOT, MINI_CHARTS_DIR, 'svg/miniChartSvgTemplates.generated.ts');
const PROOF_DIR = join(ROOT, 'tmp/mini-chart-svgs/proof');
const RUN_COMMAND = 'scripts/mini-chart-svgs/run.sh';
const SIZE = 58;
const PALETTE_SIZE = 8;
const AXIS_COLOUR = 'gray';

const placeholder = (prefix: string, index: number) => `#${prefix}${index.toString(16).padStart(4, '0')}`;
const FILLS = Array.from({ length: PALETTE_SIZE }, (_, i) => placeholder('f0', i));
const STROKES = Array.from({ length: PALETTE_SIZE }, (_, i) => placeholder('e0', i));
const SLOTS = new Map<string, MiniChartSvgSlot>([
    ...FILLS.map((c, index): [string, MiniChartSvgSlot] => [c, { palette: 'fills', index }]),
    ...STROKES.map((c, index): [string, MiniChartSvgSlot] => [c, { palette: 'strokes', index }]),
]);

// Scene module reads DOM and canvas globals at import time, so they must be installed before it loads.
const win = new Window();
Object.assign(globalThis, { window: win, document: win.document, Path2D, DOMMatrix });

const scene = await import('ag-charts-community/scene');
const miniCharts = await import(`../../${MINI_CHARTS_DIR}/index.ts`);
const { version: chartsVersion } = JSON.parse(
    readFileSync(join(ROOT, 'node_modules/ag-charts-community/package.json'), 'utf8')
);

const TEMPLATE_SELECTORS = [
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
const PROOF_SELECTORS = ['MiniRadialColumn', 'MiniNightingale'];

class CapturingScene {
    root: any;
    readonly canvas = { element: win.document.createElement('canvas') };
    setRoot(root: any) {
        this.root = root;
    }
    setContainer() {}
    render() {}
}

const round = (n: number) => {
    const r = Math.round(n * 1000) / 1000;
    return Object.is(r, -0) ? 0 : r;
};
const roundNumbersIn = (s: string) => s.replace(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi, (m) => String(round(+m)));

const toPaint = (colour: unknown, where: string): MiniChartSvgPaint => {
    if (typeof colour !== 'string') {
        throw new Error(`${where}: non-string colour ${JSON.stringify(colour)}`);
    }
    if (colour === AXIS_COLOUR) {
        return colour;
    }
    const slot = SLOTS.get(colour.toLowerCase());
    if (!slot) {
        throw new Error(`${where}: colour ${colour} is not a palette placeholder`);
    }
    return { ...slot };
};

const COLOUR_ATTRS = new Set(['fill', 'stroke']);

function renderedLineEnds(line: any): Record<'x1' | 'y1' | 'x2' | 'y2', number> {
    const points: number[] = [];
    const ctx = new Proxy(
        {},
        {
            get: (_, key) =>
                key === 'moveTo' || key === 'lineTo' ? (x: number, y: number) => points.push(x, y) : () => {},
            set: () => true,
        }
    );
    line.render({ ctx, devicePixelRatio: 1, forceRender: true, resized: false, debugNodes: {} });
    const [x1, y1, x2, y2] = points.map(round);
    return { x1, y1, x2, y2 };
}

function serialiseShape(node: any, where: string): MiniChartSvgShape {
    const isLine = node instanceof scene.Line;
    const svg = node.toSVG();
    if (svg?.elements.length !== 1 || (svg.defs?.length ?? 0) > 0) {
        throw new Error(`${where}: expected a single element without defs`);
    }
    const element = svg.elements[0] as Element;
    const attrs: Record<string, string | number> = {};
    for (const { name, value } of Array.from(element.attributes)) {
        if (COLOUR_ATTRS.has(name)) {
            continue;
        }
        attrs[name] = name === 'd' || name === 'stroke-dasharray' ? roundNumbersIn(value) : round(Number(value));
    }
    if (isLine) {
        Object.assign(attrs, renderedLineEnds(node));
    }
    if (node.lineCap != null) {
        attrs['stroke-linecap'] = node.lineCap;
    }
    if (node.lineJoin != null) {
        attrs['stroke-linejoin'] = node.lineJoin;
    }
    if ((node.opacity ?? 1) !== 1) {
        attrs.opacity = round(node.opacity);
    }
    for (const name of ['fill-opacity', 'stroke-opacity']) {
        if (attrs[name] === 1) {
            delete attrs[name];
        }
    }
    const shape: MiniChartSvgShape = { tag: isLine ? 'line' : 'path', attrs };
    if (!isLine && node.fill != null && node.fill !== '') {
        shape.fill = toPaint(node.fill, where);
    } else {
        delete attrs['fill-opacity'];
    }
    if (node.stroke != null && node.stroke !== '') {
        shape.stroke = toPaint(node.stroke, where);
    } else {
        delete attrs['stroke-width'];
        delete attrs['stroke-opacity'];
        delete attrs['stroke-dasharray'];
        delete attrs['stroke-dashoffset'];
    }
    return shape;
}

function groupTransform(group: any): string | undefined {
    if (group.toSVG === scene.Group.prototype.toSVG) {
        return undefined;
    }
    const element = group.toSVG()?.elements[0] as Element | undefined;
    const transform = element?.tagName.toLowerCase() === 'g' ? element.getAttribute('transform') : null;
    return transform ? roundNumbersIn(transform) : undefined;
}

function serialiseChildren(group: any, where: string): MiniChartSvgNode[] {
    const children = [...group.children()].sort(scene.Group.compareChildren);
    return children.flatMap((child, i) => serialiseNode(child, `${where}/${i}`));
}

function serialiseNode(node: any, where: string): MiniChartSvgNode[] {
    if (!node.visible) {
        return [];
    }
    if (node instanceof scene.Group) {
        const children = serialiseChildren(node, where);
        const { clipRect } = node;
        const opacity = node.opacity ?? 1;
        const transform = groupTransform(node);
        if (clipRect == null && opacity === 1 && transform == null) {
            return children;
        }
        return [
            {
                tag: 'g',
                ...(clipRect != null
                    ? { clip: [round(clipRect.x), round(clipRect.y), round(clipRect.width), round(clipRect.height)] }
                    : {}),
                ...(opacity !== 1 ? { opacity: round(opacity) } : {}),
                ...(transform != null ? { transform } : {}),
                children,
            } satisfies MiniChartSvgGroup,
        ];
    }
    if (node instanceof scene.Path || node instanceof scene.Line) {
        return [serialiseShape(node, where)];
    }
    throw new Error(`${where}: unsupported scene node ${node.constructor?.name}`);
}

function renderTemplate(selectorName: string): { chartType: string; template: MiniChartSvgTemplate } {
    const selector = miniCharts[selectorName];
    if (!selector) {
        throw new Error(`Unknown mini chart selector ${selectorName}`);
    }
    const agChartsExports = { _Scene: { ...scene, Scene: CapturingScene } };
    const container = win.document.createElement('div');
    const chart = new selector.miniChart(container, agChartsExports, [...FILLS], [...STROKES], false);
    chart.chartTranslation = { translate: (key: string) => key };
    chart.beans = {
        log: {
            error: (...args: unknown[]) => {
                throw new Error(`${selectorName}: ${JSON.stringify(args)}`);
            },
            warn: (...args: unknown[]) => console.warn(selectorName, ...args),
        },
    };
    chart.postConstruct();
    const root = chart.scene.root;
    if (root == null) {
        throw new Error(`${selectorName}: scene root was not captured`);
    }
    return {
        chartType: selector.chartType,
        template: { tooltip: chart.tooltipName, children: serialiseChildren(root, selectorName) },
    };
}

async function buildModule(): Promise<string> {
    const entries = TEMPLATE_SELECTORS.map(renderTemplate);
    const body = entries.map(({ chartType, template }) => `${chartType}: ${JSON.stringify(template)},`).join('\n');
    const source = `// Generated by scripts/mini-chart-svgs/generate-mini-chart-svgs.mts from the canvas mini chart classes.
// Regenerate with: ${RUN_COMMAND} (check for drift with: ${RUN_COMMAND} --check)
// ag-charts-community version: ${chartsVersion}
// Do not edit by hand.
import type { ChartType } from 'ag-grid-community';

import type { MiniChartSvgTemplate } from './miniChartSvgTypes';

export const MINI_CHART_SVG_TEMPLATES: Partial<Record<ChartType, MiniChartSvgTemplate>> = {
${body}
};
`;
    const options = await prettier.resolveConfig(OUTPUT_FILE);
    return prettier.format(source, { ...options, filepath: OUTPUT_FILE });
}

const PROOF_FILLS = ['#5090dc', '#ffa03a', '#459d55', '#34bfe1', '#e1cc00', '#9669cb', '#b5b5b5', '#fb6767'];
const PROOF_STROKES = ['#2b5c95', '#cc6f10', '#1e652e', '#18859e', '#a39400', '#603c88', '#575757', '#ab1d1d'];

const paintToSvg = (paint: MiniChartSvgPaint | undefined) =>
    paint == null
        ? 'none'
        : typeof paint === 'string'
          ? paint
          : (paint.palette === 'fills' ? PROOF_FILLS : PROOF_STROKES)[paint.index];

function nodeToSvg(node: MiniChartSvgNode): string {
    if (node.tag === 'g') {
        const inner = node.children.map(nodeToSvg).join('');
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
    const stroke = node.stroke != null ? ` stroke="${paintToSvg(node.stroke)}"` : '';
    return `<${node.tag}${attrs} fill="${paintToSvg(node.fill)}"${stroke}/>`;
}

function writeProof(): void {
    mkdirSync(PROOF_DIR, { recursive: true });
    for (const name of [...PROOF_SELECTORS, 'MiniLine']) {
        const { chartType, template } = renderTemplate(name);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}"><title>${template.tooltip}</title>${template.children.map(nodeToSvg).join('')}</svg>\n`;
        const file = join(PROOF_DIR, `${chartType}.svg`);
        writeFileSync(file, svg);
        writeFileSync(join(PROOF_DIR, `${chartType}.json`), JSON.stringify(template, null, 2));
        console.log(`Wrote ${relative(ROOT, file)}`);
    }
}

const mode = process.argv[2];
if (mode === '--proof') {
    writeProof();
} else {
    const generated = await buildModule();
    if (mode === '--check') {
        const current = readFileSync(OUTPUT_FILE, 'utf8');
        if (current !== generated) {
            console.error(`${relative(ROOT, OUTPUT_FILE)} is out of date. Run ${RUN_COMMAND}`);
            process.exit(1);
        }
        console.log(`${relative(ROOT, OUTPUT_FILE)} is up to date.`);
    } else {
        writeFileSync(OUTPUT_FILE, generated);
        console.log(`Wrote ${relative(ROOT, OUTPUT_FILE)}`);
    }
}
