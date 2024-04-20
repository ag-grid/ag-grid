import { type Render, component } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const warning: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/alert/Warning'),
};
