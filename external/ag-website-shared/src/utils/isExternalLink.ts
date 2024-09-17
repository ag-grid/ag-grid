export function isExternalLink(url: string) {
    return url.startsWith('http') || url.startsWith('mailto');
}
