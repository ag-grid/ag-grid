import { initCaptcha } from '@ag-website-shared/components/contact-form/initCaptcha';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { CONTACT_FORM_DATA, RECAPTCHA_SITE_KEY } from '@ag-website-shared/constants';
import { SITE_BASE_URL, SITE_URL } from '@constants';
import { getIsDev, getIsProduction } from '@utils/env';
import { pathJoin } from '@utils/pathJoin';
import classnames from 'classnames';
import type { FunctionComponent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import styles from './ContactForm.module.scss';

const { actionUrl, orgId, textAreaId } = getIsProduction() ? CONTACT_FORM_DATA.production : CONTACT_FORM_DATA.default;

const isDev = getIsDev();
const showCaptcha = !isDev;
const returnUrl = pathJoin(SITE_URL, SITE_BASE_URL);

const RECAPTCHA_URL = 'https://www.google.com/recaptcha/api.js';

type FormValues = {
    first_name: string;
    last_name: string;
    email: string;
} & Record<string, string>;

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

export const ContactForm: FunctionComponent = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const [isDebug, setIsDebug] = useState(isDev);

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

        if (showCaptcha) {
            loadRecaptchaScript().then(() => {
                initCaptcha();
            });
        }
    }, []);

    const onValidSubmit = () => {
        formRef.current?.submit();
    };

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
                value={`{"keyname":"agGridCom","fallback":"true","orgId":"${orgId}","ts":""}`}
            />
            <input type="hidden" name="oid" value={orgId} />
            <input type="hidden" name="retURL" value={returnUrl} />

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
                    {errors.first_name && <p className="error">{errors.first_name.message}</p>}
                </div>
                <div className="input-field">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                        id="last_name"
                        type="text"
                        placeholder="Last Name"
                        {...register('last_name', { maxLength: 80 })}
                    />
                </div>
            </div>

            <div className={classnames('input-field', { 'input-error': errors.email })}>
                <label htmlFor="email">Work Email</label>
                <span className={styles.emailInputOuter}>
                    <Icon name="email" />
                    <input
                        id="email"
                        type="email"
                        placeholder="Work Email"
                        {...register('email', {
                            required: 'Email is required',
                            maxLength: 80,
                            pattern: {
                                value: /^(?:[a-zA-Z0-9_'^&/+%!-]+(?:\.[a-zA-Z0-9_'^&/+%!-]+)*|\"(?:[^\"\\]|\\.)+\")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
                                message: 'Enter a valid email',
                            },
                        })}
                    />
                </span>
                {errors.email && <p className="error">{errors.email.message}</p>}
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
                {errors[textAreaId] && <p className="error">{(errors as any)[textAreaId]?.message as string}</p>}
            </div>

            {showCaptcha && <div className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY} />}

            <input
                className={classnames('button-primary', styles.submitButton)}
                type="submit"
                value="Send us a message"
            />
            <a
                className={classnames('button-tertiary', styles.tertiaryButton)}
                href="mailto:info@ag-grid.com"
                role="button"
            >
                or email us at info@ag-grid.com
            </a>
            <p className={styles.privacyMessage}>
                By submitting this form you agree to our <a href="/privacy/">Privacy Policy</a>.
            </p>
        </form>
    );
};
