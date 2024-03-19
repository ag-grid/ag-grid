import { getIsProduction } from '@utils/env';
import { defineMiddleware } from 'astro/middleware';
import * as prettier from 'prettier';

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

export const onRequest = defineMiddleware(async (context, next) => {
    const response = (await next()) as Response;

    const isExample = context.url.pathname.includes('/examples/');
    if (!isExample || isBinary(context.url.pathname)) {
        return response;
    }

    let body = await response.text();

    if (isHtml(context.url.pathname)) {
        if (getIsProduction()) {
            try {
                body = await prettier.format(body, {
                    parser: 'html',
                });
            } catch (e) {
                // eslint-disable-next-line no-console
                console.warn(`Unable to prettier format for [${context.url.pathname}]`);
            }
        }
        body = body.trim();
        if (!/^<!doctype/i.test(body)) {
            body = "<!doctype html>\n" + body;
        }
    }

    return new Response(body, {
        status: 200,
        headers: response.headers,
    });
});
