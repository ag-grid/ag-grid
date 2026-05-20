import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

const ASSETS_BASE = '/images/campaigns/bryntum-products';
const BRYNTUM_ROOT = 'https://bryntum.com';

export const resolveBryntumImage = (src: string | undefined, productSlug: string): string => {
    if (!src) {
        return '';
    }
    if (src.startsWith('http')) {
        return src;
    }

    const assetsPrefix = '../assets/';
    if (src.startsWith(assetsPrefix)) {
        const remainder = src.slice(assetsPrefix.length);
        return urlWithBaseUrl(`${ASSETS_BASE}/${remainder}`);
    }

    if (src.startsWith('/images/')) {
        return urlWithBaseUrl(src);
    }

    const filename = src.split('/').pop() ?? src;
    return urlWithBaseUrl(`${ASSETS_BASE}/${productSlug}/${filename}`);
};

export const resolveBryntumHref = (href: string | undefined): string => {
    if (!href) {
        return '#';
    }
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
        return href;
    }
    if (href.startsWith('/')) {
        return `${BRYNTUM_ROOT}${href}`;
    }
    return `${BRYNTUM_ROOT}/${href}`;
};
