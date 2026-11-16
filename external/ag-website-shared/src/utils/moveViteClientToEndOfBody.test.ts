import { parse } from 'node-html-parser';

import { moveViteClientToEndOfBody } from './moveViteClientToEndOfBody';

const VITE_CLIENT = '<script type="module" src="/@vite/client"></script>';

describe('moveViteClientToEndOfBody', () => {
    it('moves the Vite client after the import map and the entry module', () => {
        const html = parse(
            `<html><head>${VITE_CLIENT}<title>t</title></head>` +
                '<body><script src="/example-runner.js"></script>' +
                '<script type="importmap">{"imports":{}}</script>' +
                '<script type="module" src="/index.js"></script></body></html>'
        );

        moveViteClientToEndOfBody(html);

        const result = html.toString();
        expect(result.match(/@vite\/client/g)).toHaveLength(1);
        expect(result.indexOf('/@vite/client')).toBeGreaterThan(result.indexOf('type="importmap"'));
        expect(result.indexOf('/@vite/client')).toBeGreaterThan(result.indexOf('/index.js'));
        expect(result).toContain(`${VITE_CLIENT}</body>`);
    });

    it('is a no-op without a Vite client', () => {
        const source = '<html><head></head><body><script type="module" src="/index.js"></script></body></html>';
        const html = parse(source);

        moveViteClientToEndOfBody(html);

        expect(html.toString()).toBe(source);
    });

    it('is a no-op without a body', () => {
        const source = `<html><head>${VITE_CLIENT}</head></html>`;
        const html = parse(source);

        moveViteClientToEndOfBody(html);

        expect(html.toString()).toBe(source);
    });
});
