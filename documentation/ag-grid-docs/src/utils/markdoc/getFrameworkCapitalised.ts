import type { ConfigFunction } from '@markdoc/markdoc';

import { FRAMEWORK_DISPLAY_TEXT } from '../../../src/constants';

export const getFrameworkCapitalised: ConfigFunction = {
    transform(_, context) {
        return FRAMEWORK_DISPLAY_TEXT[context.variables?.framework as keyof typeof FRAMEWORK_DISPLAY_TEXT];
    },
};
