import { linkifyUrls } from './linkifyUrls';

const link = (url: string) => `<a class="link" target="_blank" href="${url}">${url}</a>`;

describe('linkifyUrls', () => {
    it('links a bare URL', () => {
        expect(linkifyUrls('See https://example.com/page for details', 'link')).toBe(
            `See ${link('https://example.com/page')} for details`
        );
    });

    it('stops a bare URL at a following tag', () => {
        expect(linkifyUrls('<strong>Link:</strong><br> https://example.com/page<br><br>', 'link')).toBe(
            `<strong>Link:</strong><br> ${link('https://example.com/page')}<br><br>`
        );
    });

    it('links every bare URL in the text', () => {
        expect(linkifyUrls('https://a.example.com and https://b.example.com', 'link')).toBe(
            `${link('https://a.example.com')} and ${link('https://b.example.com')}`
        );
    });

    it('leaves a URL that is already inside an anchor alone', () => {
        const html =
            'Workaround: <a href="https://plnkr.co/edit/abc?open=main.js&amp;preview">https://plnkr.co/edit/abc</a>';

        expect(linkifyUrls(html, 'link')).toBe(html);
    });

    it('leaves URLs in other tag attributes alone', () => {
        const html = '<img src="https://example.com/image.png"> then https://example.com/page';

        expect(linkifyUrls(html, 'link')).toBe(
            `<img src="https://example.com/image.png"> then ${link('https://example.com/page')}`
        );
    });

    it('links a bare URL that follows an existing anchor', () => {
        expect(linkifyUrls('<a href="https://a.example.com">a</a> https://b.example.com', 'link')).toBe(
            `<a href="https://a.example.com">a</a> ${link('https://b.example.com')}`
        );
    });
});
