export function getRelativeUrl(url: string) {
    let relativeUrl = url;
    if (url.startsWith('/')) {
        relativeUrl = `.${url}`;
    } else if (url.startsWith('../')) {
        relativeUrl = url.slice(1);
    }

    return relativeUrl;
}
