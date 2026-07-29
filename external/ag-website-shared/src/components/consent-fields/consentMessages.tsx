import { PRIVACY_POLICY_URL } from '@ag-website-shared/constants';
import type { ReactElement } from 'react';

/**
 * Consent copy shared by every web-to-lead form, so the wording stays identical
 * across the site. See AG-17996.
 */
export const CONSENT_LABELS: Record<string, ReactElement | string> = {
    dataProcessing: (
        <>
            I agree to my data being processed in accordance with the{' '}
            <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">
                Privacy Policy
            </a>
        </>
    ),
    marketingEmail: "I'd like to receive product updates and marketing emails",
    emailTracking: 'I consent to tracking of email opens and clicks',
    /**
     * Temporary stand-in for IP geolocation: email tracking consent only applies to
     * France and Italy, so visitors declare it themselves to reveal that checkbox.
     */
    franceOrItaly: 'I live in France or Italy',
};

export const DATA_PROCESSING_CONSENT_REQUIRED = 'You must agree to the Privacy Policy to continue';
