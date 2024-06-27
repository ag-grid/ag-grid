import type { ConfigFunction } from '@markdoc/markdoc';

export const isNotJavascriptFramework: ConfigFunction = {
    transform(_, context) {
        const pageFramework = context.variables?.framework;
        return pageFramework !== 'javascript';
    },
};
