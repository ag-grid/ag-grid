import { renderMarkdocBlocksHtml } from './renderFAQAnswers';

describe('renderMarkdocBlocksHtml', () => {
    test('keeps every paragraph, without a wrapping article', () => {
        expect(renderMarkdocBlocksHtml('One **bold**.\n\nTwo.', 'react')).toBe(
            '<p>One <strong>bold</strong>.</p><p>Two.</p>'
        );
    });
});
