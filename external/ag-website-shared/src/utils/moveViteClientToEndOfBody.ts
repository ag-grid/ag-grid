import type { HTMLElement } from 'node-html-parser';

/**
 * Moves Vite's dev client from the start of `<head>`, where Astro's dev server injects it, to the end of `<body>`.
 *
 * Firefox ignores an import map registered after any module script has started loading, so with the client first,
 * every bare specifier in the example fails to resolve. Placing it last keeps it after the example's import map,
 * wherever the template renders that.
 */
export function moveViteClientToEndOfBody(html: HTMLElement) {
    const viteClient = html.querySelector('script[src*="/@vite/client"]');
    const body = html.querySelector('body');
    if (viteClient && body) {
        body.appendChild(viteClient.remove());
    }
}
