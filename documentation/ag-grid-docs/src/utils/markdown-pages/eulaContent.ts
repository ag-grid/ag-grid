import type { PolicyContent } from '@ag-website-shared/components/policies/policyContent';

/**
 * The introductory notice above the clauses. `acceptance` is the act by which the Licensee accepts
 * the Terms: using the software on the page and in the package, clicking the button beneath the
 * ecommerce checkout's iframe.
 */
function eulaIntro(acceptance: string): string[] {
    return [
        '<strong>PLEASE READ THESE LICENCE TERMS (v40) CAREFULLY BEFORE DOWNLOADING ANY SOFTWARE:</strong>',
        'These terms and conditions and schedules (“<strong>Terms</strong>”) are entered into between AG GRID LTD (registered company number 07318192) (“<strong>Licensor</strong>”) and the entity whose details are set out on the Quote or otherwise submitted to the Licensor (“<strong>Licensee</strong>”) effective as of the date of acceptance of these Terms (“<strong>Effective Date</strong>”).',
        `<strong>${acceptance}, YOU CONFIRM THAT YOU ACCEPT AND AGREE TO BE BOUND BY THESE TERMS AND ACKNOWLEDGE THAT THEY CONSTITUTE A LEGALLY BINDING CONTRACT BETWEEN US AND YOU.</strong>`,
        '<strong>IF YOU ARE ACTING ON BEHALF OF ANY ORGANISATION, YOU CONFIRM THAT YOU HAVE THE REQUISITE AUTHORITY, POWER AND RIGHT TO FULLY BIND THAT ORGANISATION.</strong>',
        '<strong>IF YOU DO NOT AGREE TO THE TERMS OF THIS LICENCE, DO NOT USE THE SOFTWARE.</strong>',
    ];
}

/**
 * Prose for the End User Licence Agreement page that lives outside its `.mdoc` body — the
 * heading, the version and last-updated lines and the introductory notice. Shared with the
 * `/eula/commercial.md` twin so the two cannot drift. The numbered clauses and schedules are
 * `src/content/policies/eula.mdoc`.
 *
 * Grid-only, like the Terms of Use: the agreement is published from ag-grid.com.
 */
export const EULA_CONTENT: PolicyContent = {
    heading: 'AG Grid Commercial End User Licence Agreement',
    metaTitle: 'Commercial End User Licence Agreement',
    description:
        'The licence terms and conditions under which AG Grid Ltd licenses AG Grid Enterprise software, documentation and support services to its customers.',
    meta: ['Version: 40', 'Last Updated: 9 September 2026'],
    intro: eulaIntro('BY USING OUR SOFTWARE'),
};

/**
 * The same agreement as presented in the ecommerce checkout at `/eula/license-en.html`, where the
 * customer accepts it by clicking a button beneath the iframe rather than by using the software.
 */
export const EULA_CLICKWRAP_CONTENT: PolicyContent = {
    ...EULA_CONTENT,
    intro: eulaIntro('BY CLICKING ON THE “I ACCEPT” BUTTON BELOW'),
};
