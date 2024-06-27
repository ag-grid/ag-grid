import { type Render, component } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const embedSnippet: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/snippet/EmbedSnippet.astro'),
    attributes: {
        /**
         * Source file relative to example folder
         */
        src: { type: String },
        /**
         * Source file url
         */
        url: { type: String },
        language: { type: String },
        lineNumbers: { type: Boolean },
    },
};
