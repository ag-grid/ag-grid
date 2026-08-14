import { exampleRunnerAsset } from '@utils/exampleModules/exampleRunnerAsset';
import {
    ASSET_REGEX,
    CSS_IMPORT_REGEX,
    EXTENSIONS,
    SPECIFIER_REGEX,
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

/** Identifies the JSON block the page carries the transpiler's options in */
export const TRANSPILER_OPTIONS_ID = 'ag-transpiler-options';

/** Extensions to try for a specifier that names a module without saying which kind */
const MODULE_EXTENSIONS = [...EXTENSIONS, '.js'];

/** A relative specifier that already names a module the loader can fetch as-is */
const MODULE_EXTENSION_REGEX = /\.(tsx?|jsx?|mjs|cjs)$/i;

/**
 * Everything the in-page transpiler shares with the server-side transform, so that the two
 * cannot drift. Only these travel with the page; the transpiler itself is served.
 */
const getTranspilerOptions = (entryFileName: string) => ({
    entry: `./${entryFileName}`,
    specifierRegex: SPECIFIER_REGEX.source,
    cssImportRegex: CSS_IMPORT_REGEX.source,
    assetRegex: ASSET_REGEX.source,
    moduleExtensionRegex: MODULE_EXTENSION_REGEX.source,
    moduleExtensions: MODULE_EXTENSIONS,
    compilerOptions: getCompilerOptions(ts),
    stylesheetLoaderName: STYLESHEET_LOADER_NAME,
});

/**
 * Transpiles the example in the page, rather than being served the result. Only Plunker and the
 * static CodeSandbox export need this: they host static files with no build step, and have to
 * show the TypeScript the example was authored in, so nothing can transpile the sources before
 * they get there. See `public/example-runner/browser-transpiler.js`.
 */
export const BrowserTranspiler = ({ entryFileName, nonce }: Props) => (
    <>
        <script nonce={nonce} src={TYPESCRIPT_URL} crossOrigin="anonymous" />
        <script
            nonce={nonce}
            type="application/json"
            id={TRANSPILER_OPTIONS_ID}
            dangerouslySetInnerHTML={{ __html: JSON.stringify(getTranspilerOptions(entryFileName)) }}
        />
        <script nonce={nonce} type="module" src={exampleRunnerAsset('browser-transpiler.js')} />
    </>
);
