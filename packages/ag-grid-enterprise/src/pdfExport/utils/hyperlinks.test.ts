import { normaliseHyperlink } from './hyperlinks';

describe('PDF hyperlinks', () => {
    it.each([
        'https://example.com/report',
        'HTTP://example.com/report',
        'mailto:reports@example.com',
        'tel:+441234567890',
    ])('accepts the supported URI %s', (uri) => {
        expect(normaliseHyperlink(uri)).toBe(uri);
    });

    it.each([
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'file:///tmp/report.pdf',
        '/relative/report',
        '#internal-destination',
        '',
        '   ',
    ])('rejects the unsupported URI %s', (uri) => {
        expect(normaliseHyperlink(uri)).toBeUndefined();
    });

    it('rejects missing values', () => {
        expect(normaliseHyperlink(undefined)).toBeUndefined();
        expect(normaliseHyperlink(null)).toBeUndefined();
    });
});
