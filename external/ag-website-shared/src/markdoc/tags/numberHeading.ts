import { component } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const numberHeading: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/number-heading/NumberHeading.astro'),
    attributes: {
        number: { type: String, required: true },
        title: { type: String, required: true },
        level: {
            type: String,
            matches: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            default: 'h2',
        },

        // Add number heading to the side nav
        __numberHeading: {
            type: Object,
            default: true,
        },
    },
};
