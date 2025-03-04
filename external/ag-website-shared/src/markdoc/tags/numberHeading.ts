import { component } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const numberHeading: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/number-heading/NumberHeading'),
    attributes: {
        number: { type: String, required: true },
    },
};
