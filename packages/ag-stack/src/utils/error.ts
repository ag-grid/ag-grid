/**
 * Throws the one error collected, or an `AggregateError` of every distinct one; does nothing for none.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _throwErrors(errors: unknown[]): void {
    if (errors.length === 1) {
        throw errors[0];
    }
    if (errors.length > 1) {
        const unique = Array.from(new Set(errors));
        throw unique.length === 1 ? unique[0] : new AggregateError(unique);
    }
}
