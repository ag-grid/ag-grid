import type { ParamTypes } from './GENERATED-param-types';
import { corePart } from './parts/core/core-part';
import { InferParams, Part, borderValueToCss, getPartParams } from './theme-types';
import { camelCase, paramToVariableName } from './theme-utils';

export type Theme = {
    css: string;
    paramDefaults: Record<string, string>;
};

export type PickVariables<P extends Part, V extends object> = {
    [K in InferParams<P>]?: K extends keyof V ? V[K] : never;
};

export const defineTheme = <P extends Part, V extends object = ParamTypes>(
    partOrParts: P | P[],
    parameters: PickVariables<P, V>
): Theme => {
    const result: Theme = {
        css: '',
        paramDefaults: {},
    };

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
    const mergedParams: Record<string, any> = {};

    // merge part defaults
    for (const part of parts) {
        Object.assign(mergedParams, part.defaults);
    }

    const allowedParams = new Set<string>(parts.flatMap((part) => getPartParams(part)));

    // apply override params passed to this method
    for (const [name, value] of Object.entries(overrideParams)) {
        if (value === undefined) continue;
        if (allowedParams.has(name)) {
            if (validateParam(name, value, allowedParams)) {
                mergedParams[name] = value;
            }
        } else {
            logErrorMessageOnce(`Invalid theme parameter ${name} provided. ${invalidParamMessage}`);
        }
    }

    // render variable defaults using :where(:root) to ensure lowest specificity so that
    // `html { --ag-foreground-color: red; }` will override this
    let variableDefaults = ':where(:root, :host > *) {\n';
    for (const name of Object.keys(mergedParams)) {
        let value = mergedParams[name];
        if (isBorderParam(name)) {
            value = borderValueToCss(value);
        }
        if (typeof value === 'string' && value) {
            variableDefaults += `\t${paramToVariableName(name)}: ${value};\n`;
            result.paramDefaults[name] = value;
        }
    }
    variableDefaults += '}';

    // combine CSS
    const mainCSS: string[] = [variableDefaults];
    for (const part of parts) {
        if (part.css) {
            mainCSS.push(`/* Part ${part.partId}/${part.variantId} */`);
            mainCSS.push(...part.css.map((p) => (typeof p === 'function' ? p() : p)));
        }
    }
    result.css = mainCSS.join('\n');

    checkForUnsupportedVariables(result.css, Object.keys(mergedParams));

    return result;
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

const isBorderParam = (property: string) => property.startsWith('borders') || property.endsWith('Border');

const validateParam = (property: string, value: unknown, allowedParams: Set<string>): boolean => {
    const actualType = typeof value;
    if (isBorderParam(property) && actualType === 'boolean') return true;
    if (actualType !== 'string') {
        logErrorMessageOnce(`Invalid value for ${property} (expected a string, got ${describeValue(value)})`);
        return false;
    }
    if (typeof value === 'string') {
        for (const varMatch of value.matchAll(/var\(--ag-([a-z-]+)[^)]*\)/g)) {
            const paramName = camelCase(varMatch[1]);
            if (!allowedParams.has(paramName)) {
                logErrorMessageOnce(
                    `Invalid value provided to theme parameter ${property}. Expression "${varMatch[0]}" refers to non-existent parameter ${paramName}. ${invalidParamMessage}`
                );
            }
        }
    }
    return true;
};

const invalidParamMessage = "It may be misspelled, or defined by a theme part that you aren't currently using";

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
