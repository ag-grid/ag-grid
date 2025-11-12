import { initCaptcha } from '@ag-website-shared/components/contact-form/initCaptcha';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { CONTACT_FORM_DATA, RECAPTCHA_SITE_KEY, RECAPTCHA_URL } from '@ag-website-shared/constants';
import { getIsDev, getIsProduction } from '@utils/env';
import classnames from 'classnames';
import type { FunctionComponent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import styles from './ContactForm.module.scss';
import { RETURN_URLS } from './constants';

const { actionUrl, orgId, textAreaId, leadSource, formLocationId } = getIsProduction()
    ? CONTACT_FORM_DATA.production
    : CONTACT_FORM_DATA.default;

const isDev = getIsDev();

type FormValues = {
    first_name: string;
    last_name: string;
    email: string;
} & Record<string, string>;

interface Props {
    formLocation: 'About page' | 'Grid pricing page' | 'Charts pricing page';
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

export const ContactForm: FunctionComponent<Props> = ({ formLocation = 'About page' }: Props) => {
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
                value={`{"keyname":"agGridComV2","fallback":"true","orgId":"${orgId}","ts":""}`}
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
            <div className={classnames('input-field', { 'input-error': errors[textAreaId] })}>
                <label htmlFor={textAreaId}>Message</label>
                <textarea
                    id={textAreaId}
                    rows={3}
                    wrap="soft"
                    placeholder="Tell us about your interest in AG Grid"
                    {...register(textAreaId as keyof FormValues, { required: 'Message is required' })}
                ></textarea>
                <div className={styles.errorContainer}>
                    {errors[textAreaId] && <p className="error">{(errors as any)[textAreaId]?.message as string}</p>}
                </div>
            </div>

            <div className={classnames('input-field', { 'input-error': captchaError })}>
                <div className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY} />
                <div className={styles.errorContainer}>
                    {captchaError && <p className="error">Please click on the reCAPTCHA checkbox</p>}
                </div>
            </div>

            <input
                className={classnames('button-primary', styles.submitButton, { disabled: isDisabled })}
                type="submit"
                value="Send us a message"
            />
            <p className={styles.privacyMessage}>
                By submitting this form you agree to our <a href="/privacy/">Privacy Policy</a>.
            </p>
        </form>
    );
};
