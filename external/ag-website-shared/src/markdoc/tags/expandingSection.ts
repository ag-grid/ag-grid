import { component } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const expandingSection: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/expanding-section/ExpandingSection.astro'),
    attributes: {
        headerText: { type: String, required: true },
        isOpen: { type: Boolean },
    },
};
