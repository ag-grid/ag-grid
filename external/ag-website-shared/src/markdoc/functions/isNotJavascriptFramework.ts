import { type Render, component } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const isNotJavascriptFramework: Schema<Config, Render> = {
    transform(_, context) {
        const pageFramework = context.variables?.framework;
        return pageFramework !== 'javascript';
    },
};
