import {
    reportMonitoringError,
    trackMonitoringEvent,
} from '@ag-website-shared/components/website-monitoring/websiteMonitoring';
import { useCallback, useMemo, useRef } from 'react';
import type { FieldErrors } from 'react-hook-form';

// A submit should have navigated to Salesforce by now. A slow Salesforce response also trips it
const SUBMIT_STALLED_MILLIS = 10_000;

interface SubmitDetails {
    /** Salesforce's captcha `ts`, which stops updating once the captcha is solved */
    captchaTimestamp: string;
    enquiryType?: string;
    isDebug: boolean;
}

/** e.g. 'email:pattern', to tell a rejected address from a missing one */
export function getInvalidFields(fieldErrors: FieldErrors): string {
    return Object.entries(fieldErrors)
        .map(([field, error]) => `${field}:${error?.type}`)
        .join(',');
}

export function getSubmitAttributes(
    { captchaTimestamp, enquiryType, isDebug }: SubmitDetails,
    {
        firstInteractionTime,
        failedAttempts,
        now,
    }: { firstInteractionTime?: number; failedAttempts: number; now: number }
) {
    return {
        // Salesforce checks this, and reCAPTCHA tokens expire, so a long wait can lose the lead
        ...(captchaTimestamp ? { captchaAgeMillis: now - Number(captchaTimestamp) } : {}),
        hasCaptchaTimestamp: captchaTimestamp !== '',
        ...(firstInteractionTime != null ? { timeOnFormMillis: now - firstInteractionTime } : {}),
        failedAttempts,
        isOnline: navigator.onLine,
        ...(enquiryType ? { enquiryType } : {}),
        isDebug,
    };
}

export function watchForStalledSubmit(formLocation: string) {
    const timeoutId = window.setTimeout(() => {
        trackMonitoringEvent(
            'contact_form_submit_stalled',
            { formLocation, waitedMillis: SUBMIT_STALLED_MILLIS, isOnline: navigator.onLine },
            'WARN'
        );
    }, SUBMIT_STALLED_MILLIS);
    // Fired once the browser commits to the Salesforce page
    window.addEventListener('pagehide', () => window.clearTimeout(timeoutId), { once: true });
}

/**
 * Contact form telemetry, sent only while website monitoring is running. It never includes what
 * the visitor typed: field names and error types only.
 */
export function useContactFormMonitoring(formLocation: string) {
    const firstInteractionTime = useRef<number | undefined>(undefined);
    const failedAttempts = useRef(0);

    const onFormInteraction = useCallback(() => {
        firstInteractionTime.current ??= Date.now();
    }, []);

    const trackInvalidSubmit = useCallback(
        (fieldErrors: FieldErrors) => {
            failedAttempts.current++;
            trackMonitoringEvent('contact_form_invalid', {
                formLocation,
                invalidFields: getInvalidFields(fieldErrors),
            });
        },
        [formLocation]
    );

    const trackCaptchaIncomplete = useCallback(
        (isCaptchaRendered: boolean) => {
            failedAttempts.current++;
            // A widget that never rendered points at reCAPTCHA failing, rather than the visitor
            trackMonitoringEvent('contact_form_captcha_incomplete', { formLocation, isCaptchaRendered });
        },
        [formLocation]
    );

    const trackSubmit = useCallback(
        (details: SubmitDetails) => {
            trackMonitoringEvent('contact_form_submit', {
                formLocation,
                ...getSubmitAttributes(details, {
                    firstInteractionTime: firstInteractionTime.current,
                    failedAttempts: failedAttempts.current,
                    now: Date.now(),
                }),
            });
            watchForStalledSubmit(formLocation);
        },
        [formLocation]
    );

    const captchaCallbacks = useMemo(
        () => ({
            'expired-callback': () => trackMonitoringEvent('contact_form_captcha_expired', { formLocation }),
            'error-callback': () =>
                trackMonitoringEvent(
                    'contact_form_captcha_error',
                    { formLocation, isOnline: navigator.onLine },
                    'WARN'
                ),
        }),
        [formLocation]
    );

    const reportCaptchaLoadError = useCallback(
        (error: unknown) => reportMonitoringError(error, { formLocation }),
        [formLocation]
    );

    return {
        onFormInteraction,
        trackInvalidSubmit,
        trackCaptchaIncomplete,
        trackSubmit,
        captchaCallbacks,
        reportCaptchaLoadError,
    };
}
