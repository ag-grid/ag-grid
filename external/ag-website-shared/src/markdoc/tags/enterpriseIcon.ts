import { type Render, component } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const enterpriseIcon: Schema<Config, Render> = {
    render: component('../../external/ag-website-shared/src/components/icon/EnterpriseIcon', 'EnterpriseIcon'),
};
