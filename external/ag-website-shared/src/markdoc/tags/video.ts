import { component } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const video: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/video/Video.astro'),
    attributes: {
        videoSrc: { type: String },
        autoplay: { type: Boolean },
        showPlayPauseButtons: { type: Boolean },
        centered: { type: Boolean },
    },
};
