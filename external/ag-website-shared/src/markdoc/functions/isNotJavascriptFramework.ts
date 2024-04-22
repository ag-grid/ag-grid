import type { Config, ConfigFunction, Schema } from '@markdoc/markdoc';

export const isNotJavascriptFramework: Schema<Config, ConfigFunction> = {
    transform(_, context) {
        const pageFramework = context.variables?.framework;
        return pageFramework !== 'javascript';
    },
};
