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

/**
 * Examples auto-size columns the first time data renders and those widths stick, so a grid that measures
 * before its webfont arrives keeps fallback widths for ever. Inlining the faces leaves nothing to race -
 * they are usable as the stylesheet parses, before any script mounts a grid. Neither half of that is
 * available from the CDN: the face is a second request the grid can beat, and even `display=block` lays
 * text out with the fallback's metrics until it lands.
 */
async function buildStylesheet(url: string): Promise<string | undefined> {
    const [family, weights] = (new URL(url).searchParams.get('family') ?? '').split(':wght@');
    const pkg = FONT_PACKAGES[family];
    if (!pkg) {
        return undefined;
    }
    const sheets = await Promise.all(
        weights.split(';').map((weight) => readFile(resolveFrom(`${pkg}/${weight}.css`), 'utf8'))
    );
    const css = sheets.join('');
    const files = Array.from(new Set(Array.from(css.matchAll(FONTSOURCE_SRC), (match) => match[1])));
    const bodies = await Promise.all(files.map((file) => readFile(resolveFrom(`${pkg}/${file}`))));
    const base64 = new Map(files.map((file, i) => [file, bodies[i].toString('base64')]));
    return css
        .replace(FONTSOURCE_SRC, (_, file) => `src: url(data:font/woff2;base64,${base64.get(file)});`)
        .replace(/font-display:\s*swap;/g, 'font-display: block;');
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
