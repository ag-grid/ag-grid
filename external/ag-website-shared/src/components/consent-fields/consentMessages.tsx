import { PRIVACY_POLICY_URL } from '@ag-website-shared/constants';
import type { ReactElement } from 'react';

/**
 * Consent copy shared by every web-to-lead form, so the wording stays identical
 * across the site. See AG-17996.
 */
export const CONSENT_LABELS: Record<string, string> = {
    marketingEmail:
        "I'd like to receive product updates, news and marketing communications from AG Grid and Bryntum by email. You can unsubscribe at any time.",
    emailTracking: 'I consent to tracking of email opens and clicks',
    /**
     * Temporary stand-in for IP geolocation: email tracking consent only applies to
     * France and Italy, so visitors declare it themselves to reveal that checkbox.
     */
    franceOrItaly: 'I live in France or Italy',
};

/** A statement, not a consent — must never be rendered as a checkbox. */
export const PROCESSING_NOTICE: ReactElement = (
    <>
        By submitting this form, your information will be processed in accordance with our{' '}
        <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">
            Privacy Policy
        </a>
        . We will use it to respond to your enquiry and, where applicable, to manage our commercial relationship with
        you.
    </>
);
