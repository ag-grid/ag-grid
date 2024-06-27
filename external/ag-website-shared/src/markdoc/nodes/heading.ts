import { type Render, component, nodes } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const heading: Schema<Config, Render> = {
    ...nodes.heading, // Preserve default anchor link generation
    render: component('../../external/ag-website-shared/src/components/heading/Heading.astro'),
};
