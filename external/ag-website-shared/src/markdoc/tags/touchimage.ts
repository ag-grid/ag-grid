import { component } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const touchImage: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/touch-image/TouchImage.astro'),
    attributes: {
        title: { type: String },
        playlist: { type: String },
        videoPath: { type: String },
        description: { type: String },
    },
};
