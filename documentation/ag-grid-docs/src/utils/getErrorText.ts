import { throwDevWarning } from '@ag-website-shared/utils/throwDevWarning';

import {
    AG_GRID_ERRORS,
    type ErrorId,
} from '../../../../packages/ag-grid-community/src/validation/errorMessages/errorText';

type Params = Record<string, string>;

function cleanParams(params: Params) {
    return Object.fromEntries(
        Object.entries(params).map(([key, value]) => {
            let cleanParam = value;

            // Clean up serialised strings
            if (cleanParam.startsWith('"') && cleanParam.endsWith('"')) {
                cleanParam = cleanParam.slice(1, cleanParam.length - 1).replaceAll('\\"', '"');
            }

            return [key, cleanParam];
        })
    );
}

export function getErrorText({ errorCode, params = {} }: { errorCode: ErrorId; params?: Params }): string {
    const errorTextFn = AG_GRID_ERRORS[errorCode];

    if (!errorTextFn) {
        throwDevWarning({ message: `Error code #${errorCode} not found` });
    }
    try {
        const textOutput = errorTextFn(cleanParams(params) as any);
        const textOutputArray = typeof textOutput === 'string' ? [textOutput] : textOutput;

        return textOutputArray.filter(Boolean).join('\n');
    } catch (_) {
        // The `errorTextFn` can fail if the function requires params, that
        // don't exist during static render. Just return nothing in these cases
        return '';
    }
}
