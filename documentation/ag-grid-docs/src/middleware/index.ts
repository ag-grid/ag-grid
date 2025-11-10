import type { RestrictedBuildPages } from '@ag-grid-types';
import { RESTRICTED_BUILD_PAGES, RESTRICTED_PAGE_PLACEHOLDER_PAGE, RESTRICTED_PAGE_TYPES } from '@constants';
import { getIsProduction } from '@utils/env';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { defineMiddleware } from 'astro/middleware';
import { parse } from 'node-html-parser';
import * as prettier from 'prettier';

const env = import.meta.env;

const rewriteAstroGeneratedContent = (body: string) => {
    const html = parse(body);

    // In dev, add public site url base for all scripts, so it works in external sites
    if (env.DEV) {
        html.querySelectorAll('script').forEach((script: HTMLElement) => {
            const src = script.getAttribute('src');
            if (src != null && src.startsWith(urlWithBaseUrl('/'))) {
                script.setAttribute('src', new URL(src, env.PUBLIC_SITE_URL).toString());
            }
        });
    }
    return html.toString();
};

const BINARY_EXTENSIONS = ['png', 'webp', 'jpeg', 'jpg'];

function isHtml(path: string) {
    const pathItems = path.split('/');
    const fileName = pathItems.slice(-1)[0];
    const isExtension = fileName.includes('.');

    return !isExtension;
}

function isBinary(path: string) {
    const pathItems = path.split('/');
    const fileName = pathItems.slice(-1)[0];
    const fileNameParts = fileName.split('.');
    const extension = fileNameParts.slice(-1)[0];

    return BINARY_EXTENSIONS.includes(extension);
}

function getInvalidRestrictedPageResponse({ pathname, type }: { pathname: string; type: RestrictedBuildPages }) {
    const body = JSON.stringify({
        message: RESTRICTED_PAGE_PLACEHOLDER_PAGE,
        type,
        pathname,
    });
    return new Response(body, { status: 404 });
}

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url;

    if (RESTRICTED_BUILD_PAGES) {
        if (!RESTRICTED_BUILD_PAGES.every((page) => RESTRICTED_PAGE_TYPES.includes(page))) {
            throw new Error(
                `Invalid RESTRICTED_BUILD_PAGES value. Allowed values: ${RESTRICTED_PAGE_TYPES.join(', ')}`
            );
        }

        if (pathname.includes('/examples/')) {
            if (!RESTRICTED_BUILD_PAGES.includes('examples')) {
                return getInvalidRestrictedPageResponse({ pathname, type: 'examples' });
            }
        } else if (pathname.includes('/debug/')) {
            if (!RESTRICTED_BUILD_PAGES.includes('debug')) {
                return getInvalidRestrictedPageResponse({ pathname, type: 'debug' });
            }
        } else if (pathname.includes('/react-data-grid/')) {
            if (!RESTRICTED_BUILD_PAGES.includes('react-data-grid')) {
                return getInvalidRestrictedPageResponse({ pathname, type: 'react-data-grid' });
            }
        } else if (pathname.includes('/angular-data-grid/')) {
            if (!RESTRICTED_BUILD_PAGES.includes('angular-data-grid')) {
                return getInvalidRestrictedPageResponse({ pathname, type: 'angular-data-grid' });
            }
        } else if (pathname.includes('/vue-data-grid/')) {
            if (!RESTRICTED_BUILD_PAGES.includes('vue-data-grid')) {
                return getInvalidRestrictedPageResponse({ pathname, type: 'vue-data-grid' });
            }
        } else if (pathname.includes('/javascript-data-grid/')) {
            if (!RESTRICTED_BUILD_PAGES.includes('javascript-data-grid')) {
                return getInvalidRestrictedPageResponse({ pathname, type: 'javascript-data-grid' });
            }
        } else if (!RESTRICTED_BUILD_PAGES.includes('other')) {
            return getInvalidRestrictedPageResponse({ pathname, type: 'other' });
        }
    }

    const response = (await next()) as Response;

    const isExample = pathname.includes('/examples/');
    if (!isExample || isBinary(pathname)) {
        return response;
    }

    let body = await response.text();

    if (isHtml(pathname)) {
        body = rewriteAstroGeneratedContent(body);

        if (getIsProduction()) {
            try {
                body = await prettier.format(body, {
                    parser: 'html',
                });
            } catch (e) {
                // eslint-disable-next-line no-console
                console.warn(`Unable to prettier format for [${pathname}]`);
            }
        }
        body = body.trim();
        if (!/^<!doctype/i.test(body)) {
            body = '<!doctype html>\n' + body;
        }
    }

    return new Response(body, {
        status: 200,
        headers: response.headers,
    });
});
