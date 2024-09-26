import { throwDevWarning } from '@ag-website-shared/utils/throwDevWarning';

import {
    AG_GRID_ERRORS,
    type ErrorId,
} from '../../../../packages/ag-grid-community/src/validation/errorMessages/errorText';

export function getErrorText({
    errorCode,
    params = {},
}: {
    errorCode: ErrorId;
    params?: Record<string, string>;
}): string {
    const errorTextFn = AG_GRID_ERRORS[errorCode];

    if (!errorTextFn) {
        throwDevWarning({ message: `Error code #${errorCode} not found` });
    }

    const textOutput = errorTextFn(params);
    const textOutputArray = typeof textOutput === 'string' ? [textOutput] : textOutput;

    return textOutputArray.filter(Boolean).join('\n');
}
