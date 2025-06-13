import { Icon } from '@ag-website-shared/components/icon/Icon';
import { TRIAL_LICENCE_FORM_URL } from '@constants';
import { trackTrialLicenseFormError, trackTrialLicenseFormSuccess } from '@utils/analytics';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classnames from 'classnames';
import { useCallback, useState } from 'react';
import type { ChangeEventHandler, FormEventHandler, FunctionComponent } from 'react';

import { MESSAGES } from './Messages';
import styles from './TrialLicenceForm.module.scss';

interface Props {
    submitUrl?: string;
}

type TrialFormState = 'success' | 'error' | 'loading' | 'idle';

const getFormErrorMessage = (message: string) => {
    let errorMessage = MESSAGES.formErrorDefault;

    if (message === 'invalid arguments provided') {
        errorMessage = MESSAGES.formErrorInvalidArguments;
    } else if (message.includes('INVALID_EMAIL_ADDRESS')) {
        // eg, "Error: Unable to create a lead for a trial LK for email @bc.com. Error: Insert failed. First exception on row 0; first error: INVALID_EMAIL_ADDRESS, Email: invalid email address: @bc.com: [Email]"
        errorMessage = MESSAGES.formErrorInvalidEmail;
    } else if (message.includes('Duplicate email')) {
        // eg, "Error: Unable to create a lead for a trial LK for email something@somewhere.com. Error: Duplicate email"
        errorMessage = MESSAGES.formErrorDuplicateEmail;
    }

    return errorMessage;
};

const isEmailValid = (email: string) => {
    const emailPattern = /^([a-zA-Z0-9._-]|\+)+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
};

const validateEmail = (email: string) => {
    let validation = '';

    if (!email) {
        validation = MESSAGES.validationEmailRequired;
    } else if (!isEmailValid(email)) {
        validation = MESSAGES.validationEmailInvalid;
    }

    return validation;
};

const validateRequired = (value: string) => {
    let validation = '';
    if (value === '') {
        validation = MESSAGES.validationRequiredField;
    }

    return validation;
};

function useEmailValidation(initialValue: string = '') {
    const [email, setEmail] = useState<string>(initialValue);
    const [emailError, setEmailError] = useState<string>(validateEmail(initialValue));

    const handleEmailChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        const value = e.target?.value;
        setEmail(value);
        setEmailError(validateEmail(value));
    }, []);

    return {
        emailError,
        email,
        handleEmailChange,
    };
}

function useRequiredValidation(initialValue: string = '') {
    const [value, setValue] = useState<string>(initialValue);
    const [valueError, setValueError] = useState<string>(validateRequired(initialValue));

    const handleValueChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        const value = e.target?.value;
        setValue(value);
        setValueError(validateRequired(value));
    }, []);

    return {
        valueError,
        value,
        handleValueChange,
    };
}

async function submitTrialLicenceFormData({
    submitUrl = TRIAL_LICENCE_FORM_URL,
    firstName,
    lastName,
    email,
}: {
    submitUrl?: string;
    firstName: string;
    lastName: string;
    email: string;
}) {
    const response = await fetch(submitUrl, {
        method: 'POST',
        body: JSON.stringify({ data: { firstName, lastName, email } }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const json = await response.json();

    return json;
}

function useTrialForm({ submitUrl }: Props) {
    const [formState, setFormState] = useState<TrialFormState>('idle');
    const [formError, setFormError] = useState<string>('');
    const [wasValidated, setWasValidated] = useState<boolean>(false);
    const { emailError: validatedEmailError, email, handleEmailChange } = useEmailValidation();
    const emailError = wasValidated && validatedEmailError ? validatedEmailError : '';

    const {
        value: firstName,
        valueError: validatedFirstNameError,
        handleValueChange: handleFirstNameChange,
    } = useRequiredValidation();
    const firstNameError = wasValidated && validatedFirstNameError ? validatedFirstNameError : '';

    const {
        value: lastName,
        valueError: validatedLastNameError,
        handleValueChange: handleLastNameChange,
    } = useRequiredValidation();
    const lastNameError = wasValidated && validatedLastNameError ? validatedLastNameError : '';

    const handleFormSubmit: FormEventHandler<HTMLFormElement> = useCallback(
        async (e) => {
            e.preventDefault();
            setWasValidated(true);

            if (validatedEmailError || validatedFirstNameError || validatedLastNameError) {
                setFormState('error');
                return;
            }

            setFormError('');
            setFormState('loading');

            const currentPage = window.location.pathname;

            try {
                const response = await submitTrialLicenceFormData({ submitUrl, firstName, lastName, email });

                if (response.error) {
                    setFormState('error');
                    const errorMessage = getFormErrorMessage(response.error.message);
                    setFormError(errorMessage);
                    trackTrialLicenseFormError({
                        error: response.error.message,
                        errorType: 'api_error',
                        page: currentPage,
                    });
                } else {
                    setFormState('success');
                    trackTrialLicenseFormSuccess({
                        page: currentPage,
                    });
                }
            } catch (e) {
                console.error(e);
                const errorMessage = MESSAGES.formErrorDefault;
                setFormError(errorMessage);
                trackTrialLicenseFormError({
                    error: e instanceof Error ? e.message : 'Unknown error',
                    errorType: 'system_error',
                    page: currentPage,
                });
                setFormState('error');
            }
        },
        [validatedEmailError, validatedFirstNameError, validatedLastNameError, firstName, lastName, email]
    );

    return {
        formState,
        formError,
        emailError,
        email,
        handleEmailChange,
        firstName,
        firstNameError,
        handleFirstNameChange,
        lastName,
        lastNameError,
        handleLastNameChange,
        handleFormSubmit,
    };
}

export const TrialLicenceForm: FunctionComponent = ({ submitUrl }: Props) => {
    const {
        formState,
        formError,
        emailError,
        email,
        handleEmailChange,
        firstName,
        firstNameError,
        handleFirstNameChange,
        lastName,
        lastNameError,
        handleLastNameChange,
        handleFormSubmit,
    } = useTrialForm({ submitUrl });
    const hasFormError = Boolean(emailError || firstNameError || lastNameError);

    return (
        <form noValidate className={styles.trialForm} onSubmit={handleFormSubmit}>
            <div className={styles.inputs}>
                <div className={classnames('input-field', { 'input-error': firstNameError })}>
                    <label htmlFor="first-name">First Name</label>
                    <input
                        placeholder="First Name"
                        type="text"
                        id="first-name"
                        name="first-name"
                        value={firstName}
                        onChange={handleFirstNameChange}
                        required
                    />

                    <p
                        className={classnames(
                            {
                                [styles.isHidden]: !firstNameError,
                            },
                            'error'
                        )}
                    >
                        First name required
                    </p>
                </div>

                <div className={classnames('input-field', { 'input-error': lastNameError })}>
                    <label htmlFor="last-name">Last Name</label>
                    <input
                        placeholder="Last Name"
                        type="text"
                        id="last-name"
                        name="last-name"
                        value={lastName}
                        onChange={handleLastNameChange}
                        required
                    />

                    <p className={classnames({ [styles.isHidden]: !firstNameError }, 'error')}>Last name required</p>
                </div>

                <div className={classnames('input-field', styles.emailField, { 'input-error': emailError })}>
                    <label htmlFor="email">Email</label>
                    <span className={styles.emailInputOuter}>
                        <Icon name="email" />
                        <input
                            placeholder="Email"
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={email}
                            onChange={handleEmailChange}
                        />
                    </span>
                    <p className={classnames({ [styles.isHidden]: !emailError }, 'error')}>
                        {emailError ? emailError : 'Email required'}
                    </p>
                </div>
            </div>

            <div className={classnames(styles.actions, 'trial-licence-actions')}>
                <button
                    className={styles.submit}
                    type="submit"
                    disabled={hasFormError || formState === 'loading' || formState === 'success'}
                >
                    Request a trial licence
                </button>

                <p className={styles.privacyMessage}>
                    By clicking "Request trial licence" you agree to our{' '}
                    <a href={urlWithBaseUrl('/privacy/')}>Privacy Policy</a>.
                </p>

                {formState === 'success' && (
                    <p className={styles.statusMessage}>
                        <Icon name="tick" svgClasses={styles.statusIconSuccess} />
                        <span>
                            Thank you. Please check your inbox to validate your email and receive your{' '}
                            <b>Enterprise Bundle</b> trial licence.
                        </span>
                    </p>
                )}

                {formError && (
                    <p className={classnames(styles.statusMessage, styles.errorMessage)}>
                        <Icon name="warning" svgClasses={styles.statusIconError} />
                        <span>{formError}</span>
                    </p>
                )}
            </div>
        </form>
    );
};
