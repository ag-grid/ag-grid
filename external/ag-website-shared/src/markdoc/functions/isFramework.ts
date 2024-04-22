import type { ConfigFunction } from '@markdoc/markdoc';

export const isFramework: ConfigFunction = {
    transform(parameters, context) {
        const pageFramework = context.variables?.framework;
        return Object.values(parameters).includes(pageFramework);
    },
};
