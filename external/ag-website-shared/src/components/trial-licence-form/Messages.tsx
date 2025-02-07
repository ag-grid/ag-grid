import { type ReactElement } from 'react';

export const MESSAGES: Record<string, string | ReactElement> = {
    validationEmailRequired: 'Email is required',
    validationEmailInvalid: 'Invalid email format',
    validationRequiredField: 'Required field',

    formErrorDefault: (
        <>
            An error occurred while submitting the form.
            <br />
            Please contact us at <a href="mailto:info@ag-grid.com">info@ag-grid.com</a> to request a trial licence
            directly.
        </>
    ),
    formErrorInvalidArguments: (
        <>
            Invalid form fields provided.
            <br />
            If you believe this is an error please contact us at <a href="mailto:info@ag-grid.com">
                info@ag-grid.com
            </a>{' '}
            to request a trial licence directly.
        </>
    ),
    formErrorInvalidEmail: (
        <>
            Invalid email address.
            <br />
            If you believe this is an error please contact us at <a href="mailto:info@ag-grid.com">
                info@ag-grid.com
            </a>{' '}
            to request a trial licence directly.
        </>
    ),
    formErrorDuplicateEmail: (
        <>
            Email address already used.
            <br />
            If you believe this is an error please contact us at <a href="mailto:info@ag-grid.com">
                info@ag-grid.com
            </a>{' '}
            to request a trial licence directly.
        </>
    ),
};
