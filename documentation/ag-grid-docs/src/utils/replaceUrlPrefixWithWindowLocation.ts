import { SITE_URL } from '@constants';

export function replaceUrlPrefixWithWindowLocation(text: string) {
    const windowUrl = window.location.origin;
    return text.replaceAll(SITE_URL, windowUrl);
}
