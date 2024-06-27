import { type Render, component } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const image: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/image/Image.astro'),
    attributes: {
        /**
         * Docs page name in `src/content/[pageName]
         *
         * If not provided, will default to the location of the markdoc file
         */
        pageName: { type: String },
        imagePath: { type: String, required: true },
        alt: { type: String, required: true },
        width: { type: String },
        height: { type: String },
        minWidth: { type: String },
        maxWidth: { type: String },
        margin: { type: String },
    },
};
