import { ConsentCheckbox } from '@ag-website-shared/components/consent-fields/ConsentCheckbox';
import { ProcessingNotice } from '@ag-website-shared/components/consent-fields/ProcessingNotice';
import { CONSENT_LABELS } from '@ag-website-shared/components/consent-fields/consentMessages';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { TRIAL_LICENCE_FORM_URL, ZI_FORM_ID } from '@constants';
import { trackTrialLicenseFormError, trackTrialLicenseFormSuccess } from '@utils/analytics';
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
    const emailPattern = /^([a-zA-Z0-9._-]|\+)+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;
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

function useCheckbox(initialValue: boolean = false) {
    const [checked, setChecked] = useState<boolean>(initialValue);

    const handleCheckedChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setChecked(e.target.checked);
    }, []);

    return {
        checked,
        setChecked,
        handleCheckedChange,
    };
}

async function submitTrialLicenceFormData({
    submitUrl = TRIAL_LICENCE_FORM_URL,
    firstName,
    lastName,
    email,
    company,
    marketingEmailConsent,
    emailTrackingConsent,
    franceOrItaly,
}: {
    submitUrl?: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    marketingEmailConsent: boolean;
    emailTrackingConsent: boolean;
    franceOrItaly: boolean;
}) {
    const response = await fetch(submitUrl, {
        method: 'POST',
        body: JSON.stringify({
            data: {
                firstName,
                lastName,
                email,
                company,
                marketingEmailConsent,
                emailTrackingConsent,
                franceOrItaly,
            },
        }),
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

    const { checked: marketingEmailConsent, handleCheckedChange: handleMarketingEmailConsentChange } = useCheckbox();

    const {
        checked: emailTrackingConsent,
        setChecked: setEmailTrackingConsent,
        handleCheckedChange: handleEmailTrackingConsentChange,
    } = useCheckbox();

    const { checked: isFranceOrItaly, setChecked: setIsFranceOrItaly } = useCheckbox();

    // Email tracking consent only applies to France and Italy, so hiding it must also
    // withdraw it — never submit a consent the visitor can no longer see
    const handleFranceOrItalyChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        const { checked } = e.target;
        setIsFranceOrItaly(checked);
        if (!checked) {
            setEmailTrackingConsent(false);
        }
    }, []);

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
                const company = (document.getElementById('company') as HTMLInputElement)?.value || '';
                const response = await submitTrialLicenceFormData({
                    submitUrl,
                    firstName,
                    lastName,
                    email,
                    company,
                    marketingEmailConsent,
                    emailTrackingConsent,
                    franceOrItaly: isFranceOrItaly,
                });

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
        [
            submitUrl,
            validatedEmailError,
            validatedFirstNameError,
            validatedLastNameError,
            firstName,
            lastName,
            email,
            marketingEmailConsent,
            emailTrackingConsent,
            isFranceOrItaly,
        ]
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
        marketingEmailConsent,
        handleMarketingEmailConsentChange,
        emailTrackingConsent,
        handleEmailTrackingConsentChange,
        isFranceOrItaly,
        handleFranceOrItalyChange,
        handleFormSubmit,
    };
}

export const TrialLicenceFormStudio: FunctionComponent<Props> = ({ submitUrl }: Props) => {
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
        marketingEmailConsent,
        handleMarketingEmailConsentChange,
        emailTrackingConsent,
        handleEmailTrackingConsentChange,
        isFranceOrItaly,
        handleFranceOrItalyChange,
        handleFormSubmit,
    } = useTrialForm({ submitUrl });
    const hasFormError = Boolean(emailError || firstNameError || lastNameError);

    return (
        <form id={ZI_FORM_ID} noValidate className={styles.trialForm} onSubmit={handleFormSubmit}>
            <div className={styles.inputs}>
                <input placeholder="Company" type="hidden" id="company" name="company" />

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

                    <p className="error">First name required</p>
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

                    <p className="error">Last name required</p>
                </div>
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
                <p className="error">{emailError ? emailError : 'Email required'}</p>
            </div>

            <div className={styles.consents}>
                <ConsentCheckbox
                    id="marketing-email-consent"
                    label={CONSENT_LABELS.marketingEmail}
                    inputProps={{
                        name: 'marketing-email-consent',
                        checked: marketingEmailConsent,
                        onChange: handleMarketingEmailConsentChange,
                    }}
                />

                <ConsentCheckbox
                    id="france-or-italy"
                    label={CONSENT_LABELS.franceOrItaly}
                    inputProps={{
                        name: 'france-or-italy',
                        checked: isFranceOrItaly,
                        onChange: handleFranceOrItalyChange,
                    }}
                />

                {isFranceOrItaly && (
                    <ConsentCheckbox
                        id="email-tracking-consent"
                        label={CONSENT_LABELS.emailTracking}
                        nested
                        inputProps={{
                            name: 'email-tracking-consent',
                            checked: emailTrackingConsent,
                            onChange: handleEmailTrackingConsentChange,
                        }}
                    />
                )}
            </div>

            <ProcessingNotice />

            <div className={classnames(styles.actions, 'trial-licence-actions')}>
                <button
                    id="submit-trial-licence"
                    className={styles.submit}
                    type="submit"
                    disabled={hasFormError || formState === 'loading' || formState === 'success'}
                    aria-busy={formState === 'loading'}
                >
                    {formState === 'loading' && <span className={styles.submitSpinner} aria-hidden="true" />}
                    Start a free trial
                </button>

                {formState === 'success' && (
                    <p className={styles.statusMessage}>
                        <Icon name="tick" svgClasses={styles.statusIconSuccess} />
                        <span>
                            Thank you. Please check your inbox to validate your email and receive your <b>AG Studio</b>{' '}
                            trial licence.
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
