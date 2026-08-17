import type { InternalFramework } from '@ag-grid-types';
import { isReactInternalFramework } from '@utils/framework';
import ts from 'typescript';

export const EXTENSIONS = ['.ts', '.tsx', '.jsx'] as const;

const EXTENSION_REGEX = /\.(tsx?|jsx)$/;

export const SPECIFIER_REGEX = /(\bfrom\s*|\bimport\s*\(?\s*|\bexport\s*\*\s*from\s*)(['"])([^'"]+)\2/g;

export const CSS_IMPORT_REGEX = /^[ \t]*import\s+(['"])([^'"]+\.css)\1;?[ \t]*$/gm;

export const COMPILER_OPTION_ENUMS = { module: 'ModuleKind', target: 'ScriptTarget', jsx: 'JsxEmit' } as const;

export type NamedCompilerOptions = Record<string, string | boolean>;

export const getCompilerOptionNames = (internalFramework: InternalFramework): NamedCompilerOptions => ({
    module: 'ESNext',
    // ES2022 so the top-level `await` a stylesheet import compiles to is emitted as authored
    target: 'ES2022',
    ...(isReactInternalFramework(internalFramework) ? { jsx: 'React' } : {}),
    ...(internalFramework === 'angular' ? { experimentalDecorators: true, emitDecoratorMetadata: true } : {}),
});

export const resolveCompilerOptions = (tsModule: typeof ts, named: NamedCompilerOptions): ts.CompilerOptions =>
    Object.fromEntries(
        Object.entries(named).map(([name, value]) => {
            const tsModuleKey = COMPILER_OPTION_ENUMS[name as keyof typeof COMPILER_OPTION_ENUMS];

            return [name, tsModuleKey ? tsModule[tsModuleKey][value as any] : value];
        })
    );

export const getCompilerOptions = (tsModule: typeof ts, internalFramework: InternalFramework): ts.CompilerOptions =>
    resolveCompilerOptions(tsModule, getCompilerOptionNames(internalFramework));

export const isSpecFile = (fileName: string) => fileName.includes('.spec.') || fileName.includes('.test.');

export const isTransformableModule = (fileName: string) => EXTENSION_REGEX.test(fileName) && !isSpecFile(fileName);

export const toModuleFileName = (fileName: string) => fileName.replace(EXTENSION_REGEX, '.js');

export const getModuleSourceFileName = (fileName: string, availableFiles: string[]) => {
    if (!fileName.endsWith('.js') || availableFiles.includes(fileName)) {
        return undefined;
    }

    const withoutExtension = fileName.slice(0, -'.js'.length);
    return EXTENSIONS.map((ext) => `${withoutExtension}${ext}`).find((candidate) => availableFiles.includes(candidate));
};

const isRelative = (specifier: string) => specifier.startsWith('./') || specifier.startsWith('../');

export const SERVED_AS_AUTHORED_REGEX = /\.(css|json|html|svg|png|jpe?g|gif|webp|wasm|txt|js|mjs|cjs)$/i;

export const ASSET_REGEX = /\.(css|json|html|svg|png|jpe?g|gif|webp|wasm|txt)$/i;

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

const rewriteCssImports = (source: string) => {
    const rewritten = source.replace(
        CSS_IMPORT_REGEX,
        (_match, _quote, specifier) => `await ${STYLESHEET_LOADER_NAME}(import.meta.resolve('${specifier}'));`
    );

    return rewritten === source ? source : `${STYLESHEET_LOADER}${rewritten}`;
};

export const transformExampleModule = ({
    fileName,
    source,
    internalFramework,
}: {
    fileName: string;
    source: string;
    internalFramework: InternalFramework;
}) => {
    const { outputText } = ts.transpileModule(rewriteCssImports(rewriteRelativeSpecifiers(source)), {
        fileName,
        compilerOptions: getCompilerOptions(ts, internalFramework),
    });

    return outputText;
};
