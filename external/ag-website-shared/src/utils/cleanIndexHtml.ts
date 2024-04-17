import { SITE_URL } from '@constants';

function replaceUrlPrefixWithWindowLocation(text: string) {
    const windowUrl = window.location.origin;
    return text.replaceAll(SITE_URL, windowUrl);
}

export const cleanIndexHtml = (htmlFile: string) => {
    return replaceUrlPrefixWithWindowLocation(htmlFile).replace(/<script.*\/@vite\/client"><\/script>/g, '');
};
