/**
 * The Google Tag Manager side of website monitoring.
 *
 * Consent is decided in the shared GTM container rather than on the site: two Custom HTML tags
 * push commands onto the `window.agWebsiteMonitoring` queue, the same pattern as `dataLayer`, so a
 * command sent before the site's monitoring module has loaded is still run.
 *
 *  - Start: consent setting "Require additional consent" for `analytics_storage`, fired on page
 *    view and on the `enzuzo_consent_update` custom event.
 *  - Stop: fired on `enzuzo_consent_update` when the `cookies-analytics` first-party cookie is
 *    `false`.
 *
 * Each tag's HTML must be `<script>` + its script below + `</script>`, with no GTM `{{variables}}`:
 * the site CSP authorises them by hash (cspRules.ts), so any change to the bytes stops them running.
 *
 * Dependency-free, so the build-side CSP can import it.
 */
export const WEBSITE_MONITORING_QUEUE = 'agWebsiteMonitoring';

export type WebsiteMonitoringCommand = 'start' | 'stop';

// Written as GTM minifies Custom HTML, which is what the browser hashes
const getGtmTagScript = (command: WebsiteMonitoringCommand) =>
    `(window.${WEBSITE_MONITORING_QUEUE}=window.${WEBSITE_MONITORING_QUEUE}||[]).push("${command}");`;

export const WEBSITE_MONITORING_GTM_START_SCRIPT = getGtmTagScript('start');
export const WEBSITE_MONITORING_GTM_STOP_SCRIPT = getGtmTagScript('stop');
