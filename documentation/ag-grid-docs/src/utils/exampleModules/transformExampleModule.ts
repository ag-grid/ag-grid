import ts from 'typescript';

/**
 * Examples are authored in TypeScript (and JSX/TSX for React), which browsers cannot
 * execute. Transpiling here lets the browser load the result as a plain ES module, with no
 * loader or in-browser compiler in the page.
 */

export const EXTENSIONS = ['.ts', '.tsx', '.jsx'] as const;

const EXTENSION_REGEX = /\.(tsx?|jsx)$/;

/** Matches the specifier of a static import/export, or a dynamic `import()` */
export const SPECIFIER_REGEX = /(\bfrom\s*|\bimport\s*\(?\s*|\bexport\s*\*\s*from\s*)(['"])([^'"]+)\2/g;

/** A bare `import 'foo.css';` with no bindings */
export const CSS_IMPORT_REGEX = /^[ \t]*import\s+(['"])([^'"]+\.css)\1;?[ \t]*$/gm;

/**
 * `emitDecoratorMetadata` is what lets the Angular JIT compiler resolve constructor
 * injection: without the emitted `design:paramtypes`, any component or service with
 * constructor dependencies fails to instantiate (NG0202).
 *
 * Self-contained, because the Plunker template serialises this function into the page it
 * generates (see `BrowserTranspiler`) so that both transpilers stay on the same options.
 */
export const getCompilerOptions = (tsModule: typeof ts): ts.CompilerOptions => ({
    module: tsModule.ModuleKind.ESNext,
    // ES2022 so the top-level `await` a stylesheet import compiles to is emitted as authored
    target: tsModule.ScriptTarget.ES2022,
    jsx: tsModule.JsxEmit.React,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
});

/** Playwright specs live alongside an example but are not part of it, and are never served */
export const isSpecFile = (fileName: string) => fileName.includes('.spec.') || fileName.includes('.test.');

export const isTransformableModule = (fileName: string) => EXTENSION_REGEX.test(fileName) && !isSpecFile(fileName);

/** The name a transpiled module is served under, which is what other modules import */
export const toModuleFileName = (fileName: string) => fileName.replace(EXTENSION_REGEX, '.js');

/**
 * The source file a browser request for `fileName` should be transpiled from, if any.
 * Requests arrive for `.js`, because that is what the rewritten specifiers point at; the
 * original extensions keep serving the source, which is what the code viewer shows.
 */
export const getModuleSourceFileName = (fileName: string, availableFiles: string[]) => {
    if (!fileName.endsWith('.js') || availableFiles.includes(fileName)) {
        return undefined;
    }

    const withoutExtension = fileName.slice(0, -'.js'.length);
    return EXTENSIONS.map((ext) => `${withoutExtension}${ext}`).find((candidate) => availableFiles.includes(candidate));
};

const isRelative = (specifier: string) => specifier.startsWith('./') || specifier.startsWith('../');

/**
 * What a specifier can end with and already be servable as authored: an asset, or a module
 * extension a browser resolves itself. Recognised by extension rather than by "has any
 * extension at all", because a specifier can carry a dot and still name a module --
 * `./app.component` is how Angular examples import theirs.
 */
export const SERVED_AS_AUTHORED_REGEX = /\.(css|json|html|svg|png|jpe?g|gif|webp|wasm|txt|js|mjs|cjs)$/i;

/** The subset of the above that is not a module, and so can never be transpiled */
export const ASSET_REGEX = /\.(css|json|html|svg|png|jpe?g|gif|webp|wasm|txt)$/i;

/**
 * Native module resolution has no notion of a "default extension", so every relative
 * specifier needs an explicit one. Transpiled sources are served as `.js`; anything already
 * naming a non-module file (a stylesheet, a JSON asset) is left as authored.
 */
const rewriteRelativeSpecifiers = (source: string) =>
    source.replace(SPECIFIER_REGEX, (match, prefix, quote, specifier) => {
        const servedAsAuthored = SERVED_AS_AUTHORED_REGEX.test(specifier) && !isTransformableModule(specifier);

        if (!isRelative(specifier) || servedAsAuthored) {
            return match;
        }

        const rewritten = toModuleFileName(specifier);

        return `${prefix}${quote}${rewritten.endsWith('.js') ? rewritten : `${rewritten}.js`}${quote}`;
    });

export const STYLESHEET_LOADER_NAME = '__agLoadStylesheet';

/**
 * Awaited, so a module never reaches the code that measures the page before the styles it
 * imported apply -- an example whose layout comes from its own stylesheet would otherwise
 * create its grid in a collapsed container. A stylesheet the template already linked is
 * matched by path, since the template's href can carry a cache-busting query.
 */
export const STYLESHEET_LOADER = `const ${STYLESHEET_LOADER_NAME} = (href) => new Promise((resolve) => {
    const { pathname } = new URL(href, document.baseURI);
    const linked = (link) => new URL(link.href, document.baseURI).pathname === pathname;
    if (Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(linked)) {
        resolve();
        return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.addEventListener('load', () => resolve());
    link.addEventListener('error', () => resolve());
    document.head.appendChild(link);
});
`;

/**
 * `import 'some.css'` is not valid without a CSS module attribute, so CSS imports become
 * `<link>` elements instead. `import.meta.resolve` maps a package stylesheet through the
 * page's import map and a relative one against the module's own URL.
 */
const rewriteCssImports = (source: string) => {
    const rewritten = source.replace(
        CSS_IMPORT_REGEX,
        (_match, _quote, specifier) => `await ${STYLESHEET_LOADER_NAME}(import.meta.resolve('${specifier}'));`
    );

    return rewritten === source ? source : `${STYLESHEET_LOADER}${rewritten}`;
};

export const transformExampleModule = ({ fileName, source }: { fileName: string; source: string }) => {
    const { outputText } = ts.transpileModule(rewriteCssImports(rewriteRelativeSpecifiers(source)), {
        fileName,
        compilerOptions: getCompilerOptions(ts),
    });

    return outputText;
};
