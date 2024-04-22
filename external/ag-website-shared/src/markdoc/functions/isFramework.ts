import { type Render, component } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const isFramework: Schema<Config, Render> = {
    transform(parameters, context) {
        const pageFramework = context.variables?.framework;
        return Object.values(parameters).includes(pageFramework);
    },
};
