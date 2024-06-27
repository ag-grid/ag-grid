import { type Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const br: Schema<Config, Render> = {
    render: 'br',
};
