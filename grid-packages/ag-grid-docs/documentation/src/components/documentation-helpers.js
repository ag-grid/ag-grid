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
export const convertUrl = (href, framework) => {
    const link = href || '';

    if (link.includes('/static/')) { return link; }

    return link.startsWith('/') ?
        // strip the prefix is case it's been applied, before creating the proper URL
        withPrefix(convertToFrameworkUrl(href.replace(prefixRegex, '/'), framework)) :
        href;
}

/**
 * Converts a subset of Markdown so that it can be used in JSON files.
 */
export const convertMarkdown = (content, framework) => content
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => `<a href="${convertUrl(href, framework)}">${text}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
