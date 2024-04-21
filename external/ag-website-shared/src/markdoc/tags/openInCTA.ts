import { type Render, component } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const openInCTA: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/open-in-cta/OpenInCTA.astro'),
    attributes: {
        type: { type: String, required: true },
        href: { type: String, required: true },
        text: { type: String },
    },
};
