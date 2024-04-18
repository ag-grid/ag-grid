import { DOCS_TAB_ITEM_ID_PREFIX } from '@ag-website-shared/constants';
import { type Render, component } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const tabs: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/tabs/TabsWithHtmlChildren.astro'),
    attributes: {
        omitFromOverview: { type: Boolean, default: false },
        tabItemIdPrefix: {
            type: String,
            default: DOCS_TAB_ITEM_ID_PREFIX,
        },
        headerLinks: {
            type: Array,
        },
    },
};

export const tabItem: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/tabs/TabHtmlContent', 'TabHtmlContent'),
    attributes: {
        id: { type: String, required: true },
        label: { type: String },
    },
};
