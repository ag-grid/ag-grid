import { Markdoc } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

/**
 * Echoes one of an error link's query parameters into the page's guidance, so a generic explanation
 * reads as advice about the reader's own grid — `{% errorParam name="moduleName" fallback="RowGrouping" /%}`
 * renders the module the reader is actually missing.
 *
 * The parameters live in the URL, so they are only known client-side: the fallback is what the static
 * HTML ships with, and the error page's inline script swaps in the real value (see `[code].astro`).
 * A page must therefore still make sense with every fallback in place, for a reader who arrived without
 * the full query string.
 */
export const errorParam: Schema<Config, Render> = {
    render: 'code',
    attributes: {
        name: { type: String, required: true },
        fallback: { type: String, required: true },
        /**
         * Appended to the parameter's value, for where the message carries part of a longer name — the
         * `moduleName` parameter reads `RowGrouping`, but the module to register is `RowGroupingModule`.
         */
        suffix: { type: String },
    },
    transform(node) {
        const { name, fallback, suffix } = node.attributes;
        const attributes: Record<string, string> = { 'data-error-param': name };

        if (suffix) {
            attributes['data-error-param-suffix'] = suffix;
        }

        return new Markdoc.Tag(this.render as string, attributes, [`${fallback}${suffix ?? ''}`]);
    },
};
