import { type Render, component } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const videoSection: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/video-section/VideoSection.astro'),
    attributes: {
        id: { type: String, required: true },
        title: { type: String },
        playlist: { type: String },
        showHeader: { type: Boolean },
    },
};
