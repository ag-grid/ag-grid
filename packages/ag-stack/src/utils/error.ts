/**
 * Throws the one error collected, or an `AggregateError` of every distinct one; does nothing for none.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _throwErrors(errors: unknown[]): void {
    const unique = Array.from(new Set(errors));
    if (unique.length === 1) {
        throw unique[0];
    }
    if (unique.length > 1) {
        throw new AggregateError(unique);
    }
}
