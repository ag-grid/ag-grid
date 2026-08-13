import {
    ASSET_REGEX,
    CSS_IMPORT_REGEX,
    EXTENSIONS,
    SPECIFIER_REGEX,
    STYLESHEET_LOADER,
    STYLESHEET_LOADER_NAME,
    getCompilerOptions,
} from '@utils/exampleModules/transformExampleModule';
import ts from 'typescript';

interface Props {
    /** The example's entry file, as authored -- `main.ts`, not `main.js` */
    entryFileName: string;
    nonce?: string;
}

/** Pinned to the version the repository builds with, so the two transpilers cannot drift */
const TYPESCRIPT_URL = `https://cdn.jsdelivr.net/npm/typescript@${ts.version}/lib/typescript.js`;

/** Extensions to try for a specifier that names a module without saying which kind */
const MODULE_EXTENSIONS = [...EXTENSIONS, '.js'];

/** A relative specifier that already names a module the loader can fetch as-is */
const MODULE_EXTENSION_REGEX = /\.(tsx?|jsx?|mjs|cjs)$/i;

/**
 * Transpiles the example in the page, rather than being served the result. Only Plunker needs
 * this: it hosts static files with no build step, and has to show the TypeScript the example
 * was authored in, so nothing can transpile the sources before they get there.
 *
 * Modules become blob URLs, because a browser will not execute TypeScript and there is no
 * other URL to give the transpiled output. That costs the two things a real URL provides,
 * both of which are patched back in per module: relative specifiers (rewritten to the blob
 * URL of the dependency, or to an absolute URL for a non-module asset) and `import.meta.url`
 * (substituted with the module's real URL). Bare specifiers are left alone -- a blob module
 * resolves those through the document's import map like any other.
 */
export const BrowserTranspiler = ({ entryFileName, nonce }: Props) => (
    <>
        <script nonce={nonce} src={TYPESCRIPT_URL} crossOrigin="anonymous" />
        <script
            nonce={nonce}
            type="module"
            dangerouslySetInnerHTML={{
                __html: `${STYLESHEET_LOADER}
// Each module is its own blob, so the loader has to be reachable from all of them
window.${STYLESHEET_LOADER_NAME} = ${STYLESHEET_LOADER_NAME};

const compilerOptions = (${getCompilerOptions.toString()})(ts);

const specifierRegex = () => new RegExp(${JSON.stringify(SPECIFIER_REGEX.source)}, 'g');
const cssImportRegex = () => new RegExp(${JSON.stringify(CSS_IMPORT_REGEX.source)}, 'gm');
const assetRegex = /${ASSET_REGEX.source}/i;
const moduleExtensionRegex = /${MODULE_EXTENSION_REGEX.source}/i;
const moduleExtensions = ${JSON.stringify(MODULE_EXTENSIONS)};

const isRelative = (specifier) => specifier.startsWith('./') || specifier.startsWith('../');

/** Modules are keyed by their real URL, so a module shared by two others is compiled once */
const blobUrls = new Map();

/**
 * Native resolution has no default extension, and neither do the sources: Angular examples
 * import './app.component'. Each candidate is fetched rather than probed, since the response
 * is what gets compiled anyway.
 */
const fetchModule = async (url) => {
    const candidates = moduleExtensionRegex.test(url) ? [url] : moduleExtensions.map((ext) => url + ext);

    for (const candidate of candidates) {
        const response = await fetch(candidate);
        if (response.ok) {
            return { url: candidate, source: await response.text() };
        }
    }

    throw new Error('Could not resolve example module: ' + url);
};

/** As \`rewriteCssImports\` server-side, but resolving relative hrefs here rather than in the module */
const rewriteCssImports = (source, url) => {
    const rewritten = source.replace(cssImportRegex(), (match, quote, specifier) => {
        if (!isRelative(specifier)) {
            return match;
        }
        return 'await window.${STYLESHEET_LOADER_NAME}(' + JSON.stringify(new URL(specifier, url).href) + ');';
    });

    return rewritten.replace(cssImportRegex(), (_match, _quote, specifier) => {
        return 'await window.${STYLESHEET_LOADER_NAME}(import.meta.resolve(' + JSON.stringify(specifier) + '));';
    });
};

const rewriteSpecifiers = async (source, url) => {
    const rewrites = new Map();

    for (const [, , , specifier] of source.matchAll(specifierRegex())) {
        if (!isRelative(specifier) || rewrites.has(specifier)) {
            continue;
        }

        const resolved = new URL(specifier, url).href;
        rewrites.set(specifier, assetRegex.test(specifier) ? resolved : await toBlobUrl(resolved));
    }

    return source.replace(specifierRegex(), (match, prefix, quote, specifier) =>
        rewrites.has(specifier) ? prefix + quote + rewrites.get(specifier) + quote : match
    );
};

const toBlobUrl = async (requestedUrl) => {
    if (blobUrls.has(requestedUrl)) {
        return blobUrls.get(requestedUrl);
    }

    const pending = (async () => {
        const { url, source } = await fetchModule(requestedUrl);
        const { outputText } = ts.transpileModule(rewriteCssImports(source, url), { fileName: url, compilerOptions });
        const withRealUrl = outputText.replaceAll('import.meta.url', JSON.stringify(url));
        const code = await rewriteSpecifiers(withRealUrl, url);

        return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    })();

    blobUrls.set(requestedUrl, pending);

    return pending;
};

await import(await toBlobUrl(new URL(${JSON.stringify(`./${entryFileName}`)}, document.baseURI).href));
`,
            }}
        />
    </>
);
