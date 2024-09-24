import { component } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const button: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/button/Button'),
    attributes: {
        buttons: {
            type: Array,
            required: true,
            items: {
                type: Object,
                attributes: {
                    title: { type: String, required: true },
                    desc: { type: String, required: true },
                    link: { type: String, required: true },
                },
            },
        },
    },
};
