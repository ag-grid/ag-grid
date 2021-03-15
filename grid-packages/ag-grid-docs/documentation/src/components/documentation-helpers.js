import { withPrefix } from 'gatsby';
import convertToFrameworkUrl from 'utils/convert-to-framework-url';

export const inferType = value => {
    if (value == null) {
        return null;
    }

    if (Array.isArray(value)) {
        return value.length ? `${inferType(value[0])}[]` : 'object[]';
    }

    return typeof value;
};

const prefixRegex = new RegExp(`^${withPrefix('/')}`);

/**
 * Converts a root-based page link (e.g. /getting-started/) into one which is correct for the website
 * (e.g. /javascript-grid/getting-started/).
 */
export const convertUrl = (href, framework) => href.startsWith('/') ?
    // strip the prefix is case it's been applied, before creating the proper URL
    withPrefix(convertToFrameworkUrl(href.replace(prefixRegex, '/'), framework)) :
    href;