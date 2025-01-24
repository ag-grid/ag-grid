import { AG_GRID_ERRORS } from './errorText';

describe('Validate AG_GRID_ERRORS', () => {
    // eslint-disable-next-line no-restricted-properties
    test.each(Object.entries(AG_GRID_ERRORS))(
        'Calling with no params should not throw for Astro generation: ErrorKey=%i',
        (key, errorTextFn) => {
            errorTextFn({} as any);
        }
    );
});
