import type { PolicyContent } from '@ag-website-shared/components/policies/policyContent';

import eula from '../../content/policies/eula.json';

/**
 * The Commercial End User Licence Agreement is presented in two places, and the Licensee accepts
 * it differently in each: by using the software (the `/eula/commercial/` page, its `.md` twin and
 * the package `LICENSE.html`) or by clicking the button beneath the ecommerce checkout's iframe
 * (`/eula/license-en.html`). The wording of each is content, kept in `policies/eula.json` beside
 * the agreement's clauses in `policies/eula.mdoc` so the two are updated together; this module
 * only substitutes it into the notice.
 */
export type EulaPresentation = keyof typeof eula.presentations;

const PLACEHOLDERS = ['acceptance', 'refusal'] as const;

function substitute(paragraph: string, presentation: EulaPresentation): string {
    return PLACEHOLDERS.reduce(
        (text, placeholder) => text.replaceAll(`{${placeholder}}`, eula.presentations[presentation][placeholder]),
        paragraph
    );
}

function eulaContent(presentation: EulaPresentation): PolicyContent {
    const { heading, metaTitle, description, meta, intro } = eula;
    return { heading, metaTitle, description, meta, intro: intro.map((line) => substitute(line, presentation)) };
}

/** The preamble (heading, version lines and notice) for every presentation of the agreement. */
export const EULA_PRESENTATIONS = Object.fromEntries(
    (Object.keys(eula.presentations) as EulaPresentation[]).map((presentation) => [
        presentation,
        eulaContent(presentation),
    ])
) as Record<EulaPresentation, PolicyContent>;

/** The agreement as accepted by using the software: the page, its twin and the package licence. */
export const EULA_CONTENT = EULA_PRESENTATIONS.software;
