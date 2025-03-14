import { component } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const majorTable: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/major-table/MajorTable.astro'),
    attributes: {
        library: { type: String, required: true, matches: ['grid', 'charts'] },
        major: { type: Number, required: true },
        type: { type: String, matches: ['migration', 'archive'], default: 'migration' },
    },
};
