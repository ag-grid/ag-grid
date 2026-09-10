import { Markdoc } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

/**
 * Echoes an error link's query parameter into the page's guidance, so generic advice reads as advice
 * about the reader's own grid: `{% errorParam name="moduleName" fallback="RowGrouping" /%}`.
 *
 * Params are only known client-side, so `fallback` is what the static HTML ships and `[code].astro`
 * swaps in the real value. A page must still read correctly with every fallback in place.
 */
export const errorParam: Schema<Config, Render> = {
    render: 'code',
    attributes: {
        name: { type: String, required: true },
        fallback: { type: String, required: true },
        /** Appended to the value, where the param is part of a longer name (`RowGrouping` → `RowGroupingModule`). */
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
