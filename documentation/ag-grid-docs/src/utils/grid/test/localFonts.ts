import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

export const GOOGLE_FONTS_CSS = 'https://fonts.googleapis.com/css2';

/** Only families examples measure text in are worth installing; every other one still goes to the mirror. */
const FONT_PACKAGES: Record<string, string> = {
    'IBM Plex Sans': '@fontsource/ibm-plex-sans',
};

/** Fontsource writes one `src` per face, woff2 first, then a woff fallback that goes with it. */
const FONTSOURCE_SRC = /src:\s*url\(\.\/(files\/\S+\.woff2)\)[^;]*;/g;

const resolveFrom = createRequire(import.meta.url).resolve;

/** Relative to its own package, so the faces have to be read before another family's are appended. */
async function inlineFaces(pkg: string, css: string): Promise<string> {
    const files = Array.from(new Set(Array.from(css.matchAll(FONTSOURCE_SRC), (match) => match[1])));
    const bodies = await Promise.all(files.map((file) => readFile(resolveFrom(`${pkg}/${file}`))));
    const base64 = new Map(files.map((file, i) => [file, bodies[i].toString('base64')]));
    return css.replace(FONTSOURCE_SRC, (_, file) => `src: url(data:font/woff2;base64,${base64.get(file)});`);
}

/**
 * A weight list is what names the fontsource files, so a bare family or a `300..700` range is not something
 * the installed package can answer - those belong to the mirror.
 */
async function familyStylesheet(entry: string): Promise<string | undefined> {
    const [family, weights] = entry.split(':wght@');
    const pkg = FONT_PACKAGES[family];
    if (!pkg || !weights || weights.includes('..')) {
        return undefined;
    }
    const sheets = await Promise.all(
        weights.split(';').map((weight) => readFile(resolveFrom(`${pkg}/${weight}.css`), 'utf8'))
    );
    return inlineFaces(pkg, sheets.join(''));
}

/**
 * Examples auto-size columns the first time data renders and those widths stick, so a grid that measures
 * before its webfont arrives keeps fallback widths for ever. Inlining the faces leaves nothing to race -
 * they are usable as the stylesheet parses, before any script mounts a grid. Neither half of that is
 * available from the CDN: the face is a second request the grid can beat, and even `display=block` lays
 * text out with the fallback's metrics until it lands.
 *
 * All or nothing across the `family` parameters: one request is one stylesheet, so answering it with the
 * faces of only the families installed would silently drop the others.
 */
async function buildStylesheet(url: string): Promise<string | undefined> {
    const requested = new URL(url).searchParams.getAll('family');
    if (requested.length === 0) {
        return undefined;
    }
    const families = await Promise.all(requested.map(familyStylesheet));
    if (families.some((css) => css === undefined)) {
        return undefined;
    }
    return families.join('').replace(/font-display:\s*swap;/g, 'font-display: block;');
}

/** The same stylesheet serves every test in the worker, and building it base64s a few hundred KB. */
const stylesheets = new Map<string, Promise<string | undefined>>();

/** Undefined for anything the installed packages cannot cover - an unknown family, or a weight not shipped. */
export function localFontStylesheet(url: string): Promise<string | undefined> {
    let pending = stylesheets.get(url);
    if (!pending) {
        pending = buildStylesheet(url).catch(() => undefined);
        stylesheets.set(url, pending);
    }
    return pending;
}
