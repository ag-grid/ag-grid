import { Markdoc } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

/**
 * Echoes an error link's query parameter into the page's guidance, so generic advice reads as advice
 * about the reader's own grid: `{% errorParam name="moduleName" /%}`.
 *
 * Params are only known client-side, so the static HTML ships the same `<name>` placeholder the
 * message block uses for a param the URL did not carry, and `[code].astro` swaps in the real value.
 * There is deliberately no way to supply a stand-in value: a plausible one reads as the reader's own,
 * which is how #260 came to recommend `RowGroupingModule` to everyone. A page must still read
 * correctly with every placeholder in place.
 */
export const errorParam: Schema<Config, Render> = {
    render: 'code',
    attributes: {
        name: { type: String, required: true },
        /** Appended to the value, where the param is part of a longer name (`RowGrouping` → `RowGroupingModule`). */
        suffix: { type: String },
    },
    transform(node) {
        const { name, suffix } = node.attributes;
        const attributes: Record<string, string> = { 'data-error-param': name };

        if (suffix) {
            attributes['data-error-param-suffix'] = suffix;
        }

        return new Markdoc.Tag(this.render as string, attributes, [`<${name}>${suffix ?? ''}`]);
    },
};
