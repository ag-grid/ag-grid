/**
 * Rewrite the current URL, or attach page state to the current entry, without navigating.
 *
 * Astro's `<ClientRouter />` tracks its position in session history through `history.state`,
 * and its popstate handler bails out when that state is missing. A direct
 * `history.replaceState(null, '', url)` therefore disables back and forward for the whole
 * page: the browser moves the URL, but the router never swaps the document. A partial state
 * such as `{}` survives the null check but loses the index that distinguishes a back
 * traversal from a forward one.
 *
 * Pass `statePatch` to store page state alongside the router's own bookkeeping - it spreads
 * unknown keys through untouched, so both survive in the same entry. Omit `url` to leave the
 * address bar alone and patch state only.
 */
export function replaceHistoryUrl(url?: string | URL, statePatch?: Record<string, unknown>): void {
    const state = statePatch ? { ...history.state, ...statePatch } : history.state;
    history.replaceState(state, '', url);
}
