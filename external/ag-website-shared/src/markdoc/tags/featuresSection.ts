import { component } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const featuresSection: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/features-section/DocsFeaturesSection'),
    attributes: {
        type: { type: String, required: true },
    },
};
