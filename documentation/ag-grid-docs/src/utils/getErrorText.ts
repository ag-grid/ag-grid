import { throwDevWarning } from '@ag-website-shared/utils/throwDevWarning';

import {
    AG_GRID_ERRORS,
    type ErrorId,
} from '../../../../packages/ag-grid-community/src/validation/errorMessages/errorText';

type Params = Record<string, string>;

/**
 * Matches the destructured parameter names of an error text function, i.e. the `a, b: c` of
 * `({ a, b: c }: { ... }) => ...`. Only the key before any `:` is captured as the name, so the pattern
 * holds for a minified bundle: a destructured key is tied to the object property and cannot be renamed,
 * only aliased to a shorter local binding.
 */
const DESTRUCTURED_PARAMS_PATTERN = /^\s*\(\s*\{([^}]*)\}/;

/**
 * Reverses the serialisation a parameter went through to reach the URL (see `stringifyValue` in the
 * grid's logging util), so it can be fed back into the error text template. Also used to echo a raw
 * parameter into a page's guidance, via the `errorParam` markdoc tag.
 */
export function cleanErrorParamValue(value: string): unknown {
    if (value.startsWith('[') || value.startsWith('{')) {
        // Reconstruct arrays/objects that were serialised as JSON
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
    if (value.startsWith('"') && value.endsWith('"')) {
        // Clean up serialised strings
        return value.slice(1, value.length - 1).replaceAll('\\"', '"');
    }
    if (value === 'false') {
        // Ensure false is correctly handled as a boolean
        return false;
    }
    return value;
}

function cleanParams(params: Params) {
    return Object.fromEntries(Object.entries(params).map(([key, value]) => [key, cleanErrorParamValue(value)]));
}

/** The placeholder substituted for a parameter the URL did not carry, e.g. `<moduleName>`. */
function placeholderFor(name: string): string {
    return `<${name}>`;
}

/** Stands in for a detail the URL did not carry that cannot be traced back to a named parameter. */
const UNKNOWN_PLACEHOLDER = '<unknown>';

/**
 * The parameter names an error's text function reads. An error taking no parameters returns an empty
 * list, which is what lets the page tell "this message is complete" apart from "this message is missing
 * details from the URL" — most error codes take no parameters at all, so their text is always complete.
 */
export function getErrorParamNames(errorCode: ErrorId): string[] {
    const errorTextFn = AG_GRID_ERRORS[errorCode];

    if (!errorTextFn || errorTextFn.length === 0) {
        return [];
    }

    const match = DESTRUCTURED_PARAMS_PATTERN.exec(errorTextFn.toString());

    return (
        match?.[1]
            .split(',')
            .map((param) => param.split(':')[0].split('=')[0].trim())
            .filter(Boolean) ?? []
    );
}

/**
 * The parameters this error's text needs that `params` does not supply. A non-empty result means the
 * rendered text contains `<name>` placeholders, so the page can say which details are missing rather
 * than hiding the message altogether — in production the page is the only copy of the message, as the
 * console carries just the error code and this link unless the `ValidationModule` is registered.
 */
export function getMissingErrorParams({ errorCode, params = {} }: { errorCode: ErrorId; params?: Params }): string[] {
    return getErrorParamNames(errorCode).filter((name) => params[name] === undefined);
}

export interface ErrorTextDetails {
    text: string;
    /**
     * Whether `text` had to stand a placeholder in for a detail the URL did not carry. This, rather than
     * the list of absent parameters, is what tells a reader their message is incomplete: an error's text
     * function cannot say which of its parameters are optional (optionality is a type-level distinction,
     * gone by the time this runs), and a message like #200's takes several that a console link never
     * sends. Asking whether a placeholder actually survived into the text sidesteps that entirely.
     */
    hasPlaceholders: boolean;
}

export function getErrorTextDetails({
    errorCode,
    params = {},
}: {
    errorCode: ErrorId;
    params?: Params;
}): ErrorTextDetails {
    const errorTextFn = AG_GRID_ERRORS[errorCode];

    if (!errorTextFn) {
        throwDevWarning({ message: `Error code #${errorCode} not found` });
    }

    const cleanedParams = cleanParams(params);
    const render = (renderParams: Record<string, unknown>): string => {
        try {
            const textOutput = errorTextFn(renderParams as any);
            const textOutputArray = typeof textOutput === 'string' ? [textOutput] : textOutput;

            return textOutputArray.filter(Boolean).join('\n');
        } catch {
            // A template that reads a property off an absent parameter, or calls a method on it, throws.
            return '';
        }
    };

    const missingParams = getMissingErrorParams({ errorCode, params });
    if (missingParams.length === 0) {
        return { text: render(cleanedParams), hasPlaceholders: false };
    }

    // An absent parameter renders as the string `undefined`, or makes the template throw and render
    // nothing at all. Substituting a visible `<name>` placeholder gives a message that still reads as
    // itself — which matters because in production this page is the only copy of the message, the console
    // carrying just the code and this link unless the `ValidationModule` is registered.
    //
    // The accurate render wins wherever it is already usable, though: a placeholder is a truthy string, so
    // substituting one for an optional parameter can send the template down a branch meant for a value the
    // grid never reported (`isUmd` on #200, say).
    const rawText = render(cleanedParams);
    if (rawText && !rawText.includes('undefined')) {
        return { text: rawText, hasPlaceholders: false };
    }

    const withPlaceholders = { ...cleanedParams };
    for (const name of missingParams) {
        withPlaceholders[name] = placeholderFor(name);
    }

    // Neither render is guaranteed to be clean: a heavily parameterised message (#200 builds import
    // statements out of module names) can come back empty once placeholders divert it, leaving the raw
    // text and its `undefined`s as the only candidate. Name what can be named, and fall back to a single
    // anonymous placeholder for the rest — only ever on this path, where a parameter is known to be
    // missing, so a message that legitimately talks about `undefined` is left alone.
    const text = (render(withPlaceholders) || rawText).replaceAll('undefined', UNKNOWN_PLACEHOLDER);

    return { text, hasPlaceholders: true };
}

export function getErrorText({ errorCode, params = {} }: { errorCode: ErrorId; params?: Params }): string {
    return getErrorTextDetails({ errorCode, params }).text;
}
