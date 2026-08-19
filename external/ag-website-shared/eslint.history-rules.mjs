/**
 * Astro's ClientRouter stores its history index and scroll offsets in `history.state`. A raw
 * write replaces them, after which its popstate handler either bails out or reads every
 * traversal as a "back", silently breaking back/forward for the whole page.
 *
 * Shared by the ag-website-shared config and each site's own config, so both halves of a
 * website enforce the same invariant from one definition.
 */
const message =
    'Use replaceHistoryUrl() from @ag-website-shared/utils/historyUrl - a raw history write discards the router state that back/forward depends on.';

const methods = '/^(pushState|replaceState)$/';

export const noRawHistoryWrites = [
    // `history.pushState(...)`
    {
        selector: `CallExpression > MemberExpression.callee[object.name='history'][property.name=${methods}]`,
        message,
    },
    // `window.history.pushState(...)`, `globalThis.history.pushState(...)`
    {
        selector: `CallExpression > MemberExpression.callee[object.property.name='history'][property.name=${methods}]`,
        message,
    },
];
