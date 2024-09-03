import { component } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const imageCaption: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/imageCaption/ImageCaption.astro'),
    attributes: {
        /**
         * Docs page name in `src/content/[pageName]
         *
         * If not provided, will default to the location of the markdoc file
         */
        pageName: { type: String },
        /**
         * Relative path within markdoc page folder
         */
        imagePath: { type: String, required: true },
        alt: { type: String, required: true },
        centered: { type: Boolean },
        constrained: { type: Boolean },
        descriptionTop: { type: Boolean },
        width: { type: String },
        height: { type: String },
        minWidth: { type: String },
        maxWidth: { type: String },
        /**
         * Enable dark mode CSS filter for image
         *
         * Alternatively, add `-dark` suffixed image in `imagePath` to add
         * dark mode image manually
         */
        enableDarkModeFilter: { type: Boolean },
    },
};
