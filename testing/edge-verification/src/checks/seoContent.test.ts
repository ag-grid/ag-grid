import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import type { CheckDef } from '../core/types';
import { FakeAws, FakeHttp, type FakeResponse, fakeCtx, healthyCloudFront } from '../testing/fakes';
import { seoContentChecks } from './seoContent';

const check = (id: string): CheckDef => seoContentChecks().find((c) => c.id === id)!;

async function run(id: string, respond: (url: string) => FakeResponse) {
    const http = new FakeHttp((req) => respond(req.url));
    try {
        return await check(id).run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
    } finally {
        http.close();
    }
}

const html = (body: string): FakeResponse => ({ status: 200, headers: { 'content-type': 'text/html' }, body });
const jsonLd = (node: unknown) => `<script type="application/ld+json">${JSON.stringify(node)}</script>`;

describe('seo-content.h1.charts-home-text', () => {
    // The charts PR's hero (ag-charts#8440): a <noscript> copy and an aria-hidden sizer inside the one H1.
    const PR_HERO =
        '<h1> <noscript>The Best JavaScript Charts in the World</noscript> <span class="only-script">The Best&nbsp;' +
        '<astro-island><span><span aria-hidden="true" class="_sizer">JavaScript</span><span>JavaScript</span></span>' +
        '</astro-island> </span> <span class="only-script">Charts in the World</span> </h1>';

    it('reads the visible hero line once, setting the <noscript> and aria-hidden copies aside', async () => {
        const outcome = await run('seo-content.h1.charts-home-text', () => html(PR_HERO));
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('fails a doubled word in the visible text', async () => {
        const doubled = PR_HERO.replace('aria-hidden="true" ', '');
        const outcome = await run('seo-content.h1.charts-home-text', () => html(doubled));
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /JavaScriptJavaScript|JavaScript JavaScript/);
    });

    it('fails a second H1 outside <noscript>', async () => {
        const outcome = await run('seo-content.h1.charts-home-text', () => html(`${PR_HERO}<h1>Another</h1>`));
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /H1 count/);
    });
});

describe('seo-content.json-ld.faq-visible', () => {
    const faq = (names: string[]) =>
        jsonLd({
            '@type': 'FAQPage',
            mainEntity: names.map((name) => ({ '@type': 'Question', name, acceptedAnswer: { text: 'a' } })),
        });

    it('passes when every question is in the page text, entities decoded', async () => {
        const outcome = await run('seo-content.json-ld.faq-visible', () =>
            html(
                `${faq(["What's AG Grid?", "Isn't it free?", 'Is it free & open?'])}` +
                    '<h3>What&#39;s AG Grid?</h3><h3>Isn&#x27;t it free?</h3><h3>Is it free &amp; open?</h3>'
            )
        );
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('fails a question only the markup carries', async () => {
        const outcome = await run('seo-content.json-ld.faq-visible', () =>
            html(`${faq(['Shown?', 'Hidden?'])}<h3>Shown?</h3>`)
        );
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /"Hidden\?"/);
    });
});

describe('seo-content.json-ld.docs-source-per-framework', () => {
    const page = (url: string, platform: string, about: string) =>
        html(
            jsonLd({ '@type': 'TechArticle', '@id': `${url}#article` }) +
                jsonLd({ '@type': 'SoftwareSourceCode', runtimePlatform: platform, about: { '@id': about } })
        );

    it("passes when each page's examples name its own framework and article", async () => {
        const outcome = await run('seo-content.json-ld.docs-source-per-framework', (url) =>
            page(url, url.includes('/vue-') ? 'Vue' : 'React', `${url}#article`)
        );
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it("fails the Vue page carrying React's examples", async () => {
        const react = 'https://www.ag-grid.com/react-data-grid/getting-started/';
        const outcome = await run('seo-content.json-ld.docs-source-per-framework', (url) =>
            page(url, 'React', `${url.includes('/vue-') ? react : url}#article`)
        );
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /vue-data-grid.*runtimePlatform: got "React", expected "Vue"/);
    });
});

describe('seo-content.json-ld.charts-offers', () => {
    const offers = (list: unknown[]) => html(jsonLd({ '@type': 'SoftwareApplication', offers: list }));

    it('passes the single Community offer', async () => {
        const outcome = await run('seo-content.json-ld.charts-offers', () =>
            offers([{ '@type': 'Offer', name: 'AG Charts Community', price: '0' }])
        );
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('fails a priceless Enterprise offer beside it', async () => {
        const outcome = await run('seo-content.json-ld.charts-offers', () =>
            offers([
                { '@type': 'Offer', name: 'AG Charts Community', price: '0' },
                { '@type': 'Offer', name: 'AG Charts Enterprise' },
            ])
        );
        assert.equal(outcome.status, 'fail', outcome.detail);
    });
});
