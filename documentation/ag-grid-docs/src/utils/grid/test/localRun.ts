const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]'];

/** Whether the run serves the checkout itself (the dev server or a local preview), rather than a deployed build. */
export function isLocalRun(url: string): boolean {
    try {
        return LOCAL_HOSTNAMES.includes(new URL(url).hostname);
    } catch {
        // A URL that does not parse is not one we can treat as local.
        return false;
    }
}
