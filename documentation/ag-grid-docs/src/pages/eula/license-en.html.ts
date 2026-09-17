import { EULA_PRESENTATIONS } from '@utils/eula/eulaPresentations';
import { renderEulaHtml } from '@utils/eula/renderEulaHtml';

import eulaSource from '../../content/policies/eula.mdoc?raw';

// Served at /eula/license-en.html — the Commercial End User Licence Agreement as a bare HTML
// document with no website layout, for the ecommerce site to embed in an iframe above its "I accept"
// button, so the notice refers to that button. Otherwise rendered from the same sources as
// /eula/commercial/, so the two cannot drift.
export function GET() {
    return new Response(renderEulaHtml(eulaSource, { content: EULA_PRESENTATIONS.checkout, embedded: true }), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
