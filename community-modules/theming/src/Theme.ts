import type { ParamTypes } from './GENERATED-param-types';
import { getParamType } from './main';
import { corePart } from './parts/core/core-part';
import type { InferParams, Part } from './theme-types';
import { getPartParams, paramValueToCss } from './theme-types';
import { paramToVariableName } from './theme-utils';
import { VERSION } from './version';

export type ThemeArgs = {
    parts: Part | Part[];
    params?: Partial<ParamTypes>;
};

export type ThemeInstallArgs = {
    container?: HTMLElement;
};

export class Theme {
    constructor(private args: ThemeArgs) {}

    private parts?: Part[];
    public getParts(): Part[] {
        if (this.parts) return this.parts;
        // For parts with a partId, only allow one variant allowed, last variant wins
        const removeDuplicates: Record<string, Part> = { [corePart.partId]: corePart };
        for (const part of flattenParts(this.args.parts)) {
            // remove any existing item before overwriting, so that the newly added part
            // is ordered at the end of the list
            delete removeDuplicates[part.partId];
            removeDuplicates[part.partId] = part;
        }
        return (this.parts = Object.values(removeDuplicates));
    }

    private mergedParams?: Partial<ParamTypes>;
    /**
     * Return the actual params used to render the theme, including defaults
     * provided by the theme parts and params passed to the Theme constructor
     */
    public getParams(): Partial<ParamTypes> {
        if (this.mergedParams) return this.mergedParams;

        const parts = this.getParts();
        const mergedParams: any = {};

        for (const part of parts) {
            Object.assign(mergedParams, part.defaults);
        }

        const allowedParams = new Set<string>(parts.flatMap((part) => getPartParams(part)));

        for (const [name, value] of Object.entries(this.args.params || {})) {
            if (value == null) continue;
            if (allowedParams.has(name)) {
                mergedParams[name] = value;
            } else {
                logErrorMessageOnce(
                    `Invalid theme parameter ${name} provided. It may be misspelled, or defined by a theme part that you aren't currently using.`
                );
            }
        }

        return (this.mergedParams = mergedParams);
    }

    private renderedParams?: Record<string, string>;
    /**
     * Return the values of the params as CSS strings
     */
    public getRenderedParams(): Record<string, string> {
        if (this.renderedParams) return this.renderedParams;

        const mergedParams = this.getParams();
        const renderedParams: Record<string, string> = {};

        for (const [name, value] of Object.entries(mergedParams)) {
            const rendered = paramValueToCss(name, value);
            if (rendered instanceof Error) {
                logErrorMessageOnce(`Invalid value for ${name} - ${describeValue(value)} - ${rendered.message}`);
            } else if (rendered) {
                renderedParams[name] = rendered;
            }
        }

        return (this.renderedParams = renderedParams);
    }

    private cssChunks?: ThemeCssChunk[];
    public getCSSChunks(): ThemeCssChunk[] {
        if (this.cssChunks) return this.cssChunks;

        const chunks: ThemeCssChunk[] = [];

        const googleFonts = this.makeGoogleFontsChunk();
        if (googleFonts) chunks.push(googleFonts);

        chunks.push(this.makeVariablesChunk());

        for (const part of this.getParts()) {
            if (part.css) {
                let css = `/* Part ${part.partId}/${part.variantId} */`;
                css += part.css.map((p) => (typeof p === 'function' ? p() : p)).join('\n') + '\n';
                chunks.push({
                    css,
                    // TODO this can just be variantId once we make variantId include partId
                    id: `${part.partId}/${part.variantId}`,
                });
            }
        }

        return (this.cssChunks = chunks);
    }

    /**
     * Inject CSS for this theme into the head of the current page. A promise is
     * returned that resolves when all inserted stylesheets have loaded.
     *
     * Only one theme can be loaded at a time. Calling this method will replace
     * any previously installed theme.
     *
     * @param args.container The container that the grid is rendered within. If
     * the grid is rendered inside a shadow DOM root, you must pass the grid's
     * parent element to ensure that the styles are adopted into the shadow DOM.
     */
    public async install(args: ThemeInstallArgs = {}) {
        let container = args.container || null;
        const loadPromises: Promise<void>[] = [];
        if (!container) {
            container = document.querySelector('head');
            if (!container) throw new Error("Can't install theme before document head is created");
        }
        const chunks = this.getCSSChunks();
        const activeChunkIds = new Set(chunks.map((chunk) => chunk.id));
        const existingStyles = Array.from(
            container.querySelectorAll(':scope > [data-ag-injected-style-id]')
        ) as AnnotatedStyleElement[];
        existingStyles.forEach((style) => {
            if (!activeChunkIds.has(style.dataset.agInjectedStyleId!)) {
                style.remove();
            }
        });
        for (const chunk of chunks) {
            let style = existingStyles.find((s) => s.dataset.agInjectedStyleId === chunk.id);
            if (!style) {
                style = document.createElement('style');
                style.dataset.agInjectedStyleId = chunk.id;
                const lastExistingStyle = existingStyles[existingStyles.length - 1];
                container.insertBefore(style, lastExistingStyle?.nextSibling || null);
            }
            if (style._agTextContent !== chunk.css) {
                style.textContent = chunk.css;
                style._agTextContent = chunk.css;
                loadPromises.push(resolveOnLoad(style));
            }
        }

        await Promise.all(loadPromises);
    }

    public getCSS(): string {
        return (
            fileHeader(this.args.params || {}) +
            this.getCSSChunks()
                .map((chunk) => chunk.css)
                .join('\n\n')
        );
    }

    private makeGoogleFontsChunk(): ThemeCssChunk | null {
        const googleFonts = new Set<string>();
        const fontWeights = new Set<number>([400]);

        // find Google fonts
        for (const [name, value] of Object.entries(this.getParams())) {
            const addFont = (value: unknown) => {
                const googlePrefix = 'google:';
                if (typeof value === 'string' && value.startsWith(googlePrefix)) {
                    googleFonts.add(value.replace(googlePrefix, ''));
                }
            };
            const paramType = getParamType(name);
            if (paramType === 'fontFamily') {
                if (Array.isArray(value)) {
                    value.forEach(addFont);
                } else {
                    addFont(value);
                }
            } else if (paramType === 'fontWeight') {
                const parsed = parseFloat(value as string);
                if (!isNaN(parsed)) {
                    fontWeights.add(parsed);
                } else if (value === 'bold') {
                    fontWeights.add(700);
                }
            }
        }

        const css = Array.from(googleFonts)
            .sort()
            .map((font) => {
                const weights = Array.from(fontWeights).filter((w) => tmpKnownGoogleFontWeights[font]?.includes(w));
                if (weights.length === 0) {
                    const firstKnownWeight = tmpKnownGoogleFontWeights[font]?.[0];
                    if (firstKnownWeight) {
                        weights.push(firstKnownWeight);
                    }
                }
                const weightsUrlPart = weights.length ? ':wght@' + weights.sort().join(';') : '';
                return `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}${weightsUrlPart}&display=swap');\n`;
            })
            .join('');

        return {
            css,
            id: 'googleFonts',
        };
    }

    private makeVariablesChunk(): ThemeCssChunk {
        let variablesCss = '';
        let inheritanceCss = '';
        for (const [name, defaultValue] of Object.entries(this.getRenderedParams())) {
            const variable = paramToVariableName(name);
            const inheritedVariable = variable.replace('--ag-', '--ag-inherited-');
            variablesCss += `\t${variable}: var(${inheritedVariable}, ${defaultValue});\n`;
            inheritanceCss += `\t${inheritedVariable}: var(${variable});\n`;
        }
        let css = `.ag-root-wrapper, .ag-measurement-container, .ag-apply-theme-variables {\n${variablesCss}}\n`;
        css += `:has(> .ag-root-wrapper) {\n${inheritanceCss}}\n`;
        return {
            css,
            id: 'variables',
        };
    }
}

const resolveOnLoad = (element: HTMLStyleElement) =>
    new Promise<void>((resolve) => {
        const handler = () => {
            element.removeEventListener('load', handler);
            resolve();
        };
        element.addEventListener('load', handler);
    });

// TODO remove this, API should explicitly ask Google Fonts to be loaded.
const tmpKnownGoogleFontWeights: Record<string, number[] | undefined> = {
    Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    'IBM Plex Sans': [100, 200, 300, 400, 500, 600, 700],
    'IBM Plex Mono': [100, 200, 300, 400, 500, 600, 700],
    Roboto: [100, 300, 400, 500, 700, 900],
    'Inclusive Sans': [400],
    'Open Sans': [100, 300, 500, 600, 700, 800],
    Lato: [100, 300, 400, 700, 900],
    Merriweather: [300, 400, 700, 900],
    UnifrakturCook: [700],
    'Pixelify Sans': [400, 500, 600, 700],
};

export type ThemeCssChunk = {
    css: string;
    id: string;
};

type AnnotatedStyleElement = HTMLStyleElement & {
    _agTextContent?: string;
};

const flattenParts = (parts: Part | Part[], accumulator: Part[] = []) => {
    for (const part of Array.isArray(parts) ? parts : [parts]) {
        if (part.dependencies) {
            flattenParts(part.dependencies(), accumulator);
        }
        accumulator.push(part);
    }
    return accumulator;
};

export type PickVariables<P extends Part, V extends object> = {
    [K in InferParams<P>]?: K extends keyof V ? V[K] : never;
};

export const installDocsUrl = 'https://www.ag-grid.com/javascript-data-grid/applying-theme-builder-styling-grid/';

const fileHeader = (parameters: Record<string, unknown>) => `/*
 * This file is a theme downloaded from the AG Grid Theme Builder for AG Grid ${VERSION}.
 *
 * See installation docs at ${installDocsUrl}
 */

`;

const describeValue = (value: any): string => {
    if (value == null) return String(value);
    return `${typeof value} ${value}`;
};

const loggedMessages = new Set<string>();
const logErrorMessageOnce = (message: string) => {
    if (loggedMessages.has(message)) return;
    loggedMessages.add(message);
    console.error(message);
};
