import { throwDevWarning } from '@ag-website-shared/utils/throwDevWarning';

import {
    AG_GRID_ERRORS,
    type ErrorId,
} from '../../../../packages/ag-grid-community/src/validation/errorMessages/errorText';

type Params = Record<string, string>;

function cleanParams(params: Params) {
    return Object.fromEntries(
        Object.entries(params).map(([key, value]) => {
            let cleanParam: unknown = value;

            if (value.startsWith('[') || value.startsWith('{')) {
                // Reconstruct arrays/objects that were serialised as JSON (see stringifyValue)
                try {
                    cleanParam = JSON.parse(value);
                } catch {
                    cleanParam = value;
                }
            } else if (value.startsWith('"') && value.endsWith('"')) {
                // Clean up serialised strings
                cleanParam = value.slice(1, value.length - 1).replaceAll('\\"', '"');
            } else if (value === 'false') {
                // Ensure false is correctly handled as a boolean
                cleanParam = false;
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
    } catch {
        // The `errorTextFn` can fail if the function requires params, that
        // don't exist during static render. Just return nothing in these cases
        return '';
    }
}
