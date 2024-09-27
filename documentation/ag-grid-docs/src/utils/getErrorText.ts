import { throwDevWarning } from '@ag-website-shared/utils/throwDevWarning';

import { ERRORS, type ErrorCode } from 'ag-grid-community';

export function getErrorText({
    errorCode,
    params = {},
}: {
    errorCode: ErrorCode;
    params?: Record<string, string>;
}): string {
    const errorTextFn = ERRORS[errorCode];

    if (!errorTextFn) {
        throwDevWarning({ message: `Error code #${errorCode} not found` });
    }

    const textOutput = errorTextFn(params);
    const textOutputArray = typeof textOutput === 'string' ? [textOutput] : textOutput;

    return textOutputArray.filter(Boolean).join('\n');
}
