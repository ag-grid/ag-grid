import type { ParamTypes } from './GENERATED-param-types';
import { getParamType } from './main';
import { corePart } from './parts/core/core-part';
import { InferParams, Part, paramValueToCss, getPartParams } from './theme-types';
import { camelCase, paramToVariableName } from './theme-utils';
import { VERSION } from './version';

export type Theme = {
    css: string;
    paramJSValues: Record<string, unknown>;
    paramCSSValues: Record<string, string>;
};

export type PickVariables<P extends Part, V extends object> = {
    [K in InferParams<P>]?: K extends keyof V ? V[K] : never;
};

export const installDocsUrl =
    'https://www.ag-grid.com/javascript-data-grid/global-style-customisation-theme-builder-integration/';

// TODO remove this when public theme builder API released
export const gridVersionTieWarning = `we are working to remove this restriction, but themes exported from the Theme Builder are for the current grid version (${VERSION}) and will not be automatically updated with new features and bug fixes in later versions. If you upgrade your application's grid version and experience issues, return to the Theme Builder to download an updated version of your theme.`;

const fileHeader = (parameters: any) => `/*
 * This file is a theme downloaded from the AG Grid Theme Builder.
 * 
 * To use this file in your application, follow the instructions at ${installDocsUrl}
 * 
 * NOTE: ${gridVersionTieWarning}
 * 
 * The following parameters have been changed from their default values: ${JSON.stringify(Object.fromEntries(Object.entries(parameters).filter(([, value]) => value != null)), null, 2).replaceAll('\n', '\n * ')}
 */

`;

export const defineTheme = <P extends Part, V extends object = ParamTypes>(
    partOrParts: P | P[],
    parameters: PickVariables<P, V>
): Theme => {
    let css = fileHeader(parameters);

    const googleFonts = new Set<string>();

    // For parts with a partId, only allow one variant allowed, last variant wins
    const removeDuplicates: Record<string, Part> = { [corePart.partId]: corePart };
    for (const part of flattenParts(partOrParts)) {
        // remove any existing item before overwriting, so that the newly added part
        // is ordered at the end of the list
        delete removeDuplicates[part.partId];
        removeDuplicates[part.partId] = part;
    }
    const parts = Object.values(removeDuplicates);

    const overrideParams = parameters as Record<string, any>;
    const mergedParams: Record<string, unknown> = {};
    const renderedParams: Record<string, string> = {};

    // merge part defaults
    for (const part of parts) {
        Object.assign(mergedParams, part.defaults);
    }

    const allowedParams = new Set<string>(parts.flatMap((part) => getPartParams(part)));

    // apply override params passed to this method
    for (const [name, value] of Object.entries(overrideParams)) {
        if (value == null) continue;
        if (allowedParams.has(name)) {
            mergedParams[name] = value;
        } else {
            logErrorMessageOnce(
                `Invalid theme parameter ${name} provided. It may be misspelled, or defined by a theme part that you aren't currently using.`
            );
        }
    }

    // find Google fonts
    for (const [name, value] of Object.entries(mergedParams)) {
        const convertFontValue = (value: unknown) => {
            if (typeof value !== 'string') return;
            const googlePrefix = 'google:';
            if (value.startsWith(googlePrefix)) {
                googleFonts.add(value.replace(googlePrefix, ''));
            }
        };
        if (getParamType(name) === 'fontFamily') {
            if (Array.isArray(value)) {
                value.forEach(convertFontValue);
            } else {
                convertFontValue(value);
            }
        }
    }

    // render variable defaults using :where(:root) to ensure lowest specificity so that
    // `html { --ag-foreground-color: red; }` will override this
    let variableDefaults = ':where(:root, :host > *) {\n';
    for (const name of Object.keys(mergedParams)) {
        const value = mergedParams[name];
        const rendered = paramValueToCss(name, value);
        if (rendered instanceof Error) {
            logErrorMessageOnce(`Invalid value for ${name} - ${describeValue(value)} - ${rendered.message}`);
        } else if (rendered) {
            variableDefaults += `\t${paramToVariableName(name)}: ${rendered};\n`;
            renderedParams[name] = rendered;
        }
    }
    variableDefaults += '}\n';

    css += Array.from(googleFonts)
        .sort()
        .map(
            (font) =>
                `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}&display=swap');\n`
        )
        .join('');

    css += variableDefaults;

    // combine CSS
    for (const part of parts) {
        if (part.css) {
            css += `/* Part ${part.partId}/${part.variantId} */`;
            css += part.css.map((p) => (typeof p === 'function' ? p() : p)).join('\n') + '\n';
        }
    }

    checkForUnsupportedVariables(css, Object.keys(mergedParams));

    return {
        css,
        paramCSSValues: renderedParams,
        paramJSValues: mergedParams,
    };
};

export const checkForUnsupportedVariables = (css: string, params: string[]) => {
    const allowedVariables = new Set(params.map(paramToVariableName));
    allowedVariables.add('--ag-line-height');
    allowedVariables.add('--ag-indentation-level');
    for (const [, variable] of css.matchAll(/var\((--ag-[\w-]+)[^)]*\)/g)) {
        if (!allowedVariables.has(variable) && !variable.startsWith('--ag-internal')) {
            logErrorMessageOnce(`${variable} does not match a theme param`);
        }
    }
};

const describeValue = (value: any): string => {
    if (value == null) return String(value);
    return `${typeof value} ${value}`;
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

export const installTheme = (theme: Theme, container?: HTMLElement | null) => {
    const id = 'ag-injected-style';
    if (!container) {
        container = document.querySelector('head');
        if (!container) throw new Error("Can't install theme before document head is created");
    }
    let style = container.querySelector(`#${id}`) as HTMLStyleElement;
    if (!style) {
        style = document.createElement('style');
        style.setAttribute('id', id);
        container.insertBefore(style, container.firstChild);
    }
    style.textContent = theme.css;
};

const loggedMessages = new Set<string>();
export const logErrorMessageOnce = (message: string) => {
    if (loggedMessages.has(message)) return;
    loggedMessages.add(message);
    console.error(message);
};
