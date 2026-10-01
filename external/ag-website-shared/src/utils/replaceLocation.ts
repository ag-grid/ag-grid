/**
 * Redirect the page with `location.replace`, for pages that redirect as soon as they load.
 *
 * In dev, Astro's `<ClientRouter />` preloads the next page in a hidden iframe and waits for it to
 * load. Redirecting only the iframe would leave that wait hanging, so redirect its parent instead.
 */
export function replaceLocation(url: string) {
    (window.frameElement ? window.parent : window).location.replace(url);
}
