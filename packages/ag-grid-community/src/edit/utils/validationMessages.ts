import type { LocaleTextFunc } from 'ag-stack';

type ValidationMessageFormat = 'announcement' | 'inline';

const SENTENCE_END = /\p{Sentence_Terminal}(?:["']|\p{Pe}|\p{Pf})*$/u;

export const _formatValidationMessages = (
    errorMessages: readonly string[],
    translate: LocaleTextFunc,
    format: ValidationMessageFormat
): string => {
    // Shared by tooltips, native validity text and live announcements.
    const separator = translate('tooltipValidationErrorSeparator', '. ');
    if (format === 'inline') {
        return errorMessages.join(separator);
    }

    const formatted: string[] = [];

    for (let i = 0, len = errorMessages.length; i < len; ++i) {
        const message = errorMessages[i].trim();
        if (message.length > 0) {
            formatted.push(message);
        }
    }

    const trimmedSeparator = separator.trimEnd();
    // A locale separator such as `。` can terminate each sentence; an arbitrary override such as ` / ` cannot.
    if (!SENTENCE_END.test(trimmedSeparator)) {
        const joined = formatted.join(separator);
        return joined.length > 0 && !SENTENCE_END.test(joined) ? `${joined}.` : joined;
    }

    const spacing = separator.slice(trimmedSeparator.length);
    for (let i = 0, len = formatted.length; i < len; ++i) {
        if (!SENTENCE_END.test(formatted[i])) {
            formatted[i] += trimmedSeparator;
        }
    }

    return formatted.join(spacing);
};
