import { type Render, component } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const note: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/alert/Note'),
};
