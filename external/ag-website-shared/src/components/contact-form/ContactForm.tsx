import { initCaptcha } from '@ag-website-shared/components/contact-form/initCaptcha';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { CONTACT_FORM_DATA, PRIVACY_POLICY_URL, RECAPTCHA_URL, STUDIO_FORM_DATA } from '@ag-website-shared/constants';
import { LIBRARY } from '@constants';
import { getIsDev, getIsProduction } from '@utils/env';
import classnames from 'classnames';
import type { FunctionComponent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import styles from './ContactForm.module.scss';
import { RETURN_URLS } from './constants';

const contactFormData = LIBRARY === 'studio' ? STUDIO_FORM_DATA : CONTACT_FORM_DATA;

const {
    actionUrl,
    orgId,
    textAreaId,
    leadSource,
    messagePlaceholder,
    formLocationId,
    enquiryTypeId,
    captchaSiteKey,
    captchaSettingsKeyName,
} = getIsProduction() ? contactFormData.production : contactFormData.default;

const isDev = getIsDev();

const ENQUIRY_TYPE_OPTIONS = [
    'Sales',
    'Request for Demo',
    'Technical Support',
    'Press/Media',
    'Partnerships',
    'General',
] as const;

type FormValues = {
    first_name: string;
    last_name: string;
    email: string;
} & Record<string, string>;

interface Props {
    formLocation: 'About page' | 'Grid pricing page' | 'Charts pricing page' | 'Contact page';
    hideMessage?: boolean;
    submitLabel?: string;
}

function loadRecaptchaScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if ((window as any).grecaptcha) {
            return resolve();
        }
        const id = 'grecaptcha-script';
        const existing = document.getElementById(id) as HTMLScriptElement | null;
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', reject, { once: true });
            return;
        }
        const s = document.createElement('script');
        s.id = id;
        s.src = RECAPTCHA_URL;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

export const ContactForm: FunctionComponent<Props> = ({
    formLocation = 'About page',
    hideMessage,
    submitLabel,
}: Props) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [isDebug, setIsDebug] = useState(isDev);
    const [returnUrl, setReturnUrl] = useState(RETURN_URLS.success);
    const [isDisabled, setIsDisabled] = useState(false);
    const [captchaError, setCaptchaError] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        mode: 'onBlur',
    });

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const hasDebugFlag = searchParams.has('debug');
        if (hasDebugFlag) {
            const isDebugFlag = searchParams.get('debug') === 'true';
            setIsDebug(isDebugFlag);
        }

        // TODO: Failure handling
        const returnType = searchParams.get('returnType');
        if (returnType === 'failure') {
            setReturnUrl(RETURN_URLS.failure);
        } else {
            // Add page that the form is on
            const urlWithCurrentPath = new URL(RETURN_URLS.success);
            const fromPage = window.location.pathname;
            urlWithCurrentPath.search = new URLSearchParams({ fromPage }).toString();
            setReturnUrl(urlWithCurrentPath.toString());
        }

        loadRecaptchaScript().then(() => {
            initCaptcha();
        });
    }, []);

    const onValidSubmit = useCallback(() => {
        setIsDisabled(true);
        setCaptchaError(false);

        const captchaPassed = (globalThis as any).grecaptcha.getResponse();
        if (captchaPassed) {
            formRef.current?.submit();
        } else {
            setCaptchaError(true);
            setIsDisabled(false);
        }
    }, []);

    return (
        <form
            id="contact-form"
            ref={formRef}
            className={styles.contactForm}
            action={actionUrl}
            method="POST"
            onSubmit={handleSubmit(onValidSubmit)}
            noValidate
        >
            <input
                type="hidden"
                name="captcha_settings"
                value={`{"keyname":"${captchaSettingsKeyName}","fallback":"true","orgId":"${orgId}","ts":""}`}
            />
            <input type="hidden" name="oid" value={orgId} />
            <input type="hidden" name="retURL" value={returnUrl} />
            <input type="hidden" name="lead_source" id="lead_source" value={leadSource} />
            <input type="hidden" name={formLocationId} id={formLocationId} value={formLocation} />
            {isDebug && (
                <>
                    <input type="hidden" name="debug" value={1} />
                    <input type="hidden" name="debugEmail" value="owner@ag-grid.com" />
                </>
            )}
            <div className={styles.nameRow}>
                <div className={classnames('input-field', { 'input-error': errors.first_name })}>
                    <label htmlFor="first_name">First Name</label>
                    <input
                        id="first_name"
                        type="text"
                        placeholder="First Name"
                        {...register('first_name', { required: 'First name is required', maxLength: 40 })}
                    />
                    <div className={styles.errorContainer}>
                        {errors.first_name && <p className="error">{errors.first_name.message}</p>}
                    </div>
                </div>
                <div className="input-field">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                        id="last_name"
                        type="text"
                        placeholder="Last Name"
                        {...register('last_name', { maxLength: 80 })}
                    />
                    <div className={styles.errorContainer}>
                        {errors.last_name && <p className="error">{errors.last_name.message}</p>}
                    </div>
                </div>
            </div>
            <div className="input-field">
                <label htmlFor="company">Company</label>
                <input id="company" type="text" placeholder="Company" {...register('company', { maxLength: 40 })} />
            </div>
            <div className={classnames('input-field', { 'input-error': errors.email })}>
                <label htmlFor="email">Work email</label>
                <span className={styles.emailInputOuter}>
                    <Icon name="email" />
                    <input
                        id="email"
                        type="email"
                        placeholder="Work email"
                        {...register('email', {
                            required: 'Email is required',
                            maxLength: 80,
                            pattern: {
                                value: /^(?:[a-zA-Z0-9_'^&/+%!-]+(?:\.[a-zA-Z0-9_'^&/+%!-]+)*|"(?:[^"\\]|\\.)+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
                                message: 'Enter a valid email',
                            },
                        })}
                    />
                </span>
                <div className={styles.errorContainer}>
                    {errors.email && <p className="error">{errors.email.message}</p>}
                </div>
            </div>
            {enquiryTypeId && (
                <div className={classnames('input-field', { 'input-error': errors[enquiryTypeId] })}>
                    <label htmlFor={enquiryTypeId}>Enquiry Type</label>
                    <select
                        id={enquiryTypeId}
                        defaultValue="Sales"
                        {...register(enquiryTypeId, { required: 'Enquiry type is required' })}
                    >
                        {ENQUIRY_TYPE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <div className={styles.errorContainer}>
                        {errors[enquiryTypeId] && (
                            <p className="error">{(errors as any)[enquiryTypeId]?.message as string}</p>
                        )}
                    </div>
                </div>
            )}

            {!hideMessage && (
                <div className={classnames('input-field', { 'input-error': errors[textAreaId] })}>
                    <label htmlFor={textAreaId}>Message</label>
                    <textarea
                        id={textAreaId}
                        rows={3}
                        wrap="soft"
                        placeholder={messagePlaceholder}
                        {...register(textAreaId as keyof FormValues, {
                            required: !hideMessage && 'Message is required',
                        })}
                    ></textarea>
                    <div className={styles.errorContainer}>
                        {errors[textAreaId] && (
                            <p className="error">{(errors as any)[textAreaId]?.message as string}</p>
                        )}
                    </div>
                </div>
            )}
            <div className={classnames('input-field', { 'input-error': captchaError })}>
                <div className="g-recaptcha" data-sitekey={captchaSiteKey} />
                <div className={styles.errorContainer}>
                    {captchaError && <p className="error">Please click on the reCAPTCHA checkbox</p>}
                </div>
            </div>
            <input
                id="submit-contact-form"
                className={classnames('button-primary', styles.submitButton, { disabled: isDisabled })}
                type="submit"
                value={submitLabel || 'Send us a message'}
            />
            <p className={styles.privacyMessage}>
                By submitting this form you agree to our <a href={PRIVACY_POLICY_URL}>Privacy Policy</a>.
            </p>
            <p>
                For technical support, visit our{' '}
                <a
                    href="https://ag-grid.zendesk.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.supportLink}
                >
                    Zendesk portal
                </a>
            </p>
        </form>
    );
};
