import type { Config, ConfigFunction, Schema } from '@markdoc/markdoc';

export const isFramework: Schema<Config, ConfigFunction> = {
    transform(parameters, context) {
        const pageFramework = context.variables?.framework;
        return Object.values(parameters).includes(pageFramework);
    },
};
