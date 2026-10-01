import { throwDevWarning } from '@ag-website-shared/utils/throwDevWarning';

import {
    AG_GRID_ERRORS,
    type ErrorId,
} from '../../../../packages/ag-grid-community/src/validation/errorMessages/errorText';

// In production the console carries only the code and a link here, so this page is the only copy of the
// message: a detail the URL did not carry must show as a visible gap, never as `undefined`.

type Params = Record<string, string>;

// Spans the destructuring pattern of `({ a, b: c }: { ... }) => ...`. Safe under minification: a
// destructured key is tied to the object property, so only its local alias after `:` can be renamed.
const DESTRUCTURED_PARAMS_PATTERN = /^\s*\(\s*\{([^}]*)\}/;

/** Reverses the serialisation a param went through to reach the URL (see the grid's `stringifyValue`). */
function cleanErrorParamValue(value: string): unknown {
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

/** One param rendered for display, for the page's `errorParam` swap. */
export function formatErrorParamValue(value: string): string {
    return formatTextPart(cleanErrorParamValue(value));
}

function cleanParams(params: Params) {
    return Object.fromEntries(Object.entries(params).map(([key, value]) => [key, cleanErrorParamValue(value)]));
}

/**
 * Stands in for a parameter the URL did not carry, wrapped so a template that reads `.length` or slices
 * it (#101's `suggestions`) gets array behaviour, while interpolation still yields the bare `<name>`.
 */
function placeholderFor(name: string): unknown {
    return [`<${name}>`];
}

const PLACEHOLDER_PATTERN = /^<[^>]*>$/;

/** Stands in for a missing detail that cannot be traced back to a named parameter. */
const UNKNOWN_PLACEHOLDER = '<unknown>';

/**
 * Some messages are built as arrays carrying values as well as text — the row data #5 could not match,
 * say. Joining them needs the value serialised, or it reads as `[object Object]`.
 */
function formatTextPart(part: unknown): string {
    if (typeof part === 'string') {
        return part;
    }
    // A part that *is* a placeholder shows as itself, not as the array it travels in.
    if (Array.isArray(part) && part.length === 1 && typeof part[0] === 'string' && PLACEHOLDER_PATTERN.test(part[0])) {
        return part[0];
    }
    try {
        return JSON.stringify(part) ?? String(part);
    } catch {
        // Circular, or otherwise not JSON-able.
        return String(part);
    }
}

/** The parameter names an error's text function destructures. */
export function getErrorParamNames(errorCode: ErrorId): string[] {
    const errorTextFn = AG_GRID_ERRORS[errorCode];

    if (!errorTextFn) {
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

export function getMissingErrorParams({ errorCode, params = {} }: { errorCode: ErrorId; params?: Params }): string[] {
    return getErrorParamNames(errorCode).filter((name) => params[name] === undefined);
}

export interface ErrorTextDetails {
    text: string;
    /**
     * Whether a missing detail had to be shown as a placeholder. Asked of the rendered text rather than
     * of the absent params, because optionality is type-level and gone at runtime: #200 declares several
     * params a console link never sends.
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

            return textOutputArray.filter(Boolean).map(formatTextPart).join('\n');
        } catch {
            // A template reading a property off an absent param throws.
            return '';
        }
    };

    const missingParams = getMissingErrorParams({ errorCode, params });
    if (missingParams.length === 0) {
        return { text: render(cleanedParams), hasPlaceholders: false };
    }

    // Prefer the accurate render where it is already usable: a placeholder is truthy, so substituting one
    // for an optional param can divert the template down a branch the grid never reported (#200's `isUmd`).
    const rawText = render(cleanedParams);
    if (rawText && !rawText.includes('undefined')) {
        return { text: rawText, hasPlaceholders: false };
    }

    const withPlaceholders = { ...cleanedParams };
    for (const name of missingParams) {
        withPlaceholders[name] = placeholderFor(name);
    }

    // Placeholders can divert a heavily parameterised message (#200) into rendering nothing, leaving the
    // raw text and its `undefined`s. Scrub those anonymously; only reachable with a param known missing.
    const text = (render(withPlaceholders) || rawText).replaceAll('undefined', UNKNOWN_PLACEHOLDER);

    return { text, hasPlaceholders: true };
}

export function getErrorText({ errorCode, params = {} }: { errorCode: ErrorId; params?: Params }): string {
    return getErrorTextDetails({ errorCode, params }).text;
}
